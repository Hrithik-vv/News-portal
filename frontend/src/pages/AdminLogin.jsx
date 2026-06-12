import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, API_BASE_URL } from '../context/AuthContext';

export default function AdminLogin() {
  const { login, isAuthenticated } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('SIGN IN TO DASHBOARD');
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setErrorMsg(null);
    setLoading(true);
    setStatusText('VERIFYING IDENTITY...');

    // Post to API
    fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Login failed');
        }
        return data;
      })
      .then(data => {
        setStatusText('SUCCESS');
        setTimeout(() => {
          login(data.token, data.user);
          navigate('/admin/dashboard');
        }, 800);
      })
      .catch(err => {
        console.error(err);
        setErrorMsg(err.message);
        setLoading(false);
        setStatusText('SIGN IN TO DASHBOARD');
      });
  };

  return (
    <div className="bg-background text-on-surface font-body-md antialiased min-h-screen flex flex-col login-canvas">

      {/* Header */}
      <header className="w-full h-16 flex items-center px-margin-mobile md:px-margin-desktop border-b border-outline-variant bg-surface shadow-sm">
        <h1 className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight cursor-pointer" onClick={() => navigate('/')}>
          NexWire
        </h1>
      </header>

      {/* Main Form container */}
      <main className="flex-grow flex items-center justify-center px-margin-mobile py-stack-lg">
        <div className="w-full max-w-[440px] bg-white border border-outline-variant p-8 md:p-10 auth-card rounded-lg relative overflow-hidden">

          {/* Decorative blue header border */}
          <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>

          <div className="flex flex-col items-center mb-6">
            <span className="material-symbols-outlined text-primary text-5xl mb-2">admin_panel_settings</span>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface text-center">Administrator Access</h2>
            <p className="font-body-md text-sm text-on-surface-variant text-center mt-2 leading-relaxed">
              Secure editorial and system portal login.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-error-container p-3 rounded text-on-error-container text-xs font-semibold mb-4 text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="font-label-caps text-[10px] font-bold text-on-surface-variant block uppercase tracking-wider" htmlFor="email">
                USERNAME OR EMAIL
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  mail
                </span>
                <input
                  id="email"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Admin"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md text-body-md placeholder:text-outline text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-label-caps text-[10px] font-bold text-on-surface-variant block uppercase tracking-wider" htmlFor="password">
                  PASSWORD
                </label>
                <a className="font-label-caps text-[10px] font-bold text-primary hover:underline cursor-pointer" onClick={() => alert('Default password is password123')}>
                  FORGOT?
                </a>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-3 bg-surface-container-low border border-outline-variant rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md text-body-md placeholder:text-outline text-sm"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember workstation */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary transition-all cursor-pointer"
              />
              <label htmlFor="remember" className="ml-2 font-body-md text-sm text-on-surface-variant cursor-pointer select-none">
                Remember this workstation
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-on-primary py-4 px-6 rounded-lg font-label-caps text-xs font-bold tracking-widest hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer ${statusText === 'SUCCESS' ? 'bg-status-published' : 'bg-primary'
                }`}
            >
              {loading && statusText !== 'SUCCESS' && (
                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
              )}
              {statusText === 'SUCCESS' && (
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              )}
              {statusText}
              {statusText === 'SIGN IN TO DASHBOARD' && (
                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-outline-variant">
            <p className="font-label-caps text-[9px] font-bold text-outline text-center tracking-wider">
              AUTHORIZED PERSONNEL ONLY
            </p>
            <p className="font-body-md text-[11px] text-on-surface-variant text-center mt-2 leading-tight">
              IP Logging and session monitoring is active for all administrative actions to ensure editorial integrity.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full flex flex-col items-center py-4 px-margin-desktop gap-1 border-t border-outline-variant bg-surface-container-low mt-auto text-xs text-on-surface-variant">
        <p className="font-label-caps">© 2026 NexWire. Authoritative Editorial Excellence.</p>
        <div className="flex gap-4 font-semibold">
          <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-primary transition-colors" href="#">Security Standards</a>
        </div>
      </footer>
    </div>
  );
}
