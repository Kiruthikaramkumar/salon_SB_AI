import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, Check, Loader2, ArrowLeft, Lock } from 'lucide-react';

const PaymentGateway = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, amount, plan, name } = location.state || {};

  const [paymentState, setPaymentState] = useState('checkout'); // checkout, processing, success, error
  const [errorMsg, setErrorMsg] = useState('');

  // Stripe form fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState(name || '');

  useEffect(() => {
    if (!amount || !plan) {
      navigate('/');
    }
  }, [amount, plan, navigate]);

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += value[i];
    }
    setCardNumber(formatted.slice(0, 19));
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setExpiry(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cardNumber.length < 19 || expiry.length < 5 || cvc.length < 3 || !cardName) {
      setErrorMsg('Your card number is incomplete.');
      return;
    }
    setErrorMsg('');
    setPaymentState('processing');
    
    // Simulate Stripe payment processing & verification
    setTimeout(async () => {
      try {
        const response = await axios.post('/api/membership/verify-payment', {
          user_id: userId
        });
        
        if (response.status === 200) {
          setPaymentState('success');
          setTimeout(() => {
            navigate('/');
          }, 3000);
        }
      } catch (err) {
        setPaymentState('error');
        setErrorMsg('Your card was declined. Please try a different payment method.');
      }
    }, 2500);
  };

  if (!amount) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      
      {/* LEFT COLUMN: Summary */}
      <div className="hidden lg:flex w-1/2 p-12 lg:p-20 flex-col border-r border-gray-200 bg-[#fafafa]">
        <div className="flex-1 max-w-md ml-auto w-full">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center text-gray-500 hover:text-gray-800 transition-colors mb-12 text-sm font-medium"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Glow Beauty
          </button>
          
          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-500 mb-1">Subscribe to</h1>
            <h2 className="text-3xl font-bold text-gray-900">{plan} Membership</h2>
          </div>

          <div className="flex items-baseline gap-2 mb-8 border-b border-gray-200 pb-8">
            <span className="text-4xl font-extrabold text-gray-900">₹{amount}</span>
            <span className="text-gray-500 font-medium">per year</span>
          </div>

          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex justify-between font-medium">
              <span>{plan} Membership</span>
              <span>₹{amount}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Subtotal</span>
              <span>₹{amount}</span>
            </div>
            <div className="flex justify-between font-medium text-gray-400">
              <span>Tax</span>
              <span>₹0.00</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-4 border-t border-gray-200">
              <span>Total due today</span>
              <span>₹{amount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Stripe Form */}
      <div className="w-full lg:w-1/2 bg-white p-6 lg:p-20 shadow-2xl lg:shadow-none flex flex-col justify-center relative">
        
        {paymentState === 'checkout' && (
          <div className="max-w-md w-full mx-auto lg:mx-0">
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="lg:hidden mb-8 pb-8 border-b border-gray-200">
              <h1 className="text-lg font-bold text-gray-500 mb-1">Subscribe to</h1>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{plan} Membership</h2>
              <div className="text-3xl font-extrabold text-gray-900">₹{amount}</div>
            </div>

            <h3 className="text-xl font-bold mb-6">Payment Details</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name on card</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card information</label>
                  <div className="border border-gray-300 rounded-md shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-shadow">
                    <div className="relative border-b border-gray-300">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full px-10 py-3 text-sm outline-none"
                        placeholder="1234 5678 9123 0000"
                      />
                    </div>
                    <div className="flex">
                      <input
                        type="text"
                        value={expiry}
                        onChange={handleExpiryChange}
                        className="w-1/2 px-4 py-3 text-sm outline-none border-r border-gray-300"
                        placeholder="MM / YY"
                      />
                      <input
                        type="text"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="w-1/2 px-4 py-3 text-sm outline-none"
                        placeholder="CVC"
                      />
                    </div>
                  </div>
                  {errorMsg && <p className="text-red-500 text-sm mt-2 flex items-center"><span className="mr-1">!</span> {errorMsg}</p>}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold py-4 rounded-md shadow-sm transition-colors text-lg"
              >
                Subscribe
              </button>

              <div className="flex items-center justify-center text-gray-400 text-xs mt-6">
                <Lock size={12} className="mr-1" />
                Payments are secure and encrypted
              </div>
            </form>
          </div>
        )}

        {paymentState === 'processing' && (
          <div className="max-w-md w-full mx-auto text-center space-y-6">
            <Loader2 className="animate-spin text-[#0070ba] mx-auto" size={48} />
            <h2 className="text-xl font-bold">Processing payment...</h2>
            <p className="text-gray-500 text-sm">Please do not close this window.</p>
          </div>
        )}

        {paymentState === 'success' && (
          <div className="max-w-md w-full mx-auto text-center space-y-6 animate-[modalEnter_0.4s_ease-out]">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={40} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Payment Successful</h2>
            <p className="text-gray-600 text-lg">Thank you, {cardName.split(' ')[0]}.</p>
            <p className="text-sm text-gray-500 border-t border-gray-200 pt-6 mt-6">Redirecting back to Glow Beauty Salon...</p>
          </div>
        )}

        {paymentState === 'error' && (
          <div className="max-w-md w-full mx-auto text-center space-y-6">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl font-bold">!</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Failed</h2>
            <p className="text-red-600 font-medium">{errorMsg}</p>
            <button 
              onClick={() => setPaymentState('checkout')}
              className="w-full border border-gray-300 text-gray-700 font-bold py-3 rounded-md mt-6 hover:bg-gray-50 transition-colors"
            >
              Try another card
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentGateway;
