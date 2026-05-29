from flask import Blueprint, request, jsonify
from app.models import Booking, Customer, Service
from app.extensions import db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route("/admin/bookings", methods=["GET"])
@admin_bp.route("/api/admin/bookings", methods=["GET"])
def get_admin_bookings():
    """Retrieve bookings formatted for the admin dashboard."""
    try:
        bookings = Booking.query.filter_by(is_deleted=False).all()
        result = []
        for b in bookings:
            cust = Customer.query.get(b.customer_id)
            serv = Service.query.get(b.service_id)
            result.append({
                "id": b.id,
                "customer": cust.name if cust else "N/A",
                "phone": cust.phone if cust else "N/A",
                "service": serv.name if serv else "N/A",
                "staff": b.stylist.name if b.stylist else "Unassigned",
                "time": b.appointment_start.strftime("%Y-%m-%d %H:%M"),
                "status": b.status
            })
        return jsonify({"bookings": result}), 200
    except Exception as e:
        return jsonify({"error": str(e), "bookings": []}), 500

@admin_bp.route("/admin/bookings/<int:booking_id>", methods=["PUT"])
@admin_bp.route("/api/admin/bookings/<int:booking_id>", methods=["PUT"])
def update_admin_booking_status(booking_id):
    """Update booking status from the admin dashboard."""
    data = request.json or {}
    status = data.get("status")
    if not status:
        return jsonify({"error": "Status is required"}), 400
        
    try:
        booking = Booking.query.get_or_404(booking_id)
        booking.status = status
        db.session.commit()
        return jsonify({"success": True, "message": "Status updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
