from flask import Blueprint, request, jsonify
from app.models import Service
from app.extensions import db

services_bp = Blueprint('services', __name__)

@services_bp.route("/services", methods=["GET"])
@services_bp.route("/api/services", methods=["GET"])
def get_services():
    """Get all active services."""
    services = Service.query.filter_by(is_active=True).all()
    result = []
    for s in services:
        result.append({
            "id": s.id,
            "name": s.name,
            "price": float(s.price),
            "duration_minutes": s.duration_minutes,
            "created_at": s.created_at.isoformat() if s.created_at else None
        })
    return jsonify(result), 200

@services_bp.route("/services", methods=["POST"])
@services_bp.route("/api/services", methods=["POST"])
def create_service():
    """Create new service."""
    data = request.json or {}
    name = data.get("name")
    price = data.get("price")
    duration_minutes = data.get("duration_minutes", 30)
    
    if not name or price is None:
        return jsonify({"error": "Name and price are required"}), 400
        
    existing = Service.query.filter_by(name=name).first()
    if existing:
        if not existing.is_active:
            existing.is_active = True
            existing.price = price
            existing.duration_minutes = duration_minutes
            db.session.commit()
            return jsonify({
                "id": existing.id,
                "name": existing.name,
                "price": float(existing.price),
                "duration_minutes": existing.duration_minutes
            }), 200
        return jsonify({"error": "Service with this name already exists"}), 409
        
    new_service = Service(
        name=name,
        price=price,
        duration_minutes=duration_minutes
    )
    
    try:
        db.session.add(new_service)
        db.session.commit()
        return jsonify({
            "id": new_service.id,
            "name": new_service.name,
            "price": float(new_service.price),
            "duration_minutes": new_service.duration_minutes
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
