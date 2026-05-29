import json
from app.extensions import celery, db
from app.models import CallLog, Customer, Booking
from app.services.notification_service import send_sms_confirmation
from app.utils.logger import logger
from datetime import datetime

@celery.task(bind=True, max_retries=3)
def process_transcript_async(self, call_log_id: int):
    """Background task to process transcript, extract structure, and update DB."""
    try:
        from app import create_app
        app = create_app()
        
        with app.app_context():
            log_entry = CallLog.query.get(call_log_id)
            if not log_entry or not log_entry.transcript:
                return False
                
            from app.services.nlp_service import extract_intent
            intent = extract_intent(log_entry.transcript)
            
            # Simple structure
            structured_data = {
                "intent_detected": intent,
                "processed_at": datetime.utcnow().isoformat(),
                "summary": log_entry.transcript[:100] + "..." if len(log_entry.transcript) > 100 else log_entry.transcript
            }
            
            log_entry.intent = intent
            log_entry.structured_data = structured_data
            
            db.session.commit()
            logger.info(f"Successfully processed transcript for call {call_log_id}")
            return True
            
    except Exception as e:
        logger.error(f"Error processing transcript for call log {call_log_id}: {e}")
        self.retry(exc=e, countdown=60) # Retry after 60s

@celery.task(bind=True, max_retries=3)
def send_booking_notification_async(self, booking_id: int):
    """Background task to send notification upon booking confirmation."""
    try:
        from app import create_app
        app = create_app()
        
        with app.app_context():
            booking = Booking.query.get(booking_id)
            if not booking:
                return False
                
            customer = Customer.query.get(booking.customer_id)
            if not customer or not customer.phone:
                return False
                
            msg = f"Hello {customer.name}, your appointment is confirmed for {booking.appointment_start.strftime('%Y-%m-%d %H:%M')}."
            
            # Use notification service
            send_sms_confirmation(customer.phone, msg)
            
            logger.info(f"Notification sent for booking {booking_id}")
            return True
            
    except Exception as e:
        logger.error(f"Error sending notification for booking {booking_id}: {e}")
        self.retry(exc=e, countdown=60)
