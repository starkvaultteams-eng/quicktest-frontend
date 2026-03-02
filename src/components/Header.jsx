import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { MdSchool, MdMenu, MdClose } from 'react-icons/md';

export default function Header() {
  const { isAuth, logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-primary/10 px-6 py-4 lg:px-20 bg-white/5 dark:bg-slate-900/40 backdrop-blur-md">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-4 text-primary hover:opacity-80 transition-opacity">
        <div className="size-10 flex items-center justify-center rounded-lg bg-primary/10">
          <MdSchool className="text-3xl" />
        </div>
        <div className="flex flex-col hidden sm:block">
          <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em]">QuickTest</h2>
        </div>
      </Link>

      {/* Center Navigation */}
      {isAuth && (
        <div className="hidden md:flex flex-1 justify-center gap-8 px-8">
          <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
          <Link to="/quiz" className="text-sm font-medium hover:text-primary transition-colors">Quiz</Link>
          <Link to="/leaderboard" className="text-sm font-medium hover:text-primary transition-colors">Leaderboard</Link>
          <Link to="/upload" className="text-sm font-medium hover:text-primary transition-colors">Upload</Link>
          {user?.isAdmin && (
            <Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors">Admin</Link>
          )}
        </div>
      )}

      {/* Right Section */}
      <div className="flex items-center gap-4">
  
        {/* Auth Buttons */}
        {!isAuth ? (
          <div className="hidden md:flex gap-3 text-slate-100 opacity-100 transition-opacity">
            <Link to="/login">
              <button className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors">
                Login
              </button>
            </Link>
            <Link to="/register">
              <button className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all">
                Sign Up
              </button>
            </Link>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10">
              <div className="w-6 h-6 rounded-full bg-primary/20" />
              <span className="text-sm font-medium truncate max-w-[120px]">{user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
            >
              Logout
            </button>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-100 dark:text-slate-100"
        >
          {mobileMenuOpen ? <MdClose /> : <MdMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-primary/10 p-4 md:hidden flex flex-col gap-3">
          {isAuth ? (
            <>
              <Link to="/dashboard" className="px-3 py-2 text-slate-900 dark:text-slate-100 hover:bg-primary/10 rounded-lg">Dashboard</Link>
              <Link to="/quiz" className="px-3 py-2 text-slate-900 dark:text-slate-100 hover:bg-primary/10 rounded-lg">Quiz</Link>
              <Link to="/upload" className="px-3 py-2 text-slate-900 dark:text-slate-100 hover:bg-primary/10 rounded-lg">Upload</Link>
              {user?.isAdmin && (
                <Link to="/admin" className="px-3 py-2 text-slate-900 dark:text-slate-100 hover:bg-primary/10 rounded-lg">Admin</Link>
              )}
              <button onClick={handleLogout} className="px-3 py-2 text-left text-red-500 hover:bg-primary/10 rounded-lg">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 text-slate-900 dark:text-slate-100 hover:bg-primary/10 rounded-lg">Login</Link>
              <Link to="/register" className="px-3 py-2 bg-primary text-white rounded-lg">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
