import React from 'react';
import { useFadeIn } from '../hooks/useFadeIn';
import { useNotification } from '../context/NotificationContext';

const Team = () => {
  useFadeIn();
  const { showNotification } = useNotification();

  const handleProfileClick = (name) => {
    showNotification(`Viewing ${name}'s Profile!`);
  };

  const experts = [
    {
      name: 'Meera Kapoor',
      role: 'Senior Hair Stylist',
      image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=500',
      status: 'available',
      rating: 5,
      feedback: 'Creates stunning hairstyles for all occasions'
    },
    {
      name: 'Arjun Singh',
      role: 'Men\'s Grooming Expert',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500',
      status: 'available',
      rating: 4.5,
      feedback: 'Specializes in modern men\'s hairstyles'
    },
    {
      name: 'Priya Sharma',
      role: 'Bridal Makeup Artist',
      image: 'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=500',
      status: 'busy',
      rating: 5,
      feedback: 'Making brides look absolutely stunning'
    },
    {
      name: 'Rahul Verma',
      role: 'Hair Coloring Specialist',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
      status: 'available',
      rating: 5,
      feedback: 'Expert in balayage and color corrections'
    },
    {
      name: 'Anita Desai',
      role: 'Skin Care Expert',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500',
      status: 'available',
      rating: 4.5,
      feedback: 'Transforms skin with advanced facials'
    },
    {
      name: 'Vikram Patel',
      role: 'Beard Styling Expert',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500',
      status: 'busy',
      rating: 5,
      feedback: 'Crafts perfect beards for every face'
    },
    {
      name: 'Neha Gupta',
      role: 'Hair Spa Specialist',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500',
      status: 'available',
      rating: 5,
      feedback: 'Expert in hair rejuvenation treatments'
    },
    {
      name: 'Karan Mehta',
      role: 'Junior Stylist',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500',
      status: 'available',
      rating: 4,
      feedback: 'Rising talent with fresh ideas'
    }
  ];

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>Meet Our Experts</h1>
          <p>Skilled professionals dedicated to your beauty</p>
        </div>
      </section>

      <section className="team-section">
        <div className="container">
          <div className="team-grid">
            {experts.map((exp, idx) => (
              <div 
                key={idx} 
                className="team-card fade-in" 
                onClick={() => handleProfileClick(exp.name)}
                style={{ cursor: 'pointer' }}
              >
                <div className="team-card-image">
                  <img src={exp.image} alt={exp.name} />
                  <span className={`team-status ${exp.status}`}>
                    {exp.status.charAt(0).toUpperCase() + exp.status.slice(1)}
                  </span>
                </div>
                <div className="team-card-content">
                  <h3>{exp.name}</h3>
                  <p className="role">{exp.role}</p>
                  <div className="team-rating">
                    {Array.from({ length: Math.floor(exp.rating) }).map((_, i) => (
                      <i key={i} className="fas fa-star"></i>
                    ))}
                    {exp.rating % 1 !== 0 && <i className="fas fa-star-half-alt"></i>}
                    {exp.rating === 4 && <i className="far fa-star"></i>}
                  </div>
                  <p className="team-feedback">"{exp.feedback}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--gray-light)', padding: '100px 0', textAlign: 'center' }}>
        <div className="container">
          <div className="section-title fade-in">
            <h2>Join Our Team</h2>
            <p>We're always looking for talented professionals</p>
          </div>
          <p style={{ maxWidth: '600px', margin: '0 auto 30px', color: 'var(--gray)' }}>
            Are you passionate about beauty and grooming? We're looking for skilled stylists, makeup artists, and spa therapists to join our growing team.
          </p>
          <a href="mailto:careers@glowbeauty.com" className="btn">
            <i className="fas fa-envelope"></i> Send Your Resume
          </a>
        </div>
      </section>
    </>
  );
};

export default Team;
