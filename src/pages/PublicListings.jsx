import { useEffect, useState } from 'react';
import axios from 'axios';

export default function PublicListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');

  useEffect(() => {
    axios.get('${import.meta.env.VITE_API_URL}/api/listings/approved')
      .then(res => setListings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const industries = [...new Set(listings.map(l => l.industry))].sort();

  const filtered = listings.filter(l => {
    const matchSearch =
      l.businessName.toLowerCase().includes(search.toLowerCase()) ||
      l.bio.toLowerCase().includes(search.toLowerCase()) ||
      l.city.toLowerCase().includes(search.toLowerCase());
    const matchIndustry = industryFilter ? l.industry === industryFilter : true;
    return matchSearch && matchIndustry;
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '36px', fontWeight: 800, marginBottom: '10px' }}>
          Business Listings
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '15px' }}>
          Discover approved businesses in our directory
        </p>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <input
          placeholder="Search by name, description or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <select
          value={industryFilter}
          onChange={e => setIndustryFilter(e.target.value)}
          style={{ width: '200px' }}
        >
          <option value="">All Industries</option>
          {industries.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>

      {/* Results count */}
      {!loading && (
        <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '20px' }}>
          {filtered.length} {filtered.length === 1 ? 'listing' : 'listings'} found
        </p>
      )}

      {/* Loading */}
      {loading && <p style={{ color: 'var(--muted)' }}>Loading listings...</p>}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</p>
          <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', marginBottom: '8px' }}>No listings found</h3>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Try adjusting your search or filter.</p>
        </div>
      )}

      {/* Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
      }}>
        {filtered.map(listing => (
        <div key={listing._id} className="listing-card" style={{ padding: 0, overflow: 'hidden' }}>
  {/* Image */}
  {listing.image ? (
    <img src={listing.image} alt={listing.businessName} style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />
  ) : (
    <div style={{ width: '100%', height: '180px', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: '36px', opacity: 0.3 }}>🏢</span>
    </div>
  )}

  {/* Content */}
  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '17px', fontWeight: 700, marginBottom: '4px' }}>
          {listing.businessName}
        </h3>
        <span style={{
          fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.06em', color: 'var(--accent)',
          background: 'rgba(200,240,79,0.1)', padding: '2px 8px', borderRadius: '20px'
        }}>
          {listing.industry}
        </span>
      </div>
    </div>

    <p style={{ color: 'var(--muted)', fontSize: '13.5px', lineHeight: 1.6 }}>
      {listing.bio.length > 100 ? listing.bio.slice(0, 100) + '...' : listing.bio}
    </p>

    <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '10px 12px' }}>
      <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Services</p>
      <p style={{ fontSize: '13px' }}>{listing.services}</p>
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '4px' }}>
      <span style={{ fontSize: '13px', color: 'var(--muted)' }}>📍 {listing.city}, {listing.zip}</span>
      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>by {listing.owner?.name}</span>
    </div>
  </div>
</div>
        ))}
      </div>
    </div>
  );
}