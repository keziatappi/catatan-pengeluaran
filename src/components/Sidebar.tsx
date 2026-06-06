'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface UserInfo {
  id: number;
  username: string;
  name: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});

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

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/transactions', label: 'Transaksi', icon: '💳' },
    { path: '/accounts', label: 'Rekening', icon: '🏦' },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setIsOpen(true)}>
          ☰
        </button>
        <div className="sidebar-logo">
          <span className="sidebar-logo-text">DompetKu</span>
        </div>
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          style={{ fontSize: 20, padding: 8 }}
          title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div>
              <div className="sidebar-logo-text">DompetKu</div>
              <div className="sidebar-logo-sub">Catatan Keuangan</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`sidebar-nav-item ${pathname === item.path ? 'active' : ''}`}
              onClick={() => {
                router.push(item.path);
                setIsOpen(false);
              }}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}

          {/* Theme Toggle Button inside Sidebar */}
          <button
            className="sidebar-nav-item"
            onClick={toggleTheme}
            style={{ width: '100%', textAlign: 'left', marginTop: 'auto' }}
          >
            <span className="sidebar-nav-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
            {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user ? getInitials(user.name) : '...'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'Loading...'}</div>
              <div className="sidebar-user-role">@{user?.username || '...'}</div>
            </div>
            <button
              className="sidebar-logout-btn"
              onClick={handleLogout}
              title="Keluar"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
