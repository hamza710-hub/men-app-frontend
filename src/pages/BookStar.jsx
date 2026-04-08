import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function BookStar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [approvedListings, setApprovedListings] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const [form, setForm] = useState({ listingId: '', slot: '', startDate: '', endDate: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL}/api/listings?userId=${user._id}`),
      axios.get(`${import.meta.env.VITE_API_URL}/api/stars/booked-dates`),
    ]).then(([listingsRes, bookedRes]) => {
      const approved = listingsRes.data.filter(l => l.status === 'approved');
      setApprovedListings(approved);
      setBookedDates(bookedRes.data);
    }).catch(() => setError('Failed to load data.'))
      .finally(() => setFetching(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];

  // Get blocked date ranges for a given slot
  const getBlockedRanges = (slot) =>
    bookedDates.filter(b => b.slot === slot).map(b => ({
      start: b.startDate.split('T')[0],
      end: b.endDate.split('T')[0],
    }));

  // Check if a date range overlaps with any blocked range for the selected slot
  const hasConflict = (slot, start, end) => {
    if (!slot || !start || !end) return false;
    const blocked = getBlockedRanges(Number(slot));
    return blocked.some(b => start <= b.end && end >= b.start);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const validate = () => {
    if (!form.listingId) return 'Please select a listing.';
    if (!form.slot) return 'Please select a slot.';
    if (!form.startDate) return 'Please select a start date.';
    if (!form.endDate) return 'Please select an end date.';
    if (form.endDate < form.startDate) return 'End date must be after start date.';
    if (hasConflict(form.slot, form.startDate, form.endDate))
      return `Slot ${form.slot} is already booked for some of those dates. Please pick different dates.`;
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/stars`, {
        userId: user._id,
        listingId: form.listingId,
        slot: Number(form.slot),
        startDate: form.startDate,
        endDate: form.endDate,
      });
      setSuccess('🌟 Your listing has been featured as a Star of the Day!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show blocked ranges info for selected slot
  const blockedRanges = form.slot ? getBlockedRanges(Number(form.slot)) : [];

  if (fetching) return <div style={{ padding: '40px', color: 'var(--muted)' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '540px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '26px', fontWeight: 800, marginBottom: '4px' }}>
          ⭐ Book Stars of the Day
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Feature your approved listing in the spotlight</p>
      </div>

      {approvedListings.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>🔒</p>
          <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '17px', marginBottom: '8px' }}>No approved listings</h3>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>You need at least one approved listing to book a star slot.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && <div className="error-msg">{error}</div>}
            {success && <div className="success-msg">{success}</div>}

            {/* Listing */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', fontWeight: 500, marginBottom: '6px' }}>Select Listing</label>
              <select name="listingId" value={form.listingId} onChange={handleChange}>
                <option value="">Choose an approved listing</option>
                {approvedListings.map(l => (
                  <option key={l._id} value={l._id}>{l.businessName}</option>
                ))}
              </select>
            </div>

            {/* Slot */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', fontWeight: 500, marginBottom: '10px' }}>Select Slot</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[1, 2].map(s => {
                  const blocked = getBlockedRanges(s);
                  const isSelected = form.slot === String(s);
                  return (
                    <div
                      key={s}
                      onClick={() => { setForm({ ...form, slot: String(s) }); setError(''); }}
                      style={{
                        border: `2px solid ${isSelected ? (s === 1 ? '#f0d050' : 'var(--accent)') : 'var(--border)'}`,
                        borderRadius: '10px',
                        padding: '16px',
                        cursor: 'pointer',
                        background: isSelected ? (s === 1 ? 'rgba(240,208,80,0.08)' : 'rgba(200,240,79,0.08)') : 'var(--surface2)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '15px', marginBottom: '6px', color: s === 1 ? '#f0d050' : 'var(--accent)' }}>
                        ⭐ Slot {s}
                      </div>
                      {blocked.length === 0 ? (
                        <div style={{ fontSize: '12px', color: 'var(--success)' }}>Fully available</div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>Blocked dates:</div>
                          {blocked.map((b, i) => (
                            <div key={i} style={{ fontSize: '11px', color: 'var(--danger)', background: 'rgba(255,90,90,0.08)', borderRadius: '4px', padding: '2px 6px', marginBottom: '2px' }}>
                              {new Date(b.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(b.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', fontWeight: 500, marginBottom: '6px' }}>Start Date</label>
                <input type="date" name="startDate" value={form.startDate} min={today} onChange={handleChange} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', fontWeight: 500, marginBottom: '6px' }}>End Date</label>
                <input type="date" name="endDate" value={form.endDate} min={form.startDate || today} onChange={handleChange} />
              </div>
            </div>

            {/* Conflict warning */}
            {form.slot && form.startDate && form.endDate && hasConflict(form.slot, form.startDate, form.endDate) && (
              <div className="error-msg">
                ⚠️ These dates overlap with an existing booking for Slot {form.slot}. Please choose different dates.
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <button type="button" className="btn-ghost" onClick={() => navigate('/dashboard')} style={{ flex: 1, padding: '12px' }}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2, padding: '12px', fontSize: '15px' }}>
                {loading ? 'Booking...' : '⭐ Feature My Listing'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}