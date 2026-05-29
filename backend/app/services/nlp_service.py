import re
import dateparser
from app.models import Service

def extract_intent(transcript: str) -> str:
    """Identify customer intent from transcript."""
    transcript_lower = transcript.lower()
    
    if any(word in transcript_lower for word in ["book", "appointment", "schedule", "reserve"]):
        return "booking"
    elif any(word in transcript_lower for word in ["price", "cost", "how much", "charges"]):
        return "inquiry_price"
    elif any(word in transcript_lower for word in ["hours", "timing", "open", "close"]):
        return "inquiry_hours"
    elif any(word in transcript_lower for word in ["cancel"]):
        return "cancellation"
    elif any(word in transcript_lower for word in ["reschedule", "change"]):
        return "reschedule"
    
    return "general"

def extract_service(transcript: str):
    """Find matching service from transcript."""
    transcript_lower = transcript.lower()
    
    # Ideally, fetch all active services from DB and check
    services = Service.query.filter_by(is_active=True).all()
    for service in services:
        # Simplistic matching: if service name words are in transcript
        if service.name.lower() in transcript_lower:
            return service
            
        # Keyword mapping fallbacks
        if "coloring" in transcript_lower and service.name == "Hair Coloring":
            return service
        if "massage" in transcript_lower and service.name == "Head Massage":
            return service
            
    return None

def extract_datetime(transcript: str):
    """Parse relative and absolute dates using dateparser."""
    # Look for common date/time phrases
    # In a real NLP setup, we'd use NER (e.g. spaCy) to pull out time entities
    # For now, we try to parse the entire string or specific patterns
    
    # Simple regex to catch things like "tomorrow at 5 PM" or "Friday 2pm"
    # This is a basic implementation for demonstration
    time_matches = re.findall(r'(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)(.*?)(am|pm|\d+)', transcript.lower())
    
    if time_matches:
        # Try to parse the matched context
        phrase = " ".join(time_matches[0])
        parsed_date = dateparser.parse(phrase)
        if parsed_date:
            return parsed_date
            
    # Fallback to general parsing if specific phrases aren't matched
    parsed = dateparser.parse(transcript, settings={'PREFER_DATES_FROM': 'future'})
    return parsed
