import { useEffect, useState } from 'react';
import axios from 'axios';

export default function StarsOfTheDay() {
  const [stars, setStars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/stars`)
      .then(res => setStars(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeStars = stars.filter(s => new Date(s.startDate) <= today);
  const upcomingStars = stars.filter(s => new Date(s.startDate) > today);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const StarCard = ({ star }) => (
    <div className="star-card">
      {/* Slot badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className={`slot-badge slot-${star.slot}`}>⭐ Slot {star.slot}</span>
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
          {formatDate(star.startDate)} — {formatDate(star.endDate)}
        </span>
      </div>

        {/* Image */}
     {star.listing?.image ? (
       <img src={star.listing.image} alt={star.listing.businessName} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', display: 'block' }} />
      ) : (
        <div style={{ width: '100%', height: '160px', background: 'var(--surface2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
       <span style={{ fontSize: '32px', opacity: 0.3 }}>🏢</span>
      </div>
    )}

      {/* Business info */}
      <div>
        <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>
          {star.listing?.businessName}
        </h3>
        <span style={{
          fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.06em', color: 'var(--accent)',
          background: 'rgba(200,240,79,0.1)', padding: '2px 8px', borderRadius: '20px'
        }}>
          {star.listing?.industry}
        </span>
      </div>

      <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6 }}>
        {star.listing?.bio?.length > 150 ? star.listing.bio.slice(0, 150) + '...' : star.listing?.bio}
      </p>

      <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '10px 14px' }}>
        <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Services</p>
        <p style={{ fontSize: '13px' }}>{star.listing?.services}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--muted)' }}>
        <span>📍 {star.listing?.city}, {star.listing?.zip}</span>
        <span>by {star.listing?.owner?.name}</span>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>⭐</div>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '38px', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.02em' }}>
          Stars of the Day
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '15px' }}>
          Featured businesses handpicked for the spotlight
        </p>
      </div>

      {loading && <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Loading...</p>}

      {!loading && stars.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>🌟</p>
          <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', marginBottom: '8px' }}>No stars yet</h3>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Check back soon for featured businesses.</p>
        </div>
      )}

      {/* Active Stars */}
      {activeStars.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#f0d050' }}>●</span> Featured Today
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {activeStars.map(star => <StarCard key={star._id} star={star} />)}
          </div>
        </div>
      )}

      {/* Upcoming Stars */}
      {upcomingStars.length > 0 && (
        <div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--muted)' }}>●</span> Coming Up
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', opacity: 0.75 }}>
            {upcomingStars.map(star => <StarCard key={star._id} star={star} />)}
          </div>
        </div>
      )}
    </div>
  );
}