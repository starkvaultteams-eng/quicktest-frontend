import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Header from '../components/Header';
import { MdLockOpen, MdPerson, MdLock, MdVisibility, MdVisibilityOff, MdHourglassEmpty, MdVerifiedUser } from 'react-icons/md';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isValid = formData.username.trim() && formData.password.trim();
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authAPI.login(formData.username, formData.password);
      const { token, isAdmin } = response.data;

      // construct user object
      const userObj = { username: formData.username, isAdmin };
      login(userObj, token);
      navigate('/dashboard');
    } catch (err) {
      console.error('login error', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-background-dark bg-background-light flex flex-col overflow-x-hidden">
      {/* Ambient Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] orange-glow pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] orange-glow pointer-events-none" />

      <Header />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative z-10">
        {/* Glassmorphic Card Container */}
        <div className="w-full max-w-[440px] glass-card rounded-xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
              <MdLockOpen className="text-primary text-3xl" />
            </div>
            <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight text-center">Welcome Back</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm text-center">Study smart.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-medium px-1">Username</label>
              <div className="relative group">
                <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  name="username"
                  autoComplete="off"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className={`w-full bg-slate-100/50 dark:bg-slate-800/50 border rounded-xl h-14 pl-12 pr-4 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none ${error.toLowerCase().includes('username') ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-medium px-1">Password</label>
              <div className="relative group">
                <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="off"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full bg-slate-100/50 dark:bg-slate-800/50 border rounded-xl h-14 pl-12 pr-12 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none ${error.toLowerCase().includes('password') ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <MdVisibilityOff className="text-xl" /> : <MdVisibility className="text-xl" />}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot Password?</Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isValid}
              className="w-full flex items-center justify-center rounded-xl h-14 bg-primary text-white text-base font-bold transition-all hover:bg-primary/90 active:scale-[0.98] shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <MdHourglassEmpty className="animate-spin" />
              ) : (
                'Login to Practice'
              )}
            </button>
          </form>

          {/* Footer Highlights */}
          <div className="mt-10 pt-6 border-t border-slate-200/10 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <MdVerifiedUser className="text-emerald-500 text-sm" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-500">Secured with JWT Authentication</span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Branding Footer */}
        <footer className="mt-auto py-8 flex flex-col items-center gap-2 opacity-60">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Made with ❤️ by Olawale</p>
          <p className="text-[10px] text-slate-500/60">© 2025. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
