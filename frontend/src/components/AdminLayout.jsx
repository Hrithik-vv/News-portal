import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function AdminLayout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'News Management', path: '/admin/dashboard', icon: 'dashboard' },
    { name: 'Profile Settings', path: '/admin/profile', icon: 'person_outline' },
    { name: 'Password Security', path: '/admin/security', icon: 'lock_reset' }
  ];

  const handleSignOutClick = (e) => {
    e.preventDefault();
    navigate('/admin/signout');
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  return (
    <div className="font-body-md text-on-surface min-h-screen bg-background">
      {/* Top Bar */}
      <header className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16 z-30 bg-surface border-b border-outline-variant fixed top-0 left-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMobileDrawer}
            className="lg:hidden p-2 hover:bg-surface-container-high transition-colors rounded-full cursor-pointer"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">NexWire</span>
        </div>
        <div className="flex items-center gap-stack-md">
          <span className="hidden md:block font-label-caps text-label-caps text-on-surface-variant">Admin Dashboard</span>
          <button
            onClick={() => navigate('/admin/profile')}
            className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container cursor-pointer overflow-hidden border border-primary/10"
            title="Profile"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined">account_circle</span>
            )}
          </button>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar for Desktop */}
        <aside className="hidden lg:flex flex-col h-[calc(100vh-64px)] w-80 fixed left-0 top-16 bg-surface-container-low border-r border-outline-variant z-20 overflow-y-auto">
          {/* User Profile Card */}
          <div className="p-8 flex flex-col items-start gap-2 border-b border-outline-variant/60">
            <div className="w-16 h-16 rounded-full bg-secondary-container mb-2 overflow-hidden border border-outline-variant">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name || "Editor"} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-4xl m-auto">person</span>
              )}
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{user?.name || 'Elena Vance'}</h3>
            <p className="text-on-surface-variant font-body-md text-sm">Newsroom Ops</p>
            <span className="font-label-caps text-label-caps text-primary text-xs font-bold mt-1">Admin Level 1</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col py-6 px-2 gap-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-4 mx-2 px-4 py-3 rounded-full transition-all active:scale-95 ${isActive
                      ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="font-body-md text-body-md">{item.name}</span>
                </Link>
              );
            })}
            <div className="my-4 border-t border-outline-variant mx-4"></div>
            <Link
              to="/"
              className="flex items-center gap-4 text-on-surface-variant mx-2 px-4 py-3 hover:bg-surface-container-highest rounded-full transition-all active:scale-95"
            >
              <span className="material-symbols-outlined">newspaper</span>
              <span className="font-body-md text-body-md">View News Site</span>
            </Link>
          </nav>

          {/* Logout button at bottom */}
          <div className="mt-auto p-4">
            <button
              onClick={handleSignOutClick}
              className="w-full flex items-center justify-center gap-3 text-on-secondary-fixed-variant hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-outline-variant/60 rounded-full py-3 px-4 transition-all cursor-pointer font-semibold text-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Sidebar Mobile Overlay & Drawer */}
        {mobileDrawerOpen && (
          <div
            onClick={toggleMobileDrawer}
            className="lg:hidden fixed inset-0 bg-black/40 z-40 mt-16"
          />
        )}
        <aside
          className={`lg:hidden fixed inset-y-0 left-0 z-40 mt-16 flex flex-col py-6 bg-surface border-r border-outline-variant w-80 transform transition-transform duration-300 ease-in-out ${mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          {/* User Profile Card Mobile */}
          <div className="px-6 pb-6 border-b border-outline-variant">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-3xl">person</span>
                )}
              </div>
              <div>
                <p className="font-body-md text-body-md font-bold text-on-surface">{user?.name || 'Elena Vance'}</p>
                <p className="text-[12px] text-on-surface-variant">Editor-in-Chief</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 py-4 flex flex-col gap-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={toggleMobileDrawer}
                  className={`flex items-center gap-4 mx-2 px-4 py-3 rounded-full transition-colors ${isActive
                      ? 'bg-primary-container text-on-primary-container font-bold'
                      : 'text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="font-body-md text-body-md">{item.name}</span>
                </Link>
              );
            })}
            <div className="my-4 border-t border-outline-variant mx-4"></div>
            <Link
              to="/"
              onClick={toggleMobileDrawer}
              className="flex items-center gap-4 text-on-surface-variant mx-2 px-4 py-3 hover:bg-surface-container-highest rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">newspaper</span>
              <span className="font-body-md text-body-md">View News Site</span>
            </Link>
          </nav>

          <div className="px-4 pb-20">
            <button
              onClick={handleSignOutClick}
              className="w-full flex items-center justify-center gap-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-full py-3 px-4 transition-all cursor-pointer font-semibold text-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Content Wrapper */}
        <div className="flex-grow min-h-[calc(100vh-64px)] lg:pl-80">
          <main className="w-full min-h-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
