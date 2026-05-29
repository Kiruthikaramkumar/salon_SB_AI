import React from 'react';

const CallPopup = ({ isOpen, customerName, phoneNumber, onClose }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('call-booking-popup')) {
      onClose();
    }
  };

  return (
    <div 
      className="call-booking-popup active" 
      onClick={handleBackdropClick}
      style={{ display: 'flex', zIndex: 2000 }}
    >
      <div className="call-popup-content" style={{ transform: 'scale(1)' }}>
        <h3>Call {customerName || 'Customer'}</h3>
        <p>Ready to make a call? Connect with your customer directly.</p>
        <div className="call-number">{phoneNumber || '+91 9876543210'}</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <a href={`tel:${phoneNumber || '+919876543210'}`} className="btn call-link">
            <i className="fas fa-phone"></i> Call Now
          </a>
          <button 
            type="button" 
            className="btn btn-outline" 
            onClick={onClose}
            style={{ marginTop: '5px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallPopup;
