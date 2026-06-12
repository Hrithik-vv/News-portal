import React, { useState, useEffect, useContext } from 'react';
import AdminLayout from '../components/AdminLayout';
import { AuthContext, API_BASE_URL } from '../context/AuthContext';

export default function AdminProfile() {
  const { token, user, updateProfile, handleAuthError } = useContext(AuthContext);
  
  // Profile form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  
  // Stats
  const [lastLogin, setLastLogin] = useState('2 hours ago');
  const [publishedCount, setPublishedCount] = useState(0);
  const [emailAlerts, setEmailAlerts] = useState(true);

  // UI state
  const [saveStatus, setSaveStatus] = useState('SAVE CHANGES');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Get profile
      fetch(`${API_BASE_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (res.status === 401 || res.status === 403) {
            handleAuthError(res.status);
            throw new Error('Session expired');
          }
          return res.json();
        })
        .then(profile => {
          setName(profile.name);
          setEmail(profile.email);
          setBio(profile.bio || '');
          setAvatar(profile.avatar || '');
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });

      // Get count of articles by this user (total count)
      fetch(`${API_BASE_URL}/news`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(posts => {
          setPublishedCount(posts.length);
        })
        .catch(err => console.error(err));
    }
  }, [token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Name and username/email are required.');
      return;
    }

    setSaveStatus('SAVING...');
    
    fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, email, bio, avatar })
    })
      .then(async res => {
        if (res.status === 401 || res.status === 403) {
          handleAuthError(res.status);
          throw new Error('Session expired. Please log in again.');
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update profile');
        return data;
      })
      .then(updated => {
        setSaveStatus('SUCCESS!');
        updateProfile(updated);
        setTimeout(() => {
          setSaveStatus('SAVE CHANGES');
        }, 2000);
      })
      .catch(err => {
        console.error(err);
        setSaveStatus('ERROR');
        alert(err.message);
        setTimeout(() => setSaveStatus('SAVE CHANGES'), 2000);
      });
  };

  const handleUploadPhoto = () => {
    const newUrl = window.prompt('Enter image URL for new profile photo:', avatar);
    if (newUrl !== null) {
      setAvatar(newUrl);
    }
  };

  return (
    <AdminLayout>
      <div className="p-margin-mobile md:p-stack-lg max-w-5xl mx-auto space-y-stack-lg">
        {/* Page Header */}
        <div className="mb-stack-lg">
          <h1 className="font-display-lg text-display-lg font-bold text-primary mb-2">Profile Settings</h1>
          <p className="font-body-lg text-body-lg text-secondary">Manage your public editorial presence and account details.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="material-symbols-outlined animate-spin text-3xl text-primary mr-2">sync</span>
            <span className="font-label-caps text-xs font-bold text-outline">Loading profile parameters...</span>
          </div>
        ) : (
          <div className="bento-grid">
            
            {/* User Identity Card (Col span 4) */}
            <div className="col-span-12 lg:col-span-4 bg-surface-card border border-outline-variant p-stack-lg flex flex-col items-center text-center rounded-lg shadow-sm">
              <div className="relative group cursor-pointer mb-6" onClick={handleUploadPhoto}>
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-primary ring-4 ring-primary-container/10">
                  {avatar ? (
                    <img src={avatar} alt={name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  ) : (
                    <span className="material-symbols-outlined text-6xl text-outline m-auto h-full w-full flex items-center justify-center bg-surface-container">
                      person
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                </div>
              </div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{name}</h3>
              <p className="font-label-caps text-label-caps text-primary mt-1 font-bold text-xs tracking-wider">EDITOR-IN-CHIEF</p>
              
              <div className="mt-8 w-full pt-4 border-t border-outline-variant/60">
                <button 
                  onClick={handleUploadPhoto}
                  className="w-full py-3 px-4 border border-on-surface text-on-surface font-label-caps text-xs font-bold hover:bg-surface-container-high transition-colors cursor-pointer active:scale-95"
                >
                  UPLOAD NEW PHOTO
                </button>
              </div>
            </div>

            {/* Form Card (Col span 8) */}
            <div className="col-span-12 lg:col-span-8 bg-surface-card border border-outline-variant p-stack-lg rounded-lg shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-label-caps text-[10px] font-bold text-secondary tracking-wider uppercase">FULL NAME</label>
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 font-body-md text-sm text-on-surface focus:border-primary transition-all outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-caps text-[10px] font-bold text-secondary tracking-wider uppercase">USERNAME OR EMAIL</label>
                    <input 
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 font-body-md text-sm text-on-surface focus:border-primary transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-[10px] font-bold text-secondary tracking-wider uppercase">EDITORIAL BIO</label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows="5"
                    className="bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 font-body-md text-sm text-on-surface focus:border-primary transition-all resize-none outline-none"
                  />
                  <p className="text-[11px] text-secondary mt-1 italic">This bio will be visible on your public author profile.</p>
                </div>

                <div className="pt-6 border-t border-outline-variant/60 flex justify-end gap-4">
                  <button 
                    type="button"
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 border border-on-surface text-on-surface font-label-caps text-xs font-bold hover:bg-surface-container-high transition-all active:scale-95 cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button 
                    type="submit"
                    disabled={saveStatus === 'SAVING...'}
                    className={`px-8 py-3 text-on-primary font-label-caps text-xs font-bold hover:brightness-105 transition-all active:scale-95 shadow-sm cursor-pointer ${
                      saveStatus === 'SUCCESS!' ? 'bg-status-published' : 'bg-primary'
                    }`}
                  >
                    {saveStatus}
                  </button>
                </div>
              </form>
            </div>

            {/* Stats/Activity Bento Cell */}
            <div className="col-span-12 md:col-span-6 bg-surface-container-low p-stack-lg border border-outline-variant rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-label-caps text-xs font-bold text-primary tracking-wider uppercase">ACCOUNT ACTIVITY</h4>
                <span className="material-symbols-outlined text-secondary">history</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                  <span className="font-body-md text-sm text-on-surface-variant">Last Login</span>
                  <span className="font-body-md text-sm font-bold">{lastLogin}</span>
                </div>
                <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                  <span className="font-body-md text-sm text-on-surface-variant">Articles Under Management</span>
                  <span className="font-body-md text-sm font-bold">{publishedCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body-md text-sm text-on-surface-variant">Security Status</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-status-published/10 text-status-published font-status-label text-[10px] uppercase font-bold tracking-wider">
                    Secure
                  </span>
                </div>
              </div>
            </div>

            {/* Preferences Bento Cell */}
            <div className="col-span-12 md:col-span-6 bg-primary-container text-on-primary-container p-stack-lg border border-primary flex flex-col justify-between rounded-lg shadow-sm">
              <div>
                <h4 className="font-label-caps text-xs font-bold opacity-80 mb-2 uppercase tracking-wider">EDITORIAL PREFERENCES</h4>
                <p className="font-headline-sm text-lg font-bold mb-4">Notification Center</p>
              </div>
              <div className="flex items-center gap-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-primary-fixed-dim rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-on-primary-container"></div>
                </label>
                <span className="font-body-md text-sm font-medium">Enable Real-time Breaking Alerts</span>
              </div>
            </div>

          </div>
        )}
      </div>
    </AdminLayout>
  );
}
