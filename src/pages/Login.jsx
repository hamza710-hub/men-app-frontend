import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validate = () => {
    if (!form.email || !form.password) return 'All fields are required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Please enter a valid email.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);

    setLoading(true);
    try {
      const res = await axios.post('${import.meta.env.VITE_API_URL}/api/auth/login', form);
      login(res.data.user);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '32px', fontWeight: 800, color: 'var(--accent)', marginBottom: '8px' }}>BizList</h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>Sign in to your account</p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && <div className="error-msg">{error}</div>}

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginBottom: '6px', fontWeight: 500 }}>Email</label>
              <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginBottom: '6px', fontWeight: 500 }}>Password</label>
              <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} />
            </div>

            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '13px', marginTop: '4px', fontSize: '15px' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--muted)', fontSize: '14px' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}