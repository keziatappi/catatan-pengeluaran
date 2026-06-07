'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Theme initialization
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // Sun icon (shown in dark mode → click to switch to light)
  const sunIcon = (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );

  // Moon icon (shown in light mode → click to switch to dark)
  const moonIcon = (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );

  const navItems = [
    { 
      path: '/', 
      label: 'Dashboard', 
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    },
    { 
      path: '/transactions', 
      label: 'Transaksi', 
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="17" y1="10" x2="3" y2="10" />
          <polyline points="11 4 17 10 11 16" />
          <line x1="7" y1="14" x2="21" y2="14" />
          <polyline points="13 20 7 14 13 8" />
        </svg>
      )
    },
    { 
      path: '/accounts', 
      label: 'Rekening', 
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      )
    },
  ];

  return (
    <>
      {/* Mobile Header Menu Button */}
      <div className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setIsOpen(true)}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Image src="/favicon.ico" alt="DompetKu" width={28} height={28} style={{ borderRadius: '6px' }} />
          <span className="sidebar-logo-text">DompetKu</span>
        </div>
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          style={{ padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {theme === 'dark' ? sunIcon : moonIcon}
        </button>
      </div>

      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Floating Rail Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        
        {/* Top Logo (Floating above the sidebar rail) */}
        <div className="sidebar-logo-floating">
          <Image src="/favicon.ico" alt="DompetKu" width={30} height={30} style={{ borderRadius: '8px' }} />
          <span className="sidebar-logo-text-floating">DompetKu</span>
        </div>

        {/* Top Pills Group: Navigations */}
        <div className="sidebar-nav-pills-group" style={{ marginTop: '80px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                className={`sidebar-nav-pill-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  router.push(item.path);
                  setIsOpen(false);
                }}
                title={item.label}
              >
                {item.icon}
                <span className="sidebar-nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Middle Pills Group: Theme Toggle */}
        <div className="sidebar-nav-pills-group">
          <button 
            className="sidebar-nav-pill-item" 
            onClick={toggleTheme} 
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          >
            {theme === 'dark' ? sunIcon : moonIcon}
            <span className="sidebar-nav-label">
              {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            </span>
          </button>
        </div>

        {/* Bottom Floating Logout Pill Button */}
        <button 
          className="sidebar-logout-pill-btn" 
          onClick={handleLogout} 
          title="Keluar"
          style={{ marginBottom: '24px' }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>

      </aside>
    </>
  );
}
