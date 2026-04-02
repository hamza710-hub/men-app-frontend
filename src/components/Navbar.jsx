import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '62px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link to={user ? '/dashboard' : '/login'} style={{
        fontFamily: 'var(--font-head)',
        fontWeight: 800,
        fontSize: '20px',
        color: 'var(--accent)',
        letterSpacing: '-0.02em',
      }}>
        BizList
      </Link>

<Link to="/listings" style={{
  padding: '6px 14px',
  borderRadius: '6px',
  fontSize: '14px',
  color: isActive('/listings') ? 'var(--accent)' : 'var(--muted)',
  background: isActive('/listings') ? 'rgba(200,240,79,0.08)' : 'transparent',
  fontWeight: isActive('/listings') ? 600 : 400,
  transition: 'all 0.15s',
}}>Listings</Link>

<Link to="/stars" style={{
  padding: '6px 14px',
  borderRadius: '6px',
  fontSize: '14px',
  color: isActive('/stars') ? '#f0d050' : 'var(--muted)',
  background: isActive('/stars') ? 'rgba(240,208,80,0.08)' : 'transparent',
  fontWeight: isActive('/stars') ? 600 : 400,
  transition: 'all 0.15s',
}}>⭐ Stars</Link>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/dashboard" style={{
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '14px',
            color: isActive('/dashboard') ? 'var(--accent)' : 'var(--muted)',
            background: isActive('/dashboard') ? 'rgba(200,240,79,0.08)' : 'transparent',
            fontWeight: isActive('/dashboard') ? 600 : 400,
            transition: 'all 0.15s',
          }}>Dashboard</Link>

          {user.role === 'member' && (
            <Link to="/create-listing" style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '14px',
              color: isActive('/create-listing') ? 'var(--accent)' : 'var(--muted)',
              background: isActive('/create-listing') ? 'rgba(200,240,79,0.08)' : 'transparent',
              fontWeight: isActive('/create-listing') ? 600 : 400,
              transition: 'all 0.15s',
            }}>+ New Listing</Link>
          )}

          {user.role === 'admin' && (
            <Link to="/admin" style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '14px',
              color: isActive('/admin') ? 'var(--accent)' : 'var(--muted)',
              background: isActive('/admin') ? 'rgba(200,240,79,0.08)' : 'transparent',
              fontWeight: isActive('/admin') ? 600 : 400,
              transition: 'all 0.15s',
            }}>Admin Panel</Link>
          )}

          <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }} />

          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
            {user.name} &nbsp;
            <span style={{
              background: user.role === 'admin' ? 'rgba(200,240,79,0.15)' : 'rgba(79,207,143,0.15)',
              color: user.role === 'admin' ? 'var(--accent)' : 'var(--success)',
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>{user.role}</span>
          </span>

          <button className="btn-ghost" onClick={handleLogout} style={{ padding: '7px 16px', fontSize: '13px' }}>
            Log out
          </button>
        </div>
      )}
    </nav>
  );
}