import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchListings = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/listings?userId=${user._id}`);
      setListings(res.data);
    } catch (err) {
      setError('Failed to load listings.');
    } finally {
      setLoading(false);
    }
  };

  const [myStars, setMyStars] = useState([]);

const fetchStars = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/stars/my?userId=${user._id}`);
    setMyStars(res.data);
  } catch (err) {}
};

  useEffect(() => { 
  fetchListings(); 
  fetchStars();
}, []);

const handleCancelStar = async (starId) => {
  if (!window.confirm('Cancel this Stars of the Day booking?')) return;
  try {
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/stars/${starId}`, { data: { userId: user._id } });
    setMyStars(prev => prev.filter(s => s._id !== starId));
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to cancel.');
  }
};

  const canCreate = listings.length < 2;

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '26px', fontWeight: 800, marginBottom: '4px' }}>
            My Listings
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            {listings.length} of 2 listings used
          </p>
        </div>
        {canCreate ? (
          <Link to="/create-listing" className="btn-primary" style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, background: 'var(--accent)', color: '#0e0f11' }}>
            + New Listing
          </Link>
        ) : (
          <div style={{ fontSize: '13px', color: 'var(--muted)', background: 'var(--surface)', border: '1px solid var(--border)', padding: '10px 16px', borderRadius: '8px' }}>
            Max 2 listings reached
          </div>
        )}
      </div>

      {/* Content */}
      {loading && <p style={{ color: 'var(--muted)' }}>Loading...</p>}
      {error && <div className="error-msg">{error}</div>}

      {!loading && listings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>📋</p>
          <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', marginBottom: '8px' }}>No listings yet</h3>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>Create your first business listing to get started.</p>
          <Link to="/create-listing" className="btn-primary" style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, background: 'var(--accent)', color: '#0e0f11' }}>
            Create Listing
          </Link>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {listings.map(listing => (
        <div key={listing._id} style={{ background: 'var(--surface)', border: `1px solid ${listing.status === 'rejected' ? 'rgba(255,90,90,0.3)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: '24px' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
    <div>
      <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{listing.businessName}</h3>
      <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{listing.industry}</span>
    </div>
    <span className={`badge badge-${listing.status}`}>{listing.status}</span>
  </div>
  <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '12px', lineHeight: '1.6' }}>{listing.bio}</p>
  <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--muted)', flexWrap: 'wrap' }}>
    <span>📍 {listing.address}, {listing.city}, {listing.zip}</span>
    <span>🛠 {listing.services}</span>
  </div>
  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
  <Link to={`/edit-listing/${listing._id}`} style={{
    fontSize: '13px', color: 'var(--accent)', fontWeight: 600,
    background: 'rgba(200,240,79,0.08)', border: '1px solid rgba(200,240,79,0.2)',
    padding: '6px 14px', borderRadius: '6px',
  }}>Edit</Link>
</div>
  {listing.status === 'rejected' && listing.rejectionReason && (
    <div style={{ marginTop: '14px', background: 'rgba(255,90,90,0.08)', border: '1px solid rgba(255,90,90,0.2)', borderRadius: '8px', padding: '12px 14px' }}>
      <p style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rejection Reason</p>
      <p style={{ fontSize: '13px', color: 'var(--text)' }}>{listing.rejectionReason}</p>
    </div>
  )}
</div>
        ))}
      </div>
      {/* Stars of the Day Section */}
<div style={{ marginTop: '48px' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
    <div>
      <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>
        ⭐ Stars of the Day
      </h2>
      <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Your active featured slots</p>
    </div>
    <Link to="/book-star" style={{
      background: 'rgba(240,208,80,0.15)', color: '#f0d050',
      border: '1px solid rgba(240,208,80,0.3)', padding: '8px 16px',
      borderRadius: '8px', fontSize: '13px', fontWeight: 600,
    }}>
      + Book a Slot
    </Link>
  </div>

  {myStars.length === 0 ? (
    <div style={{ background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', padding: '32px', textAlign: 'center' }}>
      <p style={{ color: 'var(--muted)', fontSize: '14px' }}>No active star bookings. Feature your listing in the spotlight!</p>
    </div>
  ) : (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {myStars.map(star => (
        <div key={star._id} style={{ background: 'var(--surface)', border: '1px solid rgba(240,208,80,0.25)', borderRadius: 'var(--radius)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className={`slot-badge slot-${star.slot}`}>⭐ Slot {star.slot}</span>
              <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '15px' }}>{star.listing?.businessName}</span>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
              {new Date(star.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} — {new Date(star.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <button className="btn-danger" onClick={() => handleCancelStar(star._id)} style={{ fontSize: '12px', padding: '6px 14px' }}>
            Cancel
          </button>
        </div>
      ))}
    </div>
  )}
</div>
    </div>
  );
}