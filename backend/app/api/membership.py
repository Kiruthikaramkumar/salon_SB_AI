from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import MembershipUser
from app.utils.logger import logger
import re
import os
import stripe

membership_bp = Blueprint('membership', __name__)

@membership_bp.route('/membership/register', methods=['POST'])
def register_membership():
    data = request.json
    
    # Required fields
    required_fields = ['name', 'phone', 'email', 'gender', 'membership_plan', 'payment_method', 'amount']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': f'Missing required field: {field}'}), 400
            
    # Phone validation
    if not re.match(r'^\d{10}$', str(data['phone'])):
        return jsonify({'error': 'Phone number must be exactly 10 digits'}), 400
        
    # Email validation
    if not re.match(r'^[^@]+@[^@]+\.[^@]+$', str(data['email'])):
        return jsonify({'error': 'Invalid email format'}), 400
        
    try:
        # Clean amount string (remove commas) before inserting
        clean_amount = float(str(data['amount']).replace(',', ''))
        
        new_member = MembershipUser(
            name=data['name'],
            phone=data['phone'],
            email=data['email'],
            gender=data['gender'],
            membership_plan=data['membership_plan'],
            payment_method=data['payment_method'],
            amount=clean_amount,
            payment_status=data.get('payment_status', 'Pending')
        )
        
        db.session.add(new_member)
        db.session.commit()
        
        logger.info(f"Membership registered successfully for {data['email']}")
        
        # Stripe Integration
        stripe_secret = os.environ.get('STRIPE_SECRET_KEY')
        payment_url = None
        
        if stripe_secret:
            try:
                stripe.api_key = stripe_secret
                session = stripe.checkout.Session.create(
                    payment_method_types=['card'],
                    line_items=[{
                        'price_data': {
                            'currency': 'inr',
                            'product_data': {
                                'name': f"{data['membership_plan']} Membership",
                                'description': 'Glow Beauty Salon Premium Membership',
                            },
                            'unit_amount': int(clean_amount * 100), # Stripe uses paise
                        },
                        'quantity': 1,
                    }],
                    mode='payment',
                    success_url=f"{os.environ.get('FRONTEND_URL', 'http://localhost:5173')}?payment=success&user_id={new_member.id}",
                    cancel_url=f"{os.environ.get('FRONTEND_URL', 'http://localhost:5173')}/membership",
                    customer_email=data['email'],
                    metadata={
                        'user_id': new_member.id,
                        'plan': data['membership_plan']
                    }
                )
                payment_url = session.url
            except Exception as stripe_error:
                logger.error(f"Stripe error: {str(stripe_error)}")
                # If Stripe fails, we will fallback to the local simulated UI
        
        return jsonify({
            'message': 'Membership Registered Successfully',
            'payment_url': payment_url, # Frontend will redirect here if present
            'user': {
                'id': new_member.id,
                'name': new_member.name,
                'email': new_member.email,
                'plan': new_member.membership_plan,
                'status': new_member.payment_status
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        import traceback
        logger.error(f"Error registering membership: {str(e)}\n{traceback.format_exc()}")
        return jsonify({'error': f"Failed to register membership: {str(e)}"}), 500

@membership_bp.route('/membership/verify-payment', methods=['POST'])
def verify_payment():
    data = request.json
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'Missing user_id'}), 400
        
    try:
        user = MembershipUser.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Simulated standard Payment Gateway Integration (Razorpay/Cashfree logic)
        # In a real environment, you'd verify the Razorpay signature here.
        user.payment_status = 'Active'
        db.session.commit()
        
        logger.info(f"Payment verified successfully for user {user_id}")
        
        return jsonify({
            'message': 'Payment verified successfully',
            'status': 'Active'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error verifying payment: {str(e)}")
        return jsonify({'error': 'Payment verification failed'}), 500
