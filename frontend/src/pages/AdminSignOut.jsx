import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function AdminSignOut() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleGoBack = () => {
    navigate(-1); // Go back in history
  };

  return (
    <div className="font-body-md text-on-background min-h-screen flex flex-col bg-background">
      
      {/* Top Header */}
      <header className="w-full top-0 sticky bg-surface border-b border-outline-variant z-40 flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop shadow-sm">
        <div className="font-display-lg text-headline-sm font-bold text-primary">Editorial Admin</div>
        <div className="flex items-center gap-2">
          <span className="font-label-caps text-[10px] font-bold text-secondary tracking-wider">SESSION ACTIVE</span>
          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center border border-outline-variant">
            <span className="material-symbols-outlined text-outline text-lg">person</span>
          </div>
        </div>
      </header>

      {/* Main Sign Out box */}
      <main className="flex-grow flex items-center justify-center p-margin-mobile">
        <div className="max-w-md w-full bg-surface-card border border-outline-variant p-8 shadow-md rounded-lg relative overflow-hidden">
          
          {/* Decorative blue header border */}
          <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-4 border border-outline-variant">
              <span className="material-symbols-outlined text-primary text-4xl">logout</span>
            </div>
            <h1 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">Sign Out</h1>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              Are you sure you want to sign out? You will need to log back in to manage editorial content.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleSignOut}
              className="w-full bg-primary-container text-on-primary-container py-3 px-4 font-label-caps text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer border border-primary/20"
            >
              Sign Out
              <span className="material-symbols-outlined text-[18px]">exit_to_app</span>
            </button>
            <button 
              onClick={handleGoBack}
              className="w-full border border-on-surface text-on-surface py-3 px-4 font-label-caps text-xs font-bold flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors cursor-pointer active:scale-[0.98]"
            >
              Go Back
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
          </div>

          {/* Dialog footer info */}
          <div className="mt-6 pt-4 border-t border-outline-variant/60">
            <div className="flex items-center justify-between text-on-secondary-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  security
                </span>
                <span className="text-[10px] font-label-caps font-bold">Secure Session</span>
              </div>
              <span className="text-[10px] font-label-caps font-bold text-outline">ID: ADM-8829-QX</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 mt-auto bg-surface-container-low border-t border-outline-variant flex flex-col md:flex-row justify-between items-center px-margin-desktop gap-3 text-xs text-on-surface-variant">
        <div className="font-label-caps opacity-75">
          © 2026 Global News Editorial System. All Rights Reserved.
        </div>
        <div className="flex gap-4 font-semibold">
          <a className="hover:underline" href="#">Support</a>
          <a className="hover:underline" href="#">Documentation</a>
          <a className="hover:underline" href="#">Terms</a>
        </div>
      </footer>
    </div>
  );
}
