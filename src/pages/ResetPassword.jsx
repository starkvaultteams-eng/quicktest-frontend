import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { authAPI } from '../services/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.resetPassword(token.trim(), newPassword);
      setMessage(res.data?.message || 'Password reset successful.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-background-dark bg-background-light flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[460px] glass-card rounded-xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Reset Password</h1>
          <p className="text-sm text-slate-500 mb-6">
            Paste your token and set a new password.
          </p>

          {message && <p className="mb-4 text-sm text-green-600">{message}</p>}
          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Reset token"
              className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl h-12 px-4 text-slate-900 dark:text-white"
              required
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl h-12 px-4 text-slate-900 dark:text-white"
              required
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl h-12 px-4 text-slate-900 dark:text-white"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Please wait...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-sm">
            <Link to="/login" className="text-primary font-bold hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
