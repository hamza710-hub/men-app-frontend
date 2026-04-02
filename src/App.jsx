import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateListing from './pages/CreateListing';
import AdminPanel from './pages/AdminPanel';
import PublicListings from './pages/PublicListings';
import StarsOfTheDay from './pages/StarsOfTheDay';
import BookStar from './pages/BookStar';
import EditListing from './pages/EditListing';

function PrivateRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  if (!adminOnly && user.role === 'admin') return <Navigate to="/admin" />;
  return children;
}

function GuestRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
        <Route path="/listings" element={<PublicListings />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/create-listing" element={<PrivateRoute><CreateListing /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute adminOnly><AdminPanel /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/stars" element={<StarsOfTheDay />} />
        <Route path="/book-star" element={<PrivateRoute><BookStar /></PrivateRoute>} />
        <Route path="/edit-listing/:id" element={<PrivateRoute><EditListing /></PrivateRoute>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}