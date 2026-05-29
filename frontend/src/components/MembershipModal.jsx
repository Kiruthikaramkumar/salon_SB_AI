import React, { useState } from 'react';
import axios from 'axios';
import { X, User, Phone, Mail, CreditCard, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MembershipModal = ({ isOpen, onClose, initialPlan = 'Gold' }) => {
  console.log("MembershipModal rendering, isOpen:", isOpen);
  const navigate = useNavigate();

  const plans = {
    'Gold': '2,999',
    'Platinum': '5,999',
    'Diamond': '9,999'
  };

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'Female',
    membership_plan: initialPlan,
    payment_method: 'Stripe', // Implicitly set to Stripe
    amount: plans[initialPlan] || '2,999'
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Update formData if initialPlan changes while modal is open (or reopened)
  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      membership_plan: initialPlan,
      amount: plans[initialPlan] || '2,999'
    }));
  }, [initialPlan]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'membership_plan') {
        newData.amount = plans[value];
      }
      return newData;
    });
    setError('');
  };

  const validatePhone = (phone) => {
    return /^\d{10}$/.test(phone);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.email || !formData.amount) {
      setError('Please fill all required fields');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log("Submit clicked, calling backend API...");
      const response = await axios.post('/api/membership/register', formData);
      console.log("Backend response received:", response.data);
      
      if (response.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          
          console.log("Stripe payment_url from backend:", response.data.payment_url);
          // If backend provided a Stripe checkout URL, redirect there directly
          if (response.data.payment_url) {
            console.log("Redirecting to Stripe Checkout...");
            window.location.href = response.data.payment_url;
          } else {
            console.log("No Stripe URL provided (missing STRIPE_SECRET_KEY in backend/.env). Falling back to simulated UI.");
            // Fallback to our simulated UI if no keys are configured
            navigate('/payment', { 
              state: { 
                userId: response.data.user?.id,
                amount: formData.amount,
                plan: formData.membership_plan,
                name: formData.name
              } 
            });
          }
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 z-[99999]">
      {/* Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Modal Content */}
      <div className="membership-modal relative bg-[#1a1a1a]/95 backdrop-blur-xl border border-[#D4AF37]/30 shadow-[0_0_40px_rgba(212,175,55,0.15)] animate-[modalEnter_0.3s_ease-out] max-h-[95vh] overflow-y-auto overflow-x-hidden">
        
        {/* Header */}
        <div className="text-center relative mb-6">
          <button 
            onClick={onClose}
            className="absolute -top-2 -right-2 text-white/50 hover:text-[#D4AF37] transition-all"
          >
            <X size={24} />
          </button>
          <h2 className="text-3xl font-bold text-[#D4AF37] font-serif tracking-wide drop-shadow-md">Join the Elite</h2>
          <p className="text-gray-300 text-sm mt-1">Register for Premium Salon Membership</p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-[#D4AF37]/20 text-[#D4AF37] rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Membership Registered Successfully</h3>
              <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" />
                Redirecting to payment gateway...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="membership-form">
              
              {error && (
                <div className="form-group full-width bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">
                  {error}
                </div>
              )}

              <div className="form-group full-width relative">
                <label className="block text-sm text-gray-300 font-medium mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute top-1/2 -translate-y-1/2 left-3 pointer-events-none text-[#D4AF37]">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="placeholder-gray-500"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="form-group relative">
                <label className="block text-sm text-gray-300 font-medium mb-1.5">Phone Number</label>
                <div className="relative">
                  <div className="absolute top-1/2 -translate-y-1/2 left-3 pointer-events-none text-[#D4AF37]">
                    <Phone size={18} />
                  </div>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength="10"
                    className="placeholder-gray-500"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="block text-sm text-gray-300 font-medium mb-1.5">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="cursor-pointer appearance-none bg-no-repeat pl-3"
                  style={{ backgroundPosition: 'right 12px center', backgroundSize: '12px', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23D4AF37%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")' }}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label className="block text-sm text-gray-300 font-medium mb-1.5">Email ID</label>
                <div className="relative">
                  <div className="absolute top-1/2 -translate-y-1/2 left-3 pointer-events-none text-[#D4AF37]">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="placeholder-gray-500"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="block text-sm text-gray-300 font-medium mb-1.5">Selected Plan</label>
                <select
                  name="membership_plan"
                  value={formData.membership_plan}
                  disabled
                  className="appearance-none bg-no-repeat pl-3 opacity-80 cursor-not-allowed"
                >
                  <option value={initialPlan}>{initialPlan} Membership</option>
                </select>
              </div>

              <div className="amount-section form-group full-width bg-gradient-to-r from-[#2d2d2d] to-[#1a1a1a] rounded-xl flex items-center justify-between border border-[#D4AF37]/30 shadow-inner">
                <span className="text-gray-300 font-medium">Total Amount</span>
                <span className="text-[#D4AF37] text-2xl font-bold flex items-center">
                  <span className="text-xl mr-1 font-sans text-[#D4AF37]/80">₹</span>
                  {formData.amount}
                </span>
              </div>

              <div className="button-group form-group full-width">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 h-[45px] rounded-xl border border-[#D4AF37]/30 text-[#D4AF37] font-semibold hover:bg-[#D4AF37]/10 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] h-[45px] bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5 mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembershipModal;
