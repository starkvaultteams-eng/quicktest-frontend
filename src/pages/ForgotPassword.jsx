import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { authAPI } from '../services/api';

export default function ForgotPassword() {
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setToken('');
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(username.trim());
      setMessage(res.data?.message || 'If the account exists, a reset token has been generated.');
      if (res.data?.resetToken) {
        setToken(res.data.resetToken);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-background-dark bg-background-light flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[460px] glass-card rounded-xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Forgot Password</h1>
          <p className="text-sm text-slate-500 mb-6">
            Enter your username to start password reset.
          </p>

          {message && <p className="mb-4 text-sm text-green-600">{message}</p>}
          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl h-12 px-4 text-slate-900 dark:text-white"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Please wait...' : 'Send Reset Token'}
            </button>
          </form>

          {token && (
            <div className="mt-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                Reset token (dev/testing):
              </p>
              <code className="text-xs break-all text-amber-700 dark:text-amber-300">{token}</code>
            </div>
          )}

          <div className="mt-6 text-sm">
            <Link to="/reset-password" className="text-primary font-bold hover:underline">
              Already have a token? Reset password
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
