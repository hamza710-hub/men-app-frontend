import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validate = () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) return 'All fields are required.';
    if (form.name.length < 2) return 'Name must be at least 2 characters.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Please enter a valid email.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);

    setLoading(true);
    try {
      await axios.post('${import.meta.env.VITE_API_URL}/api/auth/signup', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '32px', fontWeight: 800, color: 'var(--accent)', marginBottom: '8px' }}>BizList</h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>Create your free account</p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && <div className="error-msg">{error}</div>}
            {success && <div className="success-msg">{success}</div>}

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginBottom: '6px', fontWeight: 500 }}>Full Name</label>
              <input name="name" placeholder="Jane Smith" value={form.name} onChange={handleChange} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginBottom: '6px', fontWeight: 500 }}>Email</label>
              <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginBottom: '6px', fontWeight: 500 }}>Password</label>
              <input name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginBottom: '6px', fontWeight: 500 }}>Confirm Password</label>
              <input name="confirmPassword" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} />
            </div>

            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '13px', marginTop: '4px', fontSize: '15px' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--muted)', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}