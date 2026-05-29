from flask import Blueprint, request, jsonify, Response
from datetime import datetime, timedelta
from app.models import CallLog, Customer, Booking, Service
from app.extensions import db
from app.utils.logger import logger

webhooks_bp = Blueprint('webhooks', __name__)

@webhooks_bp.route("/exotel-sip", methods=["GET", "POST"])
@webhooks_bp.route("/api/webhooks/exotel-sip", methods=["GET", "POST"])
def exotel_sip_webhook():
    """Handle Exotel incoming call and redirect via SIP to Retell AI."""
    try:
        data = request.args if request.method == "GET" else (request.json if request.is_json else request.form)
        
        exotel_call_id = data.get("CallSid") or data.get("call_id")
        caller_number = data.get("From") or data.get("caller_number")
        
        if not caller_number or not exotel_call_id:
             return Response("<Response><Hangup/></Response>", mimetype="text/xml")
             
        logger.info(f"[EXOTEL SIP] Incoming call from {caller_number}")
        
        # Look up or create customer
        customer = Customer.query.filter_by(phone=caller_number).first()
        if not customer:
            customer = Customer(phone=caller_number, name=f"Customer {caller_number}")
            db.session.add(customer)
            db.session.commit()
            
        # Log call initiation
        call_log = CallLog(
            call_id=f"exo_{exotel_call_id}",
            exotel_call_id=exotel_call_id,
            customer_id=customer.id,
            caller_number=caller_number,
            caller_name=customer.name,
            status='initiated'
        )
        db.session.add(call_log)
        db.session.commit()
        
        from app.config import Config
        agent_id = Config.RETELL_AGENT_ID
        
        response_xml = f"""
        <Response>
            <Dial>
                <Sip>sip:{agent_id}@sip.retellai.com</Sip>
            </Dial>
        </Response>
        """
        return Response(response_xml, mimetype="text/xml")
        
    except Exception as e:
        logger.error(f"[EXOTEL SIP WEBHOOK ERROR] {str(e)}")
        return Response("<Response><Hangup/></Response>", mimetype="text/xml")

@webhooks_bp.route("/retell-event", methods=["POST"])
@webhooks_bp.route("/api/webhooks/retell-event", methods=["POST"])
def retell_event_webhook():
    """Handle Retell AI call lifecycle webhooks."""
    try:
        data = request.json or {}
        event = data.get('event')
        call_data = data.get('call', {})
        call_id = call_data.get('call_id')
        
        logger.info(f"[RETELL EVENT] {event} for call {call_id}")
        
        if event == 'call_ended':
            from app.services.retell_service import fetch_retell_call
            call_details = fetch_retell_call(call_id)
            
            if "error" not in call_details:
                transcript = call_details.get('transcript', '')
                duration = call_details.get('duration_ms', 0) // 1000
                recording_url = call_details.get('recording_url', '')
                
                log_entry = CallLog.query.filter(
                    (CallLog.call_id == call_id) | (CallLog.retell_call_id == call_id)
                ).first()
                
                if not log_entry:
                    log_entry = CallLog(call_id=call_id, retell_call_id=call_id, status='completed')
                    db.session.add(log_entry)
                
                log_entry.status = 'completed'
                log_entry.transcript = transcript
                log_entry.duration_seconds = duration
                log_entry.recording_url = recording_url
                db.session.commit()
                
                # Trigger Celery background parsing task
                try:
                    from app.tasks.async_tasks import process_transcript_async
                    process_transcript_async.delay(log_entry.id)
                except Exception as ce:
                    logger.error(f"[CELERY ERROR] process_transcript_async failed: {ce}")
                    
        return jsonify({"status": "received"}), 200
        
    except Exception as e:
        logger.error(f"[RETELL EVENT WEBHOOK ERROR] {str(e)}")
        return jsonify({"error": str(e)}), 500

