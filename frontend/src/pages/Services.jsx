import React from 'react';
import { Link } from 'react-router-dom';
import { useFadeIn } from '../hooks/useFadeIn';

const Services = () => {
  useFadeIn();

  const fullServices = [
    {
      icon: 'cut',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600',
      title: 'Haircut (Men/Women)',
      description: 'Expert haircuts tailored to your face shape and personality. Whether you\'re looking for a trendy bob, layers, or a classic cut, our stylists deliver perfection every time.',
      price: '₹500 - ₹1,500'
    },
    {
      icon: 'magic',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',
      title: 'Hair Styling',
      description: 'From everyday looks to special occasion updos, our stylists create beautiful hairstyles that enhance your natural beauty and complement your outfit.',
      price: '₹800 - ₹3,000'
    },
    {
      icon: 'palette',
      image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600',
      title: 'Hair Coloring',
      description: 'Transform your look with our premium hair coloring services. From subtle highlights to bold fashion colors, we use only the finest products for vibrant, long-lasting results.',
      price: '₹2,500 - ₹8,000'
    },
    {
      icon: 'spa',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600',
      title: 'Facial & Cleanup',
      description: 'Rejuvenate your skin with our luxurious facial treatments. We offer gold facials, diamond facials, anti-aging treatments, and deep cleansing for a radiant glow.',
      price: '₹1,200 - ₹5,000'
    },
    {
      icon: 'crown',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600',
      title: 'Bridal Makeup',
      description: 'Look absolutely stunning on your special day! Our bridal makeup includes HD makeup, airbrush makeup, hairstyling, and draping. We also offer pre-wedding packages.',
      price: '₹8,000 - ₹25,000'
    },
    {
      icon: 'user-tie',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600',
      title: 'Beard Styling',
      description: 'Perfect your look with our expert beard services including trimming, shaping, coloring, and styling. From classic to contemporary, we help you maintain the perfect beard.',
      price: '₹300 - ₹1,000'
    },
    {
      icon: 'hot-tub',
      image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600',
      title: 'Hair Spa',
      description: 'Indulge in relaxation with our nourishing hair spa treatments. Perfect for damaged hair, hair fall, and dryness. Walk out with silky, healthy, and manageable hair.',
      price: '₹1,500 - ₹4,000'
    },
    {
      icon: 'thread',
      image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600',
      title: 'Threading & Waxing',
      description: 'Get flawlessly shaped eyebrows and smooth skin with our threading and waxing services. We offer full body waxing, upper lip, chin, forehead threading, and more.',
      price: '₹100 - ₹2,500'
    }
  ];

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>Our Services</h1>
          <p>Premium beauty services crafted by experts</p>
        </div>
      </section>

      <section className="services-page">
        <div className="container">
          <div className="services-cards-grid">
            {fullServices.map((service, index) => (
              <div key={index} className="service-full-card fade-in">
                <img src={service.image} alt={service.title} />
                <div className="service-full-card-content">
                  <h3>
                    <i className={`fas fa-${service.icon}`} style={{ color: 'var(--gold)', marginRight: '10px' }}></i>
                    {service.title}
                  </h3>
                  <p>{service.description}</p>
                  <div className="service-full-card-footer">
                    <div className="price">{service.price}</div>
                    <a href="tel:+919876543210" className="btn">Book Now</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--gray-light)', padding: '100px 0', textAlign: 'center' }}>
        <div className="container">
          <div className="section-title fade-in">
            <h2>Book Your Appointment</h2>
            <p>Call us now or book online for a premium beauty experience</p>
          </div>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:+919876543210" className="btn">
              <i className="fas fa-phone"></i> Call +91 9876543210
            </a>
            <Link to="/membership" className="btn btn-outline">
              <i className="fas fa-crown"></i> View Membership Offers
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;
