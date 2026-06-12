import React, { useState, useContext } from 'react';
import AdminLayout from '../components/AdminLayout';
import { AuthContext, API_BASE_URL } from '../context/AuthContext';

export default function AdminSecurity() {
  const { token } = useContext(AuthContext);

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Status
  const [updateStatus, setUpdateStatus] = useState('UPDATE PASSWORD');

  // Dynamic Password Strength Calculator
  const getPasswordStrength = () => {
    if (!newPassword) return { score: 0, text: 'No Password', color: 'text-outline', bars: [false, false, false, false] };
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (newPassword.length >= 14) score++;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword)) score++;

    const texts = ['Weak', 'Moderate', 'Strong', 'Secure'];
    const colors = ['text-red-500', 'text-amber-500', 'text-blue-500', 'text-status-published'];
    
    // bars mapping
    const bars = [false, false, false, false];
    for (let i = 0; i < score; i++) {
      bars[i] = true;
    }

    return {
      score,
      text: `Password Strength: ${texts[score - 1] || 'Weak'}`,
      color: colors[score - 1] || 'text-red-500',
      bars
    };
  };

  const strength = getPasswordStrength();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 8) {
      alert('New password must be at least 8 characters long.');
      return;
    }

    setUpdateStatus('UPDATING...');

    fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update password');
        return data;
      })
      .then(() => {
        setUpdateStatus('SUCCESS!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setUpdateStatus('UPDATE PASSWORD');
        }, 3000);
      })
      .catch(err => {
        console.error(err);
        setUpdateStatus('ERROR');
        alert(err.message);
        setTimeout(() => setUpdateStatus('UPDATE PASSWORD'), 2000);
      });
  };

  return (
    <AdminLayout>
      <div className="p-margin-mobile md:p-stack-lg max-w-5xl mx-auto space-y-stack-lg">
        
        {/* Page Header */}
        <div className="mb-stack-lg">
          <span className="font-label-caps text-xs font-bold text-primary mb-2 block uppercase tracking-widest">
            System Authentication
          </span>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Password Security</h2>
          <p className="text-on-surface-variant font-body-md mt-2 max-w-2xl">
            Ensure your administrative account remains secure by using a robust password and following the portal's security guidelines.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="bento-grid">
          
          {/* Form Card (Col span 8) */}
          <div className="col-span-12 lg:col-span-8 bg-surface-card border border-outline-variant p-stack-lg rounded-lg shadow-sm">
            <h3 className="font-headline-sm text-headline-sm font-bold mb-6 border-b border-outline-variant/30 pb-2">
              Change Administrator Password
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-xl">
              
              {/* Current Password */}
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="current_password">
                  Current Password
                </label>
                <div className="relative">
                  <input 
                    id="current_password"
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="material-symbols-outlined absolute right-4 top-3.5 text-on-surface-variant cursor-pointer"
                  >
                    {showCurrent ? 'visibility_off' : 'visibility'}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="new_password">
                  New Password
                </label>
                <div className="relative">
                  <input 
                    id="new_password"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="material-symbols-outlined absolute right-4 top-3.5 text-on-surface-variant cursor-pointer"
                  >
                    {showNew ? 'visibility_off' : 'visibility'}
                  </button>
                </div>

                {/* Strength Indicators */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1 h-1.5 w-full">
                      {strength.bars.map((filled, idx) => (
                        <div 
                          key={idx}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            filled 
                              ? strength.score === 1 ? 'bg-red-500' 
                                : strength.score === 2 ? 'bg-amber-500'
                                : strength.score === 3 ? 'bg-blue-500'
                                : 'bg-status-published'
                              : 'bg-outline-variant'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-semibold ${strength.color} block`}>
                      {strength.text}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-2">
                <label className="font-label-caps text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="confirm_password">
                  Confirm New Password
                </label>
                <input 
                  id="confirm_password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                />
              </div>

              <div className="mt-4">
                <button 
                  type="submit"
                  disabled={updateStatus === 'UPDATING...'}
                  className={`text-on-primary font-label-caps text-xs font-bold px-8 py-4 rounded-lg hover:brightness-115 active:scale-95 transition-all shadow-sm cursor-pointer ${
                    updateStatus === 'SUCCESS!' ? 'bg-status-published' : 'bg-primary'
                  }`}
                >
                  {updateStatus}
                </button>
              </div>

            </form>
          </div>

          {/* Info Side Panel (Col span 4) */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            
            {/* Guidelines Card */}
            <div className="bg-surface-container-high p-stack-md border border-outline-variant rounded-lg">
              <div className="flex items-center gap-3 mb-4 text-primary font-bold">
                <span className="material-symbols-outlined">security</span>
                <span className="font-label-caps text-xs uppercase tracking-wider">PROPORTIONAL SECURITY</span>
              </div>
              <h4 className="font-body-lg font-bold mb-3 text-sm">Password Guidelines</h4>
              <ul className="text-on-surface-variant font-body-md text-xs space-y-3">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-status-published text-[18px]">check_circle</span>
                  <span>Minimum 8 characters (14+ recommended)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-status-published text-[18px]">check_circle</span>
                  <span>Include symbols, numbers, and case variation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-status-published text-[18px]">check_circle</span>
                  <span>Avoid common words or personal identifiers</span>
                </li>
              </ul>
            </div>

            {/* Graphic Server panel */}
            <div className="relative overflow-hidden h-48 rounded-lg border border-outline-variant group">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrhYdR-Z8eTl9ouyAKYCCQIyDW9p8fT_yElM0exrfr5k_mdoPsgRWnt7CNty0X8HR_j5JrhTscGQkkdCh4l-0jEtsKb2pC0X1W2Io0PXnq-G2gDT-nj2iuH9b0ly5pzvrrgmIbmBkDxHCnmyOhf0BqThXYulm5RA1K6RtRo_GApBvIGau3TEUYMy7P4jEucfhfVT5BHZL0SRc1gB6CAxYOPhGS2Rp7q3jviWEXOTupZ_c0fxvS1_JKTN-x8x5-rz4OP3gZLAB711Ho" 
                alt="Encrypted Portal" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-primary/20 mix-blend-overlay"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="bg-surface-container-lowest/90 backdrop-blur-sm px-3 py-1 rounded text-primary font-label-caps text-[10px] font-bold">
                  ENCRYPTED PORTAL
                </span>
              </div>
            </div>

            {/* Warn container */}
            <div className="bg-error-container p-stack-md rounded-lg flex items-start gap-3 border border-red-200">
              <span className="material-symbols-outlined text-red-700">warning</span>
              <div>
                <h5 className="text-red-700 font-bold text-xs">Critical Warning</h5>
                <p className="text-red-700/80 text-[11px] mt-1 leading-relaxed">
                  Changing your password will terminate all other active editorial sessions across devices.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
