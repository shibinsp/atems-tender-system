import React from 'react';
import { Bell, User, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const [showMenu, setShowMenu] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        backgroundColor: '#fff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
      }}
    >
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={toggleSidebar}
          className="lg-hide"
          style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6 }}
        >
          <Menu size={20} color="#4a5568" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              backgroundColor: '#1e3a5f',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            A
          </div>
          <div className="hide-mobile">
            <h1 style={{ fontSize: 16, fontWeight: 600, color: '#1e3a5f', margin: 0 }}>ATEMS</h1>
            <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Tender Management</p>
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          style={{
            position: 'relative',
            padding: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            borderRadius: 6,
          }}
        >
          <Bell size={20} color="#4a5568" />
          <span
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 8,
              height: 8,
              backgroundColor: '#ef4444',
              borderRadius: '50%',
            }}
          />
        </button>

        {/* User Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 6,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                backgroundColor: '#1e3a5f',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={16} color="#fff" />
            </div>
            <span className="hide-mobile" style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>
              {user?.full_name?.split(' ')[0] || 'User'}
            </span>
          </button>

          {showMenu && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setShowMenu(false)} />
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: 4,
                  width: 200,
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  border: '1px solid #e5e7eb',
                  zIndex: 20,
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#111', margin: 0 }}>{user?.full_name}</p>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>{user?.email}</p>
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: 6,
                      padding: '2px 8px',
                      fontSize: 11,
                      fontWeight: 500,
                      backgroundColor: '#dbeafe',
                      color: '#1d4ed8',
                      borderRadius: 4,
                    }}
                  >
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    fontSize: 14,
                    color: '#dc2626',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 639px) { .hide-mobile { display: none !important; } }
        @media (min-width: 1024px) { .lg-hide { display: none !important; } }
      `}</style>
    </header>
  );
};

export default Header;
