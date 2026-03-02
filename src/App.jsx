import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import Admin from './pages/Admin';
// History page deprecated and link removed
import Leaderboard from './pages/Leaderboard';
import Upload from './pages/Upload';
import NotFound from './pages/NotFound';

function PrivateRoute({ children }) {
  const { isAuth, loading } = useAuth();
  
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  
  return isAuth ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  
  return user?.isAdmin ? children : <Navigate to="/dashboard" />;
}

function AppRoutes() {
  const { isAuth } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isAuth ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={isAuth ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={isAuth ? <Navigate to="/dashboard" /> : <Register />} />
      
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
      
      <Route path="/quiz" element={
        <PrivateRoute>
          <Quiz />
        </PrivateRoute>
      } />
      
      <Route path="/results" element={
        <PrivateRoute>
          <Results />
        </PrivateRoute>
      } />
      
      <Route path="/leaderboard" element={
        <PrivateRoute>
          <Leaderboard />
        </PrivateRoute>
      } />
      <Route path="/upload" element={
        <PrivateRoute>
          <Upload />
        </PrivateRoute>
      } />
      
      <Route path="/admin" element={
        <AdminRoute>
          <Admin />
        </AdminRoute>
      } />
      {/* explicit 404 route (useful for redirects from code) */}
      <Route path="/404" element={<NotFound />} />
      {/* catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
