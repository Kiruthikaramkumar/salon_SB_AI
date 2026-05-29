from datetime import datetime
from app.extensions import db

class Enums(db.Enum):
    admin = "admin"
    staff = "staff"
    customer = "customer"
    

class user(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(50), nullable=False)
    role = db.Column(db.Enum('admin', 'staff', 'customer'), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Customer(db.Model):
    __tablename__ = 'customers'
    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(20), unique=True, nullable=False, index=True)
    name = db.Column(db.String(255))
    email = db.Column(db.String(255))
    preferences = db.Column(db.JSON, nullable=True)
    is_deleted = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    bookings = db.relationship('Booking', backref='customer', lazy=True)
    call_logs = db.relationship('CallLog', backref='customer', lazy=True)

class Service(db.Model):
    __tablename__ = 'services'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    duration_minutes = db.Column(db.Integer, default=30)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    bookings = db.relationship('Booking', backref='service', lazy=True)

class Stylist(db.Model):
    __tablename__ = 'stylists'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    bookings = db.relationship('Booking', backref='stylist', lazy=True)

class BusinessHours(db.Model):
    __tablename__ = 'business_hours'
    id = db.Column(db.Integer, primary_key=True)
    day_of_week = db.Column(db.Integer, nullable=False) # 0=Monday, 6=Sunday
    open_time = db.Column(db.Time, nullable=False)
    close_time = db.Column(db.Time, nullable=False)

class Booking(db.Model):
    __tablename__ = 'bookings'
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    stylist_id = db.Column(db.Integer, db.ForeignKey('stylists.id'), nullable=True)
    appointment_start = db.Column(db.DateTime, nullable=False, index=True)
    appointment_end = db.Column(db.DateTime, nullable=False, index=True)
    status = db.Column(db.String(50), default='confirmed', index=True) # confirmed, cancelled, completed
    notes = db.Column(db.Text, nullable=True)
    is_deleted = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CallLog(db.Model):
    __tablename__ = 'call_logs'
    id = db.Column(db.Integer, primary_key=True)
    call_id = db.Column(db.String(255), unique=True, index=True, nullable=True) # Retell call_id or exotel call_id
    exotel_call_id = db.Column(db.String(255), unique=True, index=True, nullable=True)
    retell_call_id = db.Column(db.String(255), unique=True, index=True, nullable=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=True)
    caller_number = db.Column(db.String(50), nullable=True)
    caller_name = db.Column(db.String(255), nullable=True)
    requested_service = db.Column(db.String(255), nullable=True)
    requested_datetime = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(50), default='initiated')
    duration_seconds = db.Column(db.Integer, nullable=True)
    recording_url = db.Column(db.String(1024), nullable=True)
    transcript = db.Column(db.Text, nullable=True)
    structured_data = db.Column(db.JSON, nullable=True)
    intent = db.Column(db.String(100), nullable=True)
    booking_created = db.Column(db.Boolean, default=False)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=True)
    call_start_time = db.Column(db.DateTime, default=datetime.utcnow)
    call_end_time = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    booking = db.relationship('Booking', backref='call_logs', lazy=True)

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    id = db.Column(db.Integer, primary_key=True)
    entity_type = db.Column(db.String(50)) # e.g. booking, customer
    entity_id = db.Column(db.Integer)
    action = db.Column(db.String(50)) # created, updated, deleted
    old_values = db.Column(db.JSON, nullable=True)
    new_values = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class MembershipUser(db.Model):
    __tablename__ = 'membership_users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    gender = db.Column(db.String(50), nullable=False)
    membership_plan = db.Column(db.String(100), nullable=False)
    payment_method = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_status = db.Column(db.String(50), default='Pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
