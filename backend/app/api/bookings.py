from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from app.models import Booking, Service, Customer
from app.extensions import db
from app.utils.security import verify_api_key
from app.services.booking_engine import check_conflict

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route("/bookings", methods=["GET"])
@bookings_bp.route("/api/bookings", methods=["GET"])
def get_bookings():
    """Get all bookings with filters."""
    status = request.args.get('status')
    
    query = Booking.query.filter_by(is_deleted=False)
    if status:
        query = query.filter_by(status=status)
        
    bookings = query.all()
    result = []
    for b in bookings:
        result.append({
            "id": b.id,
            "customer_id": b.customer_id,
            "service_id": b.service_id,
            "appointment_date": b.appointment_start.isoformat(),
            "start": b.appointment_start.isoformat(),
            "end": b.appointment_end.isoformat(),
            "status": b.status,
            "notes": b.notes,
            "name": b.customer.name if b.customer else "N/A",
            "phone": b.customer.phone if b.customer else "N/A",
            "service_name": b.service.name if b.service else "N/A",
            "price": float(b.service.price) if (b.service and b.service.price) else 0.0
        })
    return jsonify(result), 200

@bookings_bp.route("/bookings/<int:booking_id>", methods=["GET"])
@bookings_bp.route("/api/bookings/<int:booking_id>", methods=["GET"])
def get_booking(booking_id):
    """Get specific booking by ID."""
    b = Booking.query.get_or_404(booking_id)
    if b.is_deleted:
        return jsonify({"error": "Booking not found"}), 404
        
    return jsonify({
        "id": b.id,
        "customer_id": b.customer_id,
        "service_id": b.service_id,
        "appointment_date": b.appointment_start.isoformat(),
        "start": b.appointment_start.isoformat(),
        "end": b.appointment_end.isoformat(),
        "status": b.status,
        "notes": b.notes,
        "name": b.customer.name if b.customer else "N/A",
        "phone": b.customer.phone if b.customer else "N/A",
        "service_name": b.service.name if b.service else "N/A",
        "price": float(b.service.price) if (b.service and b.service.price) else 0.0
    }), 200

@bookings_bp.route("/bookings", methods=["POST"])
@bookings_bp.route("/api/bookings", methods=["POST"])
def create_booking():
    """Create a new booking supporting both frontend and agent integrations."""
    data = request.json or {}
    customer_id = data.get("customer_id")
    customer_name = data.get("customer_name")
    customer_phone = data.get("customer_phone")
    service_id = data.get("service_id")
    notes = data.get("notes")
    
    appointment_start_str = data.get("appointment_start") or data.get("appointment_date")
    
    if not service_id or not appointment_start_str:
        return jsonify({"error": "Missing service_id or appointment date/start"}), 400
        
    # Get or create customer
    if customer_id:
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({"error": "Customer not found"}), 404
    elif customer_phone:
        customer = Customer.query.filter_by(phone=customer_phone).first()
        if not customer:
            customer = Customer(name=customer_name or f"Guest_{customer_phone}", phone=customer_phone)
            db.session.add(customer)
            db.session.commit()
    else:
        return jsonify({"error": "customer_id or customer_phone is required"}), 400
        
    # Parse date
    try:
        try:
            appointment_start = datetime.fromisoformat(appointment_start_str.replace('Z', '+00:00'))
        except ValueError:
            appointment_start = datetime.strptime(appointment_start_str, "%Y-%m-%d %H:%M")
    except Exception:
        return jsonify({"error": "Invalid date format. Use ISO format or YYYY-MM-DD HH:MM"}), 400
        
    # Find service
    service = Service.query.get(service_id)
    if not service:
        return jsonify({"error": "Service not found"}), 404
        
    # Check conflict
    if check_conflict(service_id, appointment_start, service.duration_minutes):
        return jsonify({"error": "Time slot already booked"}), 409
        
    # Create booking
    appointment_end = appointment_start + timedelta(minutes=service.duration_minutes)
    new_booking = Booking(
        customer_id=customer.id,
        service_id=service_id,
        appointment_start=appointment_start,
        appointment_end=appointment_end,
        status='confirmed',
        notes=notes or 'Booked via API'
    )
    
    try:
        db.session.add(new_booking)
        db.session.commit()
        
        # Trigger background Celery tasks if available
        try:
            from app.tasks.async_tasks import send_booking_notification_async
            send_booking_notification_async.delay(new_booking.id)
        except Exception as e:
            # Celery broker might not be running in testing
            pass
            
        return jsonify({
            "success": True,
            "message": "Booking created successfully",
            "booking_id": new_booking.id,
            "id": new_booking.id,
            "customer_id": new_booking.customer_id,
            "service_id": new_booking.service_id,
            "appointment_date": new_booking.appointment_start.isoformat(),
            "status": new_booking.status
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@bookings_bp.route("/bookings/<int:booking_id>", methods=["PUT"])
@bookings_bp.route("/api/bookings/<int:booking_id>", methods=["PUT"])
def update_booking(booking_id):
    """Update booking details."""
    data = request.json or {}
    booking = Booking.query.get_or_404(booking_id)
    
    if 'status' in data:
        booking.status = data['status']
    if 'notes' in data:
        booking.notes = data['notes']
        
    try:
        db.session.commit()
        return jsonify({
            "id": booking.id,
            "customer_id": booking.customer_id,
            "service_id": booking.service_id,
            "appointment_date": booking.appointment_start.isoformat(),
            "status": booking.status,
            "notes": booking.notes
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@bookings_bp.route("/bookings/<int:booking_id>", methods=["DELETE"])
@bookings_bp.route("/api/bookings/<int:booking_id>", methods=["DELETE"])
def cancel_booking(booking_id):
    """Cancel booking (soft-delete)."""
    booking = Booking.query.get_or_404(booking_id)
    booking.status = 'cancelled'
    booking.is_deleted = True
    
    try:
        db.session.commit()
        return jsonify({"message": f"Booking {booking_id} cancelled successfully."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
