from flask import Blueprint, request, jsonify
from app.models import user

auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/register", methods=["POST"])
@auth_bp.route("/api/register", methods=["POST"])
def register():
    data = request.json or {}
    username = data.get("username")
    password = data.get("password")
    role = data.get("role")
    name = data.get("name")
    
    user = user(username=username, password=password, role=role, name=name)
    db.session.add(user)
    db.session.commit()
    return jsonify({"success": True, "role": role, "name": name, "message": "Login successful"}), 200

@auth_bp.route("/login", methods=["POST"])
@auth_bp.route("/api/login", methods=["POST"])
def login():
    data = request.json or {}
    username = data.get("username")
    password = data.get("password")
    
    user = user.query.filter_by(username=username).first()
    if user and user.password == password:
        return jsonify({"success": True, "role": user.role, "name": user.name, "message": "Login successful"}), 200
    return jsonify({"success": False, "message": "Invalid username or password"}), 401