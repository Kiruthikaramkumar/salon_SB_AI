from flask import Blueprint, request, jsonify
from app.models import CallLog, Customer, Booking
from app.extensions import db
from app.services.retell_service import fetch_retell_call, initiate_retell_call

calls_bp = Blueprint('calls', __name__)

@calls_bp.route("/call/initiate", methods=["POST"])
def initiate_call():
    """Initiate a Retell AI call."""
    try:
        data = request.json or {}
        phone_number = data.get('phone_number')
        customer_name = data.get('customer_name')
        
        if not phone_number:
            return jsonify({"error": "phone_number is required"}), 400
        
        # Initiate Retell call
        result = initiate_retell_call(phone_number, customer_name)
        
        if "error" in result:
            return jsonify(result), 400
            
        # Ensure customer exists in MySQL
        customer = Customer.query.filter_by(phone=phone_number).first()
        if not customer:
            customer = Customer(phone=phone_number, name=customer_name or f"Customer {phone_number}")
            db.session.add(customer)
            db.session.commit()
            
        # Log call initiation
        call_log = CallLog(
            call_id=result.get("call_id"),
            retell_call_id=result.get("call_id"),
            customer_id=customer.id,
            caller_number=phone_number,
            caller_name=customer.name,
            status='initiated'
        )
        db.session.add(call_log)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Call initiated successfully",
            "call": result
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@calls_bp.route("/call/<call_id>", methods=["GET"])
def get_call(call_id):
    """Retrieve details of a specific Retell AI call."""
    try:
        call_details = fetch_retell_call(call_id)
        if "error" in call_details:
            return jsonify(call_details), 400
        return jsonify(call_details), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@calls_bp.route("/call-logs", methods=["GET"])
def get_call_logs():
    """Retrieve call logs with optional filters."""
    try:
        status = request.args.get("status")
        customer_id = request.args.get("customer_id")
        booking_created = request.args.get("booking_created")
        
        query = CallLog.query
        if status:
            query = query.filter(CallLog.status == status)
        if customer_id:
            query = query.filter(CallLog.customer_id == customer_id)
        if booking_created is not None:
            # Handle standard boolean parsing from string/int
            if isinstance(booking_created, str):
                val = booking_created.lower() in ['true', '1']
            else:
                val = bool(int(booking_created))
            query = query.filter(CallLog.booking_created == val)
            
        call_logs = query.order_by(CallLog.created_at.desc()).all()
        result = []
        for cl in call_logs:
            result.append({
                "id": cl.id,
                "call_id": cl.call_id,
                "exotel_call_id": cl.exotel_call_id,
                "retell_call_id": cl.retell_call_id,
                "customer_id": cl.customer_id,
                "caller_number": cl.caller_number,
                "caller_name": cl.caller_name,
                "requested_service": cl.requested_service,
                "requested_datetime": cl.requested_datetime,
                "call_status": cl.status,
                "status": cl.status,
                "conversation_transcript": cl.transcript,
                "transcript": cl.transcript,
                "conversation_json": cl.structured_data,
                "structured_data": cl.structured_data,
                "booking_created": 1 if cl.booking_created else 0,
                "booking_id": cl.booking_id,
                "call_duration_seconds": cl.duration_seconds,
                "duration_seconds": cl.duration_seconds,
                "call_start_time": cl.call_start_time.isoformat() if cl.call_start_time else None,
                "call_end_time": cl.call_end_time.isoformat() if cl.call_end_time else None,
                "created_at": cl.created_at.isoformat() if cl.created_at else None,
                # Join fields
                "name": cl.customer.name if cl.customer else None,
                "email": cl.customer.email if cl.customer else None,
                "appointment_date": cl.booking.appointment_start.isoformat() if (cl.booking and cl.booking.appointment_start) else None,
                "service_name": cl.booking.service.name if (cl.booking and cl.booking.service) else None
            })
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@calls_bp.route("/call-logs/<int:call_log_id>", methods=["GET"])
def get_call_log_details(call_log_id):
    """Retrieve detailed call log by ID."""
    try:
        cl = CallLog.query.get_or_404(call_log_id)
        return jsonify({
            "id": cl.id,
            "call_id": cl.call_id,
            "exotel_call_id": cl.exotel_call_id,
            "retell_call_id": cl.retell_call_id,
            "customer_id": cl.customer_id,
            "caller_number": cl.caller_number,
            "caller_name": cl.caller_name,
            "requested_service": cl.requested_service,
            "requested_datetime": cl.requested_datetime,
            "call_status": cl.status,
            "status": cl.status,
            "conversation_transcript": cl.transcript,
            "transcript": cl.transcript,
            "conversation_json": cl.structured_data,
            "structured_data": cl.structured_data,
            "booking_created": 1 if cl.booking_created else 0,
            "booking_id": cl.booking_id,
            "call_duration_seconds": cl.duration_seconds,
            "duration_seconds": cl.duration_seconds,
            "call_start_time": cl.call_start_time.isoformat() if cl.call_start_time else None,
            "call_end_time": cl.call_end_time.isoformat() if cl.call_end_time else None,
            "created_at": cl.created_at.isoformat() if cl.created_at else None,
            # Join fields
            "name": cl.customer.name if cl.customer else None,
            "phone": cl.customer.phone if cl.customer else None,
            "email": cl.customer.email if cl.customer else None,
            "appointment_date": cl.booking.appointment_start.isoformat() if (cl.booking and cl.booking.appointment_start) else None,
            "service_name": cl.booking.service.name if (cl.booking and cl.booking.service) else None,
            "price": float(cl.booking.service.price) if (cl.booking and cl.booking.service and cl.booking.service.price) else 0.0
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
