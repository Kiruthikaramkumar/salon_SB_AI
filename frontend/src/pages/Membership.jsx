import React from 'react';
import { useFadeIn } from '../hooks/useFadeIn';
import { useNotification } from '../context/NotificationContext';
import MembershipModal from '../components/MembershipModal';
import { useState } from 'react';

const Membership = () => {
  useFadeIn();
  const { showNotification } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('Gold');

  const handleJoin = (e, membershipName) => {
    e.stopPropagation();
    console.log("Button clicked");
    console.log("JOIN NOW CLICKED:", membershipName);
    // Extract just "Gold", "Platinum", "Diamond" if possible, or just open modal
    let plan = 'Gold';
    if (membershipName.includes('Platinum')) plan = 'Platinum';
    if (membershipName.includes('Diamond')) plan = 'Diamond';
    setSelectedPlan(plan);
    console.log("Setting isModalOpen to TRUE");
    setIsModalOpen(true);
  };

  const plans = [
    {
      icon: 'medal',
      title: 'Gold Membership',
      subtitle: 'Perfect for regular visitors',
      price: '₹2,999',
      duration: '/year',
      features: [
        '10% off on all services',
        'Birthday special offer (20% off)',
        'Priority queue booking',
        'Free hair consultation',
        'Monthly newsletter with beauty tips',
        'Exclusive member-only promotions'
      ],
      featured: false
    },
    {
      icon: 'gem',
      title: 'Platinum Membership',
      subtitle: 'For the premium experience seeker',
      price: '₹5,999',
      duration: '/year',
      features: [
        '20% off on all services',
        'VIP priority booking (no wait time)',
        'Complimentary hair spa monthly',
        'Free bridal consultation',
        'Exclusive access to new treatments',
        'Personal beauty advisor',
        'Complimentary touch-ups'
      ],
      featured: true
    },
    {
      icon: 'crown',
      title: 'Diamond Membership',
      subtitle: 'Ultimate luxury experience',
      price: '₹9,999',
      duration: '/year',
      features: [
        '25% off on all services',
        'Premium VIP lounge access',
        'Unlimited priority bookings',
        'Monthly complimentary treatments',
        'Home service option (select services)',
        'Personal stylist consultation',
        'Early access to new services'
      ],
      featured: false
    }
  ];

  const bridalPackages = [
    {
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
      title: 'Essential Bridal Package',
      includes: 'Bridal makeup, hairstyling, draping, mehendi coordination, pre-bridal facial (3 sessions), complete grooming',
      price: '₹25,000'
    },
    {
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600',
      title: 'Premium Bridal Package',
      includes: 'HD/Airbrush bridal makeup, engagement look, reception look, mehendi makeup, hair spa, nail art, pre-bridal package (5 sessions), body massage',
      price: '₹45,000'
    },
    {
      image: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=600',
      title: 'Luxury Bridal Package',
      includes: 'Complete wedding week services, multiple look changes, family makeup, bridesmaid packages, Mehendi artist coordination, pre-wedding skin treatments, hair care, and more',
      price: '₹75,000'
    }
  ];

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>Membership Plans</h1>
          <p>Exclusive offers and priority access for our valued members</p>
        </div>
      </section>

      <section className="membership-section">
        <div className="container">
          <div className="membership-grid">
            {plans.map((plan, idx) => (
              <div key={idx} className={`membership-card ${plan.featured ? 'featured' : ''} fade-in`}>
                {plan.featured && (
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '-35px',
                    background: 'var(--gold)',
                    color: 'white',
                    padding: '8px 40px',
                    transform: 'rotate(45deg)',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}>
                    BEST VALUE
                  </div>
                )}
                <div 
                  className="membership-icon" 
                  style={plan.featured ? { background: 'var(--white)' } : {}}
                >
                  <i 
                    className={`fas fa-${plan.icon}`} 
                    style={plan.featured ? { color: 'var(--gold)' } : {}}
                  ></i>
                </div>
                <h3>{plan.title}</h3>
                <p className="subtitle">{plan.subtitle}</p>
                <div className="membership-price">
                  {plan.price}
                  <span>{plan.duration}</span>
                </div>
                <ul 
                  className="membership-features"
                  style={plan.featured ? { color: 'rgba(255, 255, 255, 0.8)' } : {}}
                >
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx}>{feature}</li>
                  ))}
                </ul>
                <button 
                  className="btn join-btn relative z-50 cursor-pointer" 
                  onClick={(e) => handleJoin(e, plan.title)}
                >
                  Join Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bridal-packages">
        <div className="container">
          <div className="section-title fade-in">
            <h2>Bridal Package Offers</h2>
            <p>Complete bridal beauty packages for your special day</p>
          </div>
          <div className="bridal-grid">
            {bridalPackages.map((pkg, idx) => (
              <div key={idx} className="bridal-card fade-in">
                <img src={pkg.image} alt={pkg.title} />
                <div className="bridal-card-content">
                  <h3>{pkg.title}</h3>
                  <p className="includes">Includes:</p>
                  <p>{pkg.includes}</p>
                  <div className="service-full-card-footer">
                    <div className="price">{pkg.price}</div>
                    <button 
                      className="btn join-btn relative z-50 cursor-pointer" 
                      onClick={(e) => handleJoin(e, pkg.title)}
                    >
                      Book Package
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'linear-gradient(135deg, var(--black), var(--black-light))', padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <div className="fade-in" style={{ color: 'white' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Not Sure Which Plan?</h2>
            <p style={{ opacity: 0.8, marginBottom: '30px', fontSize: '1.1rem' }}>
              Let us help you choose the perfect membership plan for your needs.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="tel:+919876543210" className="btn">
                <i className="fas fa-phone"></i> Call Us
              </a>
              <a href="https://wa.me/919876543210" className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>
                <i className="fab fa-whatsapp"></i> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <MembershipModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialPlan={selectedPlan}
      />
    </>
  );
};

export default Membership;
