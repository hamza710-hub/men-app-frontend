import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [filter, setFilter] = useState('all');
  const [rejectModal, setRejectModal] = useState(null); // holds listing id
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/dashboard'); return; }
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/listings?userId=${user._id}`);
      setListings(res.data);
    } catch {
      setError('Failed to load listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/listings/${id}/approve`, { userId: user._id });
      setListings(prev => prev.map(l => l._id === id ? { ...l, status: 'approved' } : l));
      flash('✅ Listing approved!');
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to approve.', true);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/listings/${id}`, { data: { userId: user._id } });
      setListings(prev => prev.filter(l => l._id !== id));
      flash('🗑 Listing deleted.');
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to delete.', true);
    }
  };

  const handleReject = async () => {
  if (!rejectReason.trim() || rejectReason.trim().length < 3) {
    return setRejectError('Please provide a reason (min 3 characters).');
  }
  try {
    await axios.patch(`${import.meta.env.VITE_API_URL}/api/listings/${rejectModal}/reject`, {
      userId: user._id,
      reason: rejectReason,
    });
    setListings(prev => prev.map(l => l._id === rejectModal
      ? { ...l, status: 'rejected', rejectionReason: rejectReason }
      : l
    ));
    flash('❌ Listing rejected.');
    setRejectModal(null);
    setRejectReason('');
    setRejectError('');
  } catch (err) {
    setRejectError(err.response?.data?.message || 'Failed to reject.');
  }
};

  const flash = (msg, isError = false) => {
    setActionMsg({ text: msg, isError });
    setTimeout(() => setActionMsg(''), 3000);
  };

  const filtered = filter === 'all' ? listings : listings.filter(l => l.status === filter);
  const pendingCount = listings.filter(l => l.status === 'pending').length;
  const approvedCount = listings.filter(l => l.status === 'approved').length;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '26px', fontWeight: 800, marginBottom: '4px' }}>Admin Panel</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Manage all submitted business listings</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total', value: listings.length, color: 'var(--text)' },
          { label: 'Pending', value: pendingCount, color: 'var(--pending)' },
          { label: 'Approved', value: approvedCount, color: 'var(--success)' },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
            <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-head)', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Flash message */}
      {actionMsg && (
        <div className={actionMsg.isError ? 'error-msg' : 'success-msg'} style={{ marginBottom: '16px' }}>
          {actionMsg.text}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
  <button key={f} onClick={() => setFilter(f)} style={{
    padding: '7px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
    background: filter === f ? 'var(--accent)' : 'var(--surface)',
    color: filter === f ? '#0e0f11' : 'var(--muted)',
    border: filter === f ? 'none' : '1px solid var(--border)',
    textTransform: 'capitalize', cursor: 'pointer',
  }}>{f} ({f === 'all' ? listings.length : listings.filter(l => l.status === f).length})</button>
))}
      </div>

      {/* Listings */}
      {loading && <p style={{ color: 'var(--muted)' }}>Loading...</p>}
      {error && <div className="error-msg">{error}</div>}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
          No {filter === 'all' ? '' : filter} listings found.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filtered.map(listing => (
          <div key={listing._id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '22px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '17px', fontWeight: 700, marginBottom: '3px' }}>{listing.businessName}</h3>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  {listing.industry} &nbsp;·&nbsp; by {listing.owner?.name} ({listing.owner?.email})
                </span>
              </div>
              <span className={`badge badge-${listing.status}`}>{listing.status}</span>
            </div>

            <p style={{ color: 'var(--muted)', fontSize: '13.5px', marginBottom: '10px', lineHeight: 1.6 }}>{listing.bio}</p>

            <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--muted)', marginBottom: '14px', flexWrap: 'wrap' }}>
              <span>📍 {listing.address}, {listing.city} {listing.zip}</span>
              <span>🛠 {listing.services}</span>
              <span>🕐 {new Date(listing.createdAt).toLocaleDateString()}</span>
            </div>

          <div style={{ display: 'flex', gap: '10px' }}>
  {listing.status === 'pending' && (
    <button className="btn-success" onClick={() => handleApprove(listing._id)}>Approve</button>
  )}
  {listing.status === 'pending' && (
    <button className="btn-danger" onClick={() => { setRejectModal(listing._id); setRejectReason(''); setRejectError(''); }}>Reject</button>
  )}
  <button className="btn-danger" onClick={() => handleDelete(listing._id)} style={{ borderColor: 'var(--muted)', color: 'var(--muted)' }}>Delete</button>
</div>
          </div>
        ))}
      </div>
      {/* Reject Modal */}
{rejectModal && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '24px' }}>
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '32px', width: '100%', maxWidth: '440px' }}>
      <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Reject Listing</h3>
      <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>Provide a reason — the member will see this on their dashboard.</p>
      {rejectError && <div className="error-msg" style={{ marginBottom: '12px' }}>{rejectError}</div>}
      <textarea
        placeholder="e.g. Incomplete business information, please resubmit with full details."
        value={rejectReason}
        onChange={e => { setRejectReason(e.target.value); setRejectError(''); }}
        rows={4}
        maxLength={300}
        style={{ resize: 'none', marginBottom: '16px' }}
      />
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="btn-ghost" onClick={() => { setRejectModal(null); setRejectReason(''); setRejectError(''); }} style={{ flex: 1, padding: '11px' }}>Cancel</button>
        <button className="btn-danger" onClick={handleReject} style={{ flex: 2, padding: '11px', background: 'var(--danger)', color: 'white', fontSize: '14px' }}>Confirm Reject</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}