@webhooks_bp.route("/retell-webhook", methods=["POST"])
@webhooks_bp.route("/webhook", methods=["POST"])
def retell_webhook():
    """Interactive webhook endpoint for custom Retell conversational responses."""
    try:
        data = request.json or {}
        call_id = data.get("call_id")
        transcript = (data.get("transcript") or "").lower()
        customer_phone = data.get("customer_phone")
        call_status = data.get("call_status", "ongoing")
        
        logger.info(f"[WEBHOOK] Call {call_id}: {call_status}")
        logger.info(f"[WEBHOOK] Transcript: {transcript}")
        
        if call_status == "ended":
            return jsonify({
                "response": None,
                "status": "call_ended",
                "timestamp": datetime.utcnow().isoformat()
            }), 200
            
        response_text = "Sorry, I didn't understand. Please try again."
        customer_id = None
        
        if customer_phone:
            # Simple name extraction: capitalize first word of input
            input_name = data.get("customer_name", "")
            words = input_name.split() if input_name else []
            customer_name = words[0].capitalize() if words else None
            
            customer = Customer.query.filter_by(phone=customer_phone).first()
            if not customer:
                customer = Customer(phone=customer_phone, name=customer_name or f"Customer {customer_phone}")
                db.session.add(customer)
                db.session.commit()
            elif customer_name and not customer.name:
                customer.name = customer_name
                db.session.commit()
                
            customer_id = customer.id
            
        # 1. Price Inquiry
        if any(word in transcript for word in ["price", "cost", "how much", "charges"]):
            from app.services.nlp_service import extract_service
            service = extract_service(transcript)
            if service:
                response_text = f"{service.name} costs {float(service.price)} rupees and takes {service.duration_minutes} minutes."
            else:
                response_text = "We offer haircuts, beard trims, shaves, head massages, hair coloring, and styling. Which service are you looking for?"
        
        # 2. Booking Request
        elif any(word in transcript for word in ["book", "appointment", "schedule", "reserve"]):
            from app.services.nlp_service import extract_service, extract_datetime
            service = extract_service(transcript)
            
            if not customer_phone:
                response_text = "I need your phone number to book an appointment. Could you please provide it?"
            elif not service:
                response_text = "Which service would you like? We offer haircuts, beard trims, shaves, massages, coloring, and styling."
            else:
                extracted_date = extract_datetime(transcript)
                appointment_date = extracted_date if extracted_date else (datetime.utcnow() + timedelta(hours=2))
                
                from app.services.booking_engine import check_business_hours, check_conflict, get_next_available_slot
                if not check_business_hours(appointment_date, service.duration_minutes) or check_conflict(service.id, appointment_date, service.duration_minutes):
                    # Check next available
                    next_slot = get_next_available_slot(service.id, service.duration_minutes, appointment_date)
                    if next_slot:
                        appointment_date = next_slot
                        formatted_time = appointment_date.strftime("%B %d at %I:%M %p")
                        response_text = f"That time slot is unavailable. I found the next available slot for {service.name} on {formatted_time}. Would you like to book that?"
                    else:
                        response_text = "I couldn't find any available slots in the next few days. Please contact our front desk."
                else:
                    # Create booking in MySQL
                    new_booking = Booking(
                        customer_id=customer_id,
                        service_id=service.id,
                        appointment_start=appointment_date,
                        appointment_end=appointment_date + timedelta(minutes=service.duration_minutes),
                        status='confirmed',
                        notes=f"Booked via voice call - {call_id}"
                    )
                    db.session.add(new_booking)
                    db.session.commit()
                    
                    formatted_time = appointment_date.strftime("%B %d at %I:%M %p")
                    response_text = f"Great! Your {service.name} appointment is booked for {formatted_time}. See you then!"
                    
                    # Update call log booking link
                    call_log = CallLog.query.filter(
                        (CallLog.call_id == call_id) | (CallLog.retell_call_id == call_id)
                    ).first()
                    if call_log:
                        call_log.booking_created = True
                        call_log.booking_id = new_booking.id
                        db.session.commit()
                        
        # 3. Hours Inquiry
        elif any(word in transcript for word in ["hours", "timing", "open", "close"]):
            response_text = "We're open from 9 AM to 8 PM, Monday to Sunday."
            
        # 4. Greeting
        elif any(word in transcript for word in ["hello", "hi", "hey", "good"]):
            response_text = "Hello! Welcome to our salon. How can I help you today? You can ask about services, prices, or book an appointment."
            
        return jsonify({
            "response": response_text,
            "customer_id": customer_id,
            "call_id": call_id,
            "timestamp": datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"[ERROR] Webhook processing failed: {str(e)}")
        return jsonify({
            "response": "Sorry, something went wrong. Please try again later.",
            "error": str(e)
        }), 500

@webhooks_bp.route("/exotel-webhook", methods=["GET", "POST"])
def exotel_webhook():
    """Handle Exotel incoming call audio stream (WebSockets)."""
    try:
        if request.method == "GET":
            data = request.args
        else:
            data = request.json if request.is_json else request.form

        logger.info(f"[EXOTEL WEBHOOK] METHOD: {request.method} DATA: {data}")

        exotel_call_id = data.get("CallSid") or data.get("call_id")
        caller_number = data.get("From") or data.get("caller_number")
        caller_name = data.get("CallerName") or data.get("caller_name")

        if not caller_number or not exotel_call_id:
            return Response("<Response><Hangup/></Response>", mimetype="text/xml")

        # Find or create customer
        customer = Customer.query.filter_by(phone=caller_number).first()
        if not customer:
            customer = Customer(phone=caller_number, name=caller_name or f"Customer {caller_number}")
            db.session.add(customer)
            db.session.commit()
        elif caller_name and not customer.name:
            customer.name = caller_name
            db.session.commit()

        # Log call initiation
        call_log = CallLog(
            call_id=f"exo_{exotel_call_id}",
            exotel_call_id=exotel_call_id,
            customer_id=customer.id,
            caller_number=caller_number,
            caller_name=customer.name,
            status='initiated'
        )
        db.session.add(call_log)
        db.session.commit()

        response_xml = """
        <Response>
            <Connect>
                <Stream url="wss://api.retellai.com/v1/stream" />
            </Connect>
        </Response>
        """
        return Response(response_xml, mimetype="text/xml")

    except Exception as e:
        logger.error(f"[EXOTEL WEBHOOK ERROR] {str(e)}")
        return Response(
            "<Response><Say>Sorry, something went wrong</Say><Hangup/></Response>",
            mimetype="text/xml"
        )

@webhooks_bp.route("/retell-voice-handler", methods=["POST"])
def retell_voice_handler():
    """Real-time voice processing webhook from Retell AI."""
    try:
        data = request.json or {}
        retell_call_id = data.get("call_id")
        transcript = (data.get("transcript") or "").lower()
        call_status = data.get("call_status", "ongoing")
        metadata = data.get("metadata", {})
        
        call_log_id = metadata.get("call_log_id")
        
        logger.info(f"[VOICE HANDLER] Call {retell_call_id}: {call_status}")
        
        log_entry = None
        if call_log_id:
            log_entry = CallLog.query.get(call_log_id)
        if not log_entry and retell_call_id:
            log_entry = CallLog.query.filter(
                (CallLog.call_id == retell_call_id) | (CallLog.retell_call_id == retell_call_id)
            ).first()
            
        if log_entry:
            log_entry.retell_call_id = retell_call_id
            existing = log_entry.transcript or ""
            log_entry.transcript = (existing + "\n" + transcript).strip()
            db.session.commit()
            
        if call_status == "ended":
            booking_created = False
            booking_id = None
            
            if log_entry:
                full_transcript = log_entry.transcript or ""
                from app.services.nlp_service import extract_service, extract_datetime
                service = extract_service(full_transcript)
                dt = extract_datetime(full_transcript)
                
                if service and dt and log_entry.customer_id:
                    from app.services.booking_engine import check_conflict
                    if not check_conflict(service.id, dt, service.duration_minutes):
                        new_booking = Booking(
                            customer_id=log_entry.customer_id,
                            service_id=service.id,
                            appointment_start=dt,
                            appointment_end=dt + timedelta(minutes=service.duration_minutes),
                            status='confirmed',
                            notes=f"Booked via voice call - {retell_call_id}"
                        )
                        db.session.add(new_booking)
                        db.session.commit()
                        booking_id = new_booking.id
                        booking_created = True
                        
                        log_entry.booking_created = True
                        log_entry.booking_id = booking_id
                        db.session.commit()
                        
                log_entry.status = 'completed'
                log_entry.structured_data = {
                    "service": service.name if service else None,
                    "datetime": dt.isoformat() if dt else None,
                    "booking_created": booking_created,
                    "booking_id": booking_id
                }
                db.session.commit()
                
            return jsonify({
                "status": "call_completed",
                "booking_created": booking_created,
                "message": "Call logged and booking processed"
            }), 200
            
        return jsonify({
            "status": "ongoing",
            "transcript_received": True,
            "call_log_id": log_entry.id if log_entry else None
        }), 200
        
    except Exception as e:
        logger.error(f"[VOICE HANDLER ERROR] {str(e)}")
        return jsonify({"error": "Failed to process voice data", "details": str(e)}), 500

@webhooks_bp.route("/exotel-hangup", methods=["POST"])
def exotel_hangup():
    """Handle call hangup/disconnection from Exotel."""
    try:
        data = request.json or {}
        exotel_call_id = data.get("CallSid")
        call_duration = data.get("CallDuration", 0)
        hangup_cause = data.get("HangupCause", "unknown")
        
        logger.info(f"[EXOTEL HANGUP] SID: {exotel_call_id} Duration: {call_duration}s Cause: {hangup_cause}")
        
        if exotel_call_id:
            log_entry = CallLog.query.filter_by(exotel_call_id=exotel_call_id).first()
            if log_entry:
                log_entry.status = 'ended'
                log_entry.duration_seconds = int(call_duration)
                log_entry.call_end_time = datetime.utcnow()
                db.session.commit()
                
        return jsonify({
            "success": True,
            "message": "Call disconnection logged",
            "call_duration": call_duration
        }), 200
        
    except Exception as e:
        logger.error(f"[EXOTEL HANGUP ERROR] {str(e)}")
        return jsonify({"error": str(e)}), 500
