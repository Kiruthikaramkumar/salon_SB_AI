import requests
from app.config import Config
from app.utils.logger import logger

def fetch_retell_call(call_id: str):
    """Fetch call details from Retell AI"""
    if not Config.RETELL_API_KEY:
        return {"error": "Missing Retell API key"}
        
    headers = {
        'Authorization': f'Bearer {Config.RETELL_API_KEY}'
    }
    
    try:
        url = f"{Config.RETELL_API_BASE}/v1/get-phone-call/{call_id}"
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"[RETELL] API error fetching call {call_id}: {response.status_code} - {response.text}")
            return {"error": f"API error: {response.status_code}"}
            
    except Exception as e:
        logger.error(f"[RETELL] Request failed: {e}")
        return {"error": str(e)}

def initiate_retell_call(phone_number: str, customer_name: str = None, metadata: dict = None):
    """Initiate an outbound Retell call"""
    if not Config.RETELL_API_KEY or not Config.RETELL_AGENT_ID:
        return {"error": "Missing Retell API credentials"}
        
    headers = {
        'Authorization': f'Bearer {Config.RETELL_API_KEY}',
        'Content-Type': 'application/json'
    }
    
    payload_metadata = metadata or {}
    if customer_name:
        payload_metadata["customer_name"] = customer_name
    if "backend_webhook" not in payload_metadata:
        # Fallback webhook configuration for Retell custom LLM/webhook integrations
        payload_metadata["backend_webhook"] = f"{Config.BACKEND_URL}/retell-webhook"
        
    payload = {
        "agent_id": Config.RETELL_AGENT_ID,
        "phone_number": phone_number,
        "metadata": payload_metadata
    }
    
    try:
        url = f"{Config.RETELL_API_BASE}/v1/create-phone-call"
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        
        if response.status_code == 200:
            call_data = response.json()
            logger.info(f"[RETELL] Call initiated: {call_data.get('call_id')}")
            return {
                "success": True,
                "call_id": call_data.get("call_id"),
                "status": "initiated"
            }
        else:
            logger.error(f"[RETELL ERROR] {response.status_code}: {response.text}")
            return {"error": f"Retell API error: {response.status_code}"}
            
    except requests.exceptions.RequestException as e:
        logger.error(f"[RETELL ERROR] Request failed: {e}")
        return {"error": str(e)}
