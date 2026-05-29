from app.utils.logger import logger

def send_sms_confirmation(phone: str, message: str):
    """Mock implementation for SMS sending (e.g. Twilio/Exotel SMS)"""
    logger.info(f"Mock SMS sent to {phone}: {message}")
    return True

def send_whatsapp_confirmation(phone: str, message: str):
    """Mock implementation for WhatsApp sending"""
    logger.info(f"Mock WhatsApp sent to {phone}: {message}")
    return True

def send_email_confirmation(email: str, subject: str, message: str):
    """Mock implementation for Email sending"""
    logger.info(f"Mock Email sent to {email}: Subject: {subject}")
    return True
