import hmac
import hashlib
from functools import wraps
from flask import request, jsonify
from app.config import Config

def verify_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if api_key and api_key == Config.API_KEY:
            return f(*args, **kwargs)
        return jsonify({"error": "Unauthorized"}), 401
    return decorated_function

def verify_exotel_signature(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Exotel signature verification logic would go here
        # E.g., comparing calculated HMAC with X-Exotel-Signature
        return f(*args, **kwargs)
    return decorated_function
