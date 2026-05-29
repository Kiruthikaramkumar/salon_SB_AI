from datetime import datetime, timedelta
from app.models import Booking, BusinessHours
from app.extensions import db

def check_business_hours(appointment_start: datetime, duration_minutes: int) -> bool:
    """Check if the appointment falls within business hours."""
    appointment_end = appointment_start + timedelta(minutes=duration_minutes)
    
    # Get business hours for the day
    day_of_week = appointment_start.weekday()
    hours = BusinessHours.query.filter_by(day_of_week=day_of_week).first()
    
    if not hours:
        # Default hours if not defined: 9 AM to 8 PM
        open_time = datetime.strptime("09:00", "%H:%M").time()
        close_time = datetime.strptime("20:00", "%H:%M").time()
    else:
        open_time = hours.open_time
        close_time = hours.close_time
        
    start_time = appointment_start.time()
    end_time = appointment_end.time()
    
    return start_time >= open_time and end_time <= close_time

def check_conflict(service_id: int, appointment_start: datetime, duration_minutes: int, stylist_id: int = None) -> bool:
    """Check if there is a conflict for the given time slot."""
    appointment_end = appointment_start + timedelta(minutes=duration_minutes)
    
    # Check for overlapping bookings
    query = Booking.query.filter(
        Booking.status == 'confirmed',
        Booking.is_deleted == False,
        Booking.appointment_start < appointment_end,
        Booking.appointment_end > appointment_start
    )
    
    if stylist_id:
        query = query.filter(Booking.stylist_id == stylist_id)
        
    conflicting_bookings = query.count()
    return conflicting_bookings > 0

def get_next_available_slot(service_id: int, duration_minutes: int, desired_start: datetime) -> datetime:
    """Find the next available slot after desired_start."""
    # Simplified logic: increment by 30 mins until a free slot is found
    current_time = desired_start
    # Round to next 30 min interval
    minute_offset = 30 - (current_time.minute % 30)
    current_time = current_time + timedelta(minutes=minute_offset)
    
    # Limit search to 7 days
    max_search_days = 7
    end_search = current_time + timedelta(days=max_search_days)
    
    while current_time < end_search:
        if check_business_hours(current_time, duration_minutes):
            if not check_conflict(service_id, current_time, duration_minutes):
                return current_time
        current_time += timedelta(minutes=30)
        
    return None
