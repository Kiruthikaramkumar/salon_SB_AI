import os
from app import create_app
from app.extensions import db
from app.models import Service, Stylist, BusinessHours

app = create_app()

def init_db():
    """Create tables if they don't exist and seed initial database content."""
    with app.app_context():
        try:
            db.create_all()
            print("[MySQL] Tables checked/created successfully.")
            
            # Seed default services
            if Service.query.count() == 0:
                default_services = [
                    Service(name='Haircut', price=200, duration_minutes=30),
                    Service(name='Beard Trim', price=150, duration_minutes=25),
                    Service(name='Shave', price=100, duration_minutes=20),
                    Service(name='Head Massage', price=250, duration_minutes=45),
                    Service(name='Hair Coloring', price=500, duration_minutes=60),
                    Service(name='Styling', price=300, duration_minutes=40),
                ]
                db.session.bulk_save_objects(default_services)
                db.session.commit()
                print("[MySQL] Default services seeded.")
                
            # Seed default stylists if none exist
            if Stylist.query.count() == 0:
                default_stylists = [
                    Stylist(name='Ananya', is_active=True),
                    Stylist(name='Rahul', is_active=True),
                    Stylist(name='Priya', is_active=True),
                ]
                db.session.bulk_save_objects(default_stylists)
                db.session.commit()
                print("[MySQL] Default stylists seeded.")
                
            # Seed default business hours (Monday to Sunday, 9 AM to 8 PM)
            if BusinessHours.query.count() == 0:
                from datetime import time
                default_hours = []
                for day in range(7):
                    default_hours.append(BusinessHours(
                        day_of_week=day,
                        open_time=time(9, 0),
                        close_time=time(20, 0)
                    ))
                db.session.bulk_save_objects(default_hours)
                db.session.commit()
                print("[MySQL] Default business hours seeded (9 AM - 8 PM).")
                
        except Exception as e:
            print(f"[MySQL ERROR] Database initialization failed: {e}")

if __name__ == '__main__':
    # Initialize DB on startup
    init_db()
    
    # Check port and debug mode
    is_debug = os.environ.get('FLASK_DEBUG') == '1' or True
    port = int(os.environ.get('PORT', 3000))
    
    print(f"Starting Flask Salon Merged Backend Server")
    print(f"Running on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=is_debug)
