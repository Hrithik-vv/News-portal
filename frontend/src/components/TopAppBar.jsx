import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function TopAppBar() {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  const categories = [
    { name: 'Tech', path: '/category/Tech' },
    { name: 'Politics', path: '/category/Politics' },
    { name: 'Sports', path: '/category/Sports' },
    { name: 'Economy', path: '/category/Economy' },
    { name: 'Health', path: '/category/Health' }
  ];

  const handleProfileClick = () => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    } else {
      navigate('/admin/login');
    }
  };

  return (
    <>
      {/* Top Header */}
      <header className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16 z-40 bg-surface border-b border-outline-variant sticky top-0 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleDrawer}
            className="material-symbols-outlined text-primary hover:bg-surface-container-high p-2 rounded-full transition-colors cursor-pointer active:scale-95"
          >
            menu
          </button>
          <Link to="/" className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight select-none">
            NexWire
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-stack-md">
          <nav className="flex gap-4">
            <Link
              to="/"
              className={`font-label-caps text-label-caps px-3 py-1 rounded transition-colors ${location.pathname === '/'
                  ? 'text-primary font-bold bg-surface-container-low'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
            >
              Home
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                className={`font-label-caps text-label-caps px-3 py-1 rounded transition-colors ${location.pathname === cat.path
                    ? 'text-primary font-bold bg-surface-container-low'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
          <div className="h-6 w-px bg-outline-variant mx-2"></div>

          <button
            onClick={handleProfileClick}
            className="flex items-center gap-2 text-primary hover:bg-surface-container-high p-2 rounded-full transition-colors cursor-pointer active:scale-95"
            title={isAuthenticated ? 'Admin Dashboard' : 'Admin Login'}
          >
            {isAuthenticated && user?.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-primary/20"
              />
            ) : (
              <span className="material-symbols-outlined text-3xl">account_circle</span>
            )}
          </button>
        </div>

        {/* Mobile profile icon */}
        <div className="md:hidden">
          <button
            onClick={handleProfileClick}
            className="text-primary p-2 active:opacity-80"
          >
            {isAuthenticated && user?.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                className="w-7 h-7 rounded-full object-cover border border-primary/20"
              />
            ) : (
              <span className="material-symbols-outlined text-3xl">account_circle</span>
            )}
          </button>
        </div>
      </header>

      {/* Slide-out Mobile Drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 transition-opacity"
          onClick={toggleDrawer}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col py-6 h-full w-80 bg-surface border-r border-outline-variant shadow-lg transform transition-transform ease-in-out duration-300 ${drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="px-6 mb-8 flex justify-between items-center">
          <span className="font-headline-md text-headline-md font-bold text-primary">NexWire</span>
          <button
            className="material-symbols-outlined text-on-surface-variant p-1 rounded-full hover:bg-surface-container-high cursor-pointer"
            onClick={toggleDrawer}
          >
            close
          </button>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          <Link
            to="/"
            onClick={toggleDrawer}
            className={`mx-2 px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${location.pathname === '/' ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container-highest'
              }`}
          >
            <span className="material-symbols-outlined">home</span> Home
          </Link>
          {categories.map(cat => (
            <Link
              key={cat.name}
              to={cat.path}
              onClick={toggleDrawer}
              className={`mx-2 px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${location.pathname === cat.path ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
            >
              <span className="material-symbols-outlined">
                {cat.name === 'Tech' ? 'computer' : cat.name === 'Politics' ? 'policy' : cat.name === 'Sports' ? 'sports_soccer' : 'trending_up'}
              </span>
              {cat.name}
            </Link>
          ))}
          <div className="my-4 border-t border-outline-variant mx-6"></div>
          <Link
            to={isAuthenticated ? "/admin/dashboard" : "/admin/login"}
            onClick={toggleDrawer}
            className="mx-2 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-highest flex items-center gap-3 transition-colors"
          >
            <span className="material-symbols-outlined">admin_panel_settings</span>
            {isAuthenticated ? 'Admin Dashboard' : 'Admin Login'}
          </Link>
        </nav>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-2 py-2 md:hidden bg-surface border-t border-outline-variant shadow-lg">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all active:scale-95 ${location.pathname === '/' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant'
            }`}
        >
          <span className="material-symbols-outlined text-2xl">home</span>
          <span className="font-label-caps text-[10px] mt-0.5">Home</span>
        </Link>
        <Link
          to="/category/Tech"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all active:scale-95 ${location.pathname.startsWith('/category/') ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant'
            }`}
        >
          <span className="material-symbols-outlined text-2xl">grid_view</span>
          <span className="font-label-caps text-[10px] mt-0.5">Categories</span>
        </Link>
        <Link
          to={isAuthenticated ? "/admin/dashboard" : "/admin/login"}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all active:scale-95 ${location.pathname.startsWith('/admin') ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant'
            }`}
        >
          <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
          <span className="font-label-caps text-[10px] mt-0.5">Admin</span>
        </Link>
      </nav>
    </>
  );
}
