import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { bookingService, stylistService } from '../services/api';
import Loader from '../components/Loader';
import CallPopup from '../components/CallPopup';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();

  // State
  const [activeSection, setActiveSection] = useState('overview'); // overview, stylists, bookings
  const [bookings, setBookings] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Call popup states
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callCustomerName, setCallCustomerName] = useState('');
  const [callPhoneNumber, setCallPhoneNumber] = useState('');

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const bookingsData = await bookingService.getBookings();
      setBookings(bookingsData.bookings || []);

      const stylistsData = await stylistService.getStylists();
      setStylists(stylistsData.stylists || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showNotification('Failed to fetch dashboard data', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Booking Status Update
  const handleUpdateStatus = async (bookingId, currentStatus, isStaffView = false) => {
    let newStatus;
    if (currentStatus === 'pending') {
      newStatus = 'booked';
    } else if (currentStatus === 'booked') {
      newStatus = 'completed';
    } else {
      return;
    }

    try {
      setActionLoading(true);
      await bookingService.updateBookingStatus(bookingId, newStatus);
      showNotification(`Booking marked as ${newStatus}!`);
      
      // Refresh data
      const bookingsData = await bookingService.getBookings();
      setBookings(bookingsData.bookings || []);

      const stylistsData = await stylistService.getStylists();
      setStylists(stylistsData.stylists || []);
    } catch (error) {
      console.error('Failed to update booking status:', error);
      showNotification('Failed to update booking status', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Open Call Popup Modal
  const triggerCallPopup = (name, phone) => {
    setCallCustomerName(name);
    setCallPhoneNumber(phone || '+91 9876543210');
    setCallModalOpen(true);
  };

  // Calculations for Admin View
  const totalBookingsCount = bookings.length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;
  const completedBookingsCount = bookings.filter(b => b.status === 'completed').length;
  const availableStylistsCount = stylists.filter(s => s.calculated_status === 'available').length;

  // Filter Bookings & Stats for Staff View
  const myBookings = bookings.filter(b => b.staff === user.name);
  const myTotalAppointments = myBookings.length;
  const myPendingCount = myBookings.filter(b => b.status === 'pending').length;
  const myCompletedCount = myBookings.filter(b => b.status === 'completed').length;
  
  // Staff availability status: Busy if they have active 'booked' status, else Available
  const hasActiveBooking = myBookings.some(b => b.status === 'booked');
  const myCurrentStatus = hasActiveBooking ? 'Busy' : 'Available';

  if (loading) {
    return (
      <section className="dashboard-section">
        <div className="container">
          <div className="dashboard-container" style={{ gridTemplateColumns: '1fr' }}>
            <div className="dashboard-content">
              <Loader message="Loading dashboard credentials and booking schedules..." />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="dashboard-section">
        <div className="container">
          <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
              <div className="dashboard-user">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" 
                  alt={user.name || 'User'} 
                  id="userAvatar" 
                />
                <h4 id="displayName">{user.name || 'User'}</h4>
                <p id="displayRole">{user.role === 'admin' ? 'Administrator' : 'Staff Member'}</p>
              </div>
              <ul className="dashboard-nav">
                <li>
                  <a 
                    href="#overview" 
                    className={activeSection === 'overview' ? 'active' : ''} 
                    onClick={(e) => { e.preventDefault(); setActiveSection('overview'); }}
                  >
                    <i className="fas fa-chart-pie"></i> Dashboard
                  </a>
                </li>
                {user.role === 'admin' && (
                  <li>
                    <a 
                      href="#stylists" 
                      className={activeSection === 'stylists' ? 'active' : ''} 
                      onClick={(e) => { e.preventDefault(); setActiveSection('stylists'); }}
                    >
                      <i className="fas fa-users-cog"></i> Stylists
                    </a>
                  </li>
                )}
                <li>
                  <a 
                    href="#bookings" 
                    className={activeSection === 'bookings' ? 'active' : ''} 
                    onClick={(e) => { e.preventDefault(); setActiveSection('bookings'); }}
                  >
                    <i className="fas fa-calendar-alt"></i> Bookings
                  </a>
                </li>
                <li>
                  <a href="tel:+919876543210">
                    <i className="fas fa-phone"></i> Call Now
                  </a>
                </li>
                <li>
                  <a href="#logout" onClick={(e) => { e.preventDefault(); logout(); }}>
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </a>
                </li>
              </ul>
            </aside>

            {/* Main Content */}
            <main className="dashboard-content">
              <div className="dashboard-header">
                <h2 id="dashboardTitle">
                  {user.role === 'admin' ? 'Admin Dashboard' : 'Staff Dashboard'}
                </h2>
                <button 
                  type="button" 
                  className="btn"
                  onClick={() => triggerCallPopup('Glow Support', '+91 9876543210')}
                >
                  <i className="fas fa-phone"></i> Call Now
                </button>
              </div>

              {/* ACTION LOADING STATE BAR */}
              {actionLoading && (
                <div style={{ color: 'var(--gold)', fontWeight: 600, marginBottom: '20px', textAlign: 'center' }}>
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Updating booking status...
                </div>
              )}

              {/* ============ ADMIN VIEW ============ */}
              {user.role === 'admin' && (
                <div id="adminSection">
                  
                  {/* Overview Section */}
                  {activeSection === 'overview' && (
                    <>
                      {/* Stats Grid */}
                      <div className="stats-grid" style={{ marginBottom: '40px' }}>
                        <div className="stat-card">
                          <h4>Total Bookings</h4>
                          <div className="value" id="totalBookings">{totalBookingsCount}</div>
                        </div>
                        <div className="stat-card">
                          <h4>Pending</h4>
                          <div className="value" id="pendingBookings">{pendingBookingsCount}</div>
                        </div>
                        <div className="stat-card">
                          <h4>Completed</h4>
                          <div className="value" id="completedBookings">{completedBookingsCount}</div>
                        </div>
                        <div className="stat-card">
                          <h4>Available Stylists</h4>
                          <div className="value" id="availableStylists">
                            {availableStylistsCount}/{stylists.length}
                          </div>
                        </div>
                      </div>

                      {/* Stylist Availability Section */}
                      <h3 style={{ marginBottom: '25px', fontSize: '1.5rem' }}>
                        <i className="fas fa-user-clock" style={{ color: 'var(--gold)', marginRight: '10px' }}></i>
                        Stylist Availability
                      </h3>
                      
                      <div id="stylistsGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, marginBottom: '40px' }}>
                        {stylists.length === 0 ? (
                          <p style={{ color: 'var(--gray)' }}>No stylists registered.</p>
                        ) : (
                          stylists.map((stylist) => {
                            const isAvailable = stylist.calculated_status === 'available';
                            return (
                              <div 
                                key={stylist.id || stylist.name} 
                                style={{ 
                                  background: 'var(--white)', 
                                  borderRadius: '15px', 
                                  padding: '25px', 
                                  boxShadow: 'var(--shadow)', 
                                  textAlign: 'center', 
                                  border: '1px solid var(--gray-light)',
                                  transition: 'var(--transition)'
                                }}
                              >
                                <div style={{ 
                                  width: '80px', 
                                  height: '80px', 
                                  background: `linear-gradient(135deg, ${isAvailable ? '#4CAF50' : '#f44336'}, ${isAvailable ? '#388E3C' : '#D32F2F'})`, 
                                  borderRadius: '50%', 
                                  margin: '0 auto 15px', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center' 
                                }}>
                                  <i className="fas fa-user" style={{ fontSize: '2rem', color: 'white' }}></i>
                                </div>
                                <h4 style={{ marginBottom: '5px' }}>{stylist.name}</h4>
                                <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '15px' }}>Hair Stylist</p>
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  gap: '8px', 
                                  padding: '10px 20px', 
                                  background: isAvailable ? '#E8F5E9' : '#FFEBEE', 
                                  borderRadius: '20px' 
                                }}>
                                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: isAvailable ? '#4CAF50' : '#f44336' }}></span>
                                  <span style={{ fontWeight: 600, color: isAvailable ? '#4CAF50' : '#f44336' }}>
                                    {isAvailable ? 'Available' : 'Busy'}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </>
                  )}

                  {/* Stylists Filtering View */}
                  {activeSection === 'stylists' && (
                    <div style={{ marginBottom: '40px' }}>
                      <h3 style={{ marginBottom: '25px', fontSize: '1.5rem' }}>
                        <i className="fas fa-users-cog" style={{ color: 'var(--gold)', marginRight: '10px' }}></i>
                        Manage Stylists
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                        {stylists.map((stylist) => {
                          const isAvailable = stylist.calculated_status === 'available';
                          return (
                            <div 
                              key={stylist.id} 
                              style={{ 
                                background: 'var(--white)', 
                                borderRadius: '15px', 
                                padding: '25px', 
                                boxShadow: 'var(--shadow)', 
                                textAlign: 'center', 
                                border: '1px solid var(--gray-light)'
                              }}
                            >
                              <div style={{ 
                                width: '80px', 
                                height: '80px', 
                                background: `linear-gradient(135deg, ${isAvailable ? '#4CAF50' : '#f44336'}, ${isAvailable ? '#388E3C' : '#D32F2F'})`, 
                                borderRadius: '50%', 
                                margin: '0 auto 15px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                              }}>
                                <i className="fas fa-user-tie" style={{ fontSize: '2rem', color: 'white' }}></i>
                              </div>
                              <h4 style={{ marginBottom: '5px' }}>{stylist.name}</h4>
                              <p style={{ color: 'var(--gold)', fontSize: '0.9rem', marginBottom: '15px', fontWeight: 600 }}>Active Expert</p>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: isAvailable ? '#4CAF50' : '#f44336' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isAvailable ? '#4CAF50' : '#f44336' }}></span>
                                <strong>{isAvailable ? 'Available' : 'Assigned (Busy)'}</strong>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Bookings View */}
                  {(activeSection === 'overview' || activeSection === 'bookings') && (
                    <div>
                      <h3 style={{ marginBottom: '25px', fontSize: '1.5rem' }}>
                        <i className="fas fa-calendar-check" style={{ color: 'var(--gold)', marginRight: '10px' }}></i>
                        Customer Bookings
                      </h3>
                      
                      <div style={{ overflowX: 'auto' }}>
                        <table className="booking-table">
                          <thead>
                            <tr>
                              <th>Customer</th>
                              <th>Phone</th>
                              <th>Service</th>
                              <th>Stylist</th>
                              <th>Time</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody id="bookingsTableBody">
                            {bookings.length === 0 ? (
                              <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: 'var(--gray)' }}>
                                  No bookings found
                                </td>
                              </tr>
                            ) : (
                              bookings.map((booking) => (
                                <tr key={booking.id}>
                                  <td><strong>{booking.customer || 'N/A'}</strong></td>
                                  <td>
                                    <span 
                                      onClick={() => triggerCallPopup(booking.customer, booking.phone)}
                                      style={{ color: 'var(--gold)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                                    >
                                      {booking.phone || 'N/A'}
                                    </span>
                                  </td>
                                  <td>{booking.service || 'N/A'}</td>
                                  <td>{booking.staff || 'N/A'}</td>
                                  <td>{booking.time || 'N/A'}</td>
                                  <td>
                                    <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                                  </td>
                                  <td>
                                    {booking.status === 'pending' ? (
                                      <button 
                                        type="button" 
                                        className="action-btn update" 
                                        onClick={() => handleUpdateStatus(booking.id, booking.status)}
                                      >
                                        Confirm
                                      </button>
                                    ) : booking.status === 'booked' ? (
                                      <button 
                                        type="button" 
                                        className="action-btn update" 
                                        style={{ background: '#4CAF50' }}
                                        onClick={() => handleUpdateStatus(booking.id, booking.status)}
                                      >
                                        Complete
                                      </button>
                                    ) : (
                                      <span style={{ color: 'var(--gray)', fontWeight: 600 }}>Done</span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ============ STAFF VIEW ============ */}
              {user.role === 'staff' && (
                <div id="staffSection">
                  
                  {/* Overview Stats */}
                  {activeSection === 'overview' && (
                    <div className="stats-grid" style={{ marginBottom: '40px' }}>
                      <div className="stat-card">
                        <h4>My Appointments</h4>
                        <div className="value" id="staffTotalBookings">{myTotalAppointments}</div>
                      </div>
                      <div className="stat-card">
                        <h4>Pending</h4>
                        <div className="value" id="staffPending">{myPendingCount}</div>
                      </div>
                      <div className="stat-card">
                        <h4>Completed</h4>
                        <div className="value" id="staffCompleted">{myCompletedCount}</div>
                      </div>
                      <div className="stat-card">
                        <h4>My Status</h4>
                        <div 
                          className="value" 
                          id="myStatus" 
                          style={{ color: myCurrentStatus === 'Available' ? '#4CAF50' : '#f44336' }}
                        >
                          {myCurrentStatus}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* My Bookings Table */}
                  {(activeSection === 'overview' || activeSection === 'bookings') && (
                    <div>
                      <h3 style={{ marginBottom: '25px', fontSize: '1.5rem' }}>
                        <i className="fas fa-calendar-check" style={{ color: 'var(--gold)', marginRight: '10px' }}></i>
                        My Bookings
                      </h3>
                      
                      <div style={{ overflowX: 'auto' }}>
                        <table className="booking-table">
                          <thead>
                            <tr>
                              <th>Customer</th>
                              <th>Service</th>
                              <th>Time</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody id="staffBookingsTableBody">
                            {myBookings.length === 0 ? (
                              <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--gray)' }}>
                                  No bookings assigned
                                </td>
                              </tr>
                            ) : (
                              myBookings.map((booking) => (
                                <tr key={booking.id}>
                                  <td>
                                    <strong 
                                      onClick={() => triggerCallPopup(booking.customer, booking.phone)}
                                      style={{ color: 'var(--gold)', cursor: 'pointer', textDecoration: 'underline' }}
                                    >
                                      {booking.customer || 'N/A'}
                                    </strong>
                                  </td>
                                  <td>{booking.service || 'N/A'}</td>
                                  <td>{booking.time || 'N/A'}</td>
                                  <td>
                                    <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                                  </td>
                                  <td>
                                    {booking.status === 'pending' ? (
                                      <button 
                                        type="button" 
                                        className="action-btn update" 
                                        onClick={() => handleUpdateStatus(booking.id, booking.status)}
                                      >
                                        Start
                                      </button>
                                    ) : booking.status === 'booked' ? (
                                      <button 
                                        type="button" 
                                        className="action-btn update" 
                                        style={{ background: '#4CAF50' }}
                                        onClick={() => handleUpdateStatus(booking.id, booking.status)}
                                      >
                                        Complete
                                      </button>
                                    ) : (
                                      <span style={{ color: 'var(--gray)', fontWeight: 600 }}>Done</span>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* CALL MODAL DIAL POPUP */}
      <CallPopup 
        isOpen={callModalOpen}
        customerName={callCustomerName}
        phoneNumber={callPhoneNumber}
        onClose={() => setCallModalOpen(false)}
      />
    </>
  );
};

export default Dashboard;
