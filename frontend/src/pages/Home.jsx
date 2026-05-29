import React from 'react';
import { Link } from 'react-router-dom';
import { useFadeIn } from '../hooks/useFadeIn';
import { useNotification } from '../context/NotificationContext';

const Home = () => {
  useFadeIn();
  const { showNotification } = useNotification();

  const handleGalleryClick = (name) => {
    showNotification(`Viewing: ${name}`);
  };

  const services = [
    {
      badge: 'Popular',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600',
      title: "Women's Haircut & Hairstyles",
      description: 'Expert cuts and styling for every length and texture',
      price: 'Starting ₹500'
    },
    {
      badge: 'Trending',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600',
      title: "Men's Grooming",
      description: 'Classic and modern styles for the modern gentleman',
      price: 'Starting ₹300'
    },
    {
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600',
      title: 'Bridal Makeup',
      description: 'Stunning bridal looks for your special day',
      price: 'Starting ₹8,000'
    },
    {
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600',
      title: 'Skin Care & Facial',
      description: 'Rejuvenate your skin with premium treatments',
      price: 'Starting ₹1,200'
    },
    {
      badge: 'New',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',
      title: 'Hair Coloring & Spa',
      description: 'Transform your look with vibrant colors',
      price: 'Starting ₹2,500'
    }
  ];

  const galleryItems = [
    { name: 'Salon Ambiance', image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800' },
    { name: 'Hair Styling', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600' },
    { name: 'Spa Treatment', image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600' },
    { name: 'Makeup Session', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600' },
    { name: 'Hair Coloring', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600' },
    { name: 'Men\'s Grooming', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600' }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Regular Customer',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      text: '"Absolutely love the service here! The staff is incredibly skilled and the ambiance is so relaxing. My hair has never looked better!"'
    },
    {
      name: 'Rahul Verma',
      role: 'Regular Customer',
      rating: 4.5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      text: '"Best men\'s grooming in town! They always know exactly what I want. Great prices for premium quality service."'
    },
    {
      name: 'Anita Patel',
      role: 'Bridal Client',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      text: '"Did my bridal makeup and I looked stunning! The artists understood my vision perfectly. Highly recommended for brides!"'
    },
    {
      name: 'Vikram Singh',
      role: 'New Customer',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      text: '"First time here and I\'m impressed! The hair spa treatment was amazing. My hair feels so healthy and shiny now."'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to <span>Glow Beauty</span> Salon</h1>
          <p>Enhance Your Beauty With Experts - Where Style Meets Elegance</p>
          <div className="hero-buttons">
            <a href="tel:+919876543210" className="btn">
              <i className="fas fa-phone"></i> Call Now
            </a>
            <Link to="/services" className="btn btn-outline">Explore Services</Link>
          </div>
        </div>
        <div className="scroll-indicator">
          <span></span>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="services-preview">
        <div className="container">
          <div className="section-title fade-in">
            <h2>Our Services</h2>
            <p>Experience premium beauty services crafted by experts</p>
          </div>
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card fade-in">
                {service.badge && <span className="service-badge">{service.badge}</span>}
                <img src={service.image} alt={service.title} />
                <div className="service-card-content">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <div className="price">{service.price}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <Link to="/services" className="btn">View All Services</Link>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section">
        <div className="container">
          <div className="section-title fade-in">
            <h2>Our Gallery</h2>
            <p>Take a peek inside Glow Beauty Salon</p>
          </div>
          <div className="gallery-grid">
            {galleryItems.map((item, index) => (
              <div 
                key={index} 
                className="gallery-item fade-in" 
                onClick={() => handleGalleryClick(item.name)}
              >
                <img src={item.image} alt={item.name} />
                <div className="gallery-overlay">
                  <span>{item.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-title fade-in">
            <h2>What Our Clients Say</h2>
            <p>Real reviews from our valued customers</p>
          </div>
          <div className="testimonials-slider">
            {testimonials.map((t, idx) => (
              <div key={idx} className="testimonial-card fade-in">
                <div className="testimonial-header">
                  <img src={t.avatar} alt={t.name} className="testimonial-avatar" />
                  <div className="testimonial-info">
                    <h4>{t.name}</h4>
                    <p>{t.role}</p>
                  </div>
                </div>
                <div className="testimonial-stars">
                  {Array.from({ length: Math.floor(t.rating) }).map((_, i) => (
                    <i key={i} className="fas fa-star"></i>
                  ))}
                  {t.rating % 1 !== 0 && <i className="fas fa-star-half-alt"></i>}
                </div>
                <p className="testimonial-text">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
