import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const INDUSTRIES = [
  'Technology','Healthcare','Finance','Education','Retail',
  'Food & Beverage','Construction','Real Estate',
  'Marketing & Advertising','Legal Services','Consulting',
  'Non-Profit','Transportation','Entertainment','Other',
];

export default function EditListing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    businessName: '', bio: '', industry: '',
    address: '', city: '', zip: '', services: '', image: '',
  });
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/listings?userId=${user._id}`)
      .then(res => {
        const listing = res.data.find(l => l._id === id);
        if (!listing) { navigate('/dashboard'); return; }
        setForm({
          businessName: listing.businessName,
          bio: listing.bio,
          industry: listing.industry,
          address: listing.address,
          city: listing.city,
          zip: listing.zip,
          services: listing.services,
          image: listing.image || '',
        });
        if (listing.image) setPreview(listing.image);
      })
      .catch(() => navigate('/dashboard'))
      .finally(() => setFetching(false));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1048576) {
      return setError('Image must be under 1MB.');
    }
    if (!file.type.startsWith('image/')) {
      return setError('Please upload a valid image file.');
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, image: reader.result }));
      setPreview(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setForm(prev => ({ ...prev, image: '' }));
    setPreview('');
  };

  const validate = () => {
    if (!form.businessName.trim()) return 'Business name is required.';
    if (form.businessName.trim().length < 3) return 'Business name must be at least 3 characters.';
    if (!form.bio.trim()) return 'Bio is required.';
    if (form.bio.trim().length < 20) return 'Bio must be at least 20 characters.';
    if (!form.industry) return 'Please select an industry.';
    if (!form.address.trim()) return 'Address is required.';
    if (!form.city.trim()) return 'City is required.';
    if (!form.zip.trim()) return 'ZIP code is required.';
    if (!/^\d{5}$/.test(form.zip.trim())) return 'ZIP code must be exactly 5 digits.';
    if (!form.services.trim()) return 'Services are required.';
    if (form.services.trim().length < 10) return 'Services must be at least 10 characters.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);

    setLoading(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/listings/${id}`, { ...form, userId: user._id });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update listing.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ padding: '40px', color: 'var(--muted)' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '26px', fontWeight: 800, marginBottom: '4px' }}>Edit Listing</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Changes will reset the listing to pending review</p>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '32px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && <div className="error-msg">{error}</div>}

          {/* Image Upload */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', fontWeight: 500, marginBottom: '8px' }}>
              Main Picture <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional, max 1MB)</span>
            </label>

            {preview ? (
              <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
                <img src={preview} alt="preview" style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block', borderRadius: '10px' }} />
                <button
                  type="button"
                  onClick={removeImage}
                  style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'rgba(0,0,0,0.6)', color: 'white',
                    border: 'none', borderRadius: '6px', padding: '4px 10px',
                    fontSize: '12px', cursor: 'pointer',
                  }}
                >✕ Remove</button>
              </div>
            ) : (
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                border: '2px dashed var(--border)', borderRadius: '10px', padding: '32px',
                cursor: 'pointer', transition: 'border-color 0.2s',
                background: 'var(--surface2)',
              }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <span style={{ fontSize: '28px', marginBottom: '8px' }}>🖼️</span>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Click to upload an image</span>
                <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>JPG, PNG, WEBP — max 1MB</span>
                <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          <Field label="Business Name" hint="3–100 characters">
            <input name="businessName" value={form.businessName} onChange={handleChange} maxLength={100} />
          </Field>

          <Field label="Bio" hint={`${form.bio.length}/500`}>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} maxLength={500} style={{ resize: 'vertical' }} />
          </Field>

          <Field label="Industry">
            <select name="industry" value={form.industry} onChange={handleChange}>
              <option value="">Select an industry</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </Field>

          <Field label="Street Address">
            <input name="address" value={form.address} onChange={handleChange} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '12px' }}>
            <Field label="City">
              <input name="city" value={form.city} onChange={handleChange} />
            </Field>
            <Field label="ZIP Code">
              <input name="zip" value={form.zip} onChange={handleChange} maxLength={5} />
            </Field>
          </div>

          <Field label="Services" hint={`${form.services.length}/300`}>
            <textarea name="services" value={form.services} onChange={handleChange} rows={3} maxLength={300} style={{ resize: 'vertical' }} />
          </Field>

          <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
            <button type="button" className="btn-ghost" onClick={() => navigate('/dashboard')} style={{ flex: 1, padding: '12px' }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2, padding: '12px', fontSize: '15px' }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <label style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>{label}</label>
        {hint && <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}