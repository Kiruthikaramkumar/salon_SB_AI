from flask import Flask, jsonify
from flask_cors import CORS
from flasgger import Swagger
from app.config import Config
from app.extensions import db, celery
from app.utils.logger import logger

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    CORS(app)
    
    # Initialize extensions
    db.init_app(app)
    
    # Configure Celery
    celery.conf.update(app.config)
    
    # Initialize Swagger
    swagger = Swagger(app, template={
        "swagger": "2.0",
        "info": {
            "title": "Salon AI Voice Assistant API",
            "description": "API for automated salon appointment booking with Retell AI and Exotel",
            "version": "1.0.0"
        },
        "basePath": "/"
    })
    
    # Register blueprints
    from app.api.webhooks import webhooks_bp
    from app.api.bookings import bookings_bp
    from app.api.customers import customers_bp
    from app.api.services import services_bp
    from app.api.calls import calls_bp
    from app.api.stylists import stylists_bp
    from app.api.admin import admin_bp
    from app.api.auth import auth_bp
    from app.api.membership import membership_bp
    
    # Use url_prefix='/' for webhooks, bookings, customers, services, calls, stylists, admin, auth
    # because the routes themselves contain explicit /api/... paths or need root level mapping
    app.register_blueprint(webhooks_bp, url_prefix='/')
    app.register_blueprint(bookings_bp, url_prefix='/')
    app.register_blueprint(customers_bp, url_prefix='/')
    app.register_blueprint(services_bp, url_prefix='/')
    app.register_blueprint(calls_bp, url_prefix='/')
    app.register_blueprint(stylists_bp, url_prefix='/')
    app.register_blueprint(admin_bp, url_prefix='/')
    app.register_blueprint(auth_bp, url_prefix='/api') # Auth has prefix /api (e.g. /api/login)
    app.register_blueprint(membership_bp, url_prefix='/api') # Membership has prefix /api
    
    @app.route('/health', methods=['GET'])
    @app.route('/', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "salon-ai-booking-retell-merged",
            "version": "1.0.0",
            "integrations": {
                "retell_ai": "configured" if app.config['RETELL_API_KEY'] else "not_configured"
            }
        }), 200
        
    logger.info("Application successfully configured and initialized.")
    return app
