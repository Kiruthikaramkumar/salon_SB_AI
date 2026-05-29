from flask import Blueprint, request, jsonify
from app.models import Customer
from app.extensions import db

customers_bp = Blueprint('customers', __name__)

@customers_bp.route("/customers", methods=["GET"])
@customers_bp.route("/api/customers", methods=["GET"])
def get_customers():
    """Get all customers."""
    customers = Customer.query.filter_by(is_deleted=False).all()
    result = []
    for c in customers:
        result.append({
            "id": c.id,
            "phone": c.phone,
            "name": c.name,
            "email": c.email,
            "created_at": c.created_at.isoformat() if c.created_at else None
        })
    return jsonify(result), 200

@customers_bp.route("/customers/<int:customer_id>", methods=["GET"])
@customers_bp.route("/api/customers/<int:customer_id>", methods=["GET"])
def get_customer(customer_id):
    """Get customer by ID."""
    c = Customer.query.get_or_404(customer_id)
    if c.is_deleted:
        return jsonify({"error": "Customer not found"}), 404
        
    return jsonify({
        "id": c.id,
        "phone": c.phone,
        "name": c.name,
        "email": c.email,
        "created_at": c.created_at.isoformat() if c.created_at else None
    }), 200

@customers_bp.route("/customers", methods=["POST"])
@customers_bp.route("/api/customers", methods=["POST"])
def create_customer():
    """Create new customer."""
    data = request.json or {}
    phone = data.get("phone")
    name = data.get("name")
    email = data.get("email")
    
    if not phone:
        return jsonify({"error": "Phone number is required"}), 400
        
    # Check if customer exists
    existing = Customer.query.filter_by(phone=phone).first()
    if existing:
        if existing.is_deleted:
            existing.is_deleted = False
            existing.name = name or existing.name
            existing.email = email or existing.email
            db.session.commit()
            return jsonify({
                "id": existing.id,
                "phone": existing.phone,
                "name": existing.name,
                "email": existing.email,
                "created_at": existing.created_at.isoformat()
            }), 200
        return jsonify({"error": "Customer with this phone number already exists"}), 409
        
    new_customer = Customer(
        phone=phone,
        name=name,
        email=email
    )
    
    try:
        db.session.add(new_customer)
        db.session.commit()
        return jsonify({
            "id": new_customer.id,
            "phone": new_customer.phone,
            "name": new_customer.name,
            "email": new_customer.email,
            "created_at": new_customer.created_at.isoformat()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
