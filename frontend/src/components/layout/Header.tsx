import React from 'react';
import { Bell, User, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { colors } from '../../styles/constants';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

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
        height: '64px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        zIndex: 40,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          padding: '0 16px',
        }}
      >
        {/* Left Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={toggleSidebar}
            className="mobile-menu-btn"
            style={{
              padding: '8px',
              color: '#4a5568',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'block',
            }}
          >
            <Menu style={{ width: '20px', height: '20px' }} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: colors.primary,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>A</span>
            </div>
            <div className="header-title">
              <h1 style={{ fontSize: '18px', fontWeight: 600, color: colors.primary, margin: 0 }}>
                ATEMS
              </h1>
              <p style={{ fontSize: '12px', color: '#718096', margin: 0 }}>
                AI Tender Evaluation System
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Notifications */}
          <button
            style={{
              position: 'relative',
              padding: '8px',
              color: '#4a5568',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            <Bell style={{ width: '20px', height: '20px' }} />
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                backgroundColor: '#e53e3e',
                borderRadius: '50%',
              }}
            />
          </button>

          {/* User Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: colors.primary,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <User style={{ width: '16px', height: '16px', color: 'white' }} />
              </div>
              <span
                className="user-name"
                style={{ fontSize: '14px', fontWeight: 500, color: '#4a5568' }}
              >
                {user?.full_name || 'User'}
              </span>
              <ChevronDown
                className="user-chevron"
                style={{ width: '16px', height: '16px', color: '#718096' }}
              />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: '8px',
                  width: '192px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0',
                  padding: '4px 0',
                  zIndex: 50,
                }}
              >
                <div
                  style={{
                    padding: '8px 16px',
                    borderBottom: '1px solid #f7fafc',
                  }}
                >
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#1a202c', margin: 0 }}>
                    {user?.full_name}
                  </p>
                  <p style={{ fontSize: '12px', color: '#718096', margin: 0 }}>{user?.email}</p>
                  <p
                    style={{
                      fontSize: '12px',
                      color: colors.primary,
                      fontWeight: 500,
                      marginTop: '4px',
                      marginBottom: 0,
                    }}
                  >
                    {user?.role}
                  </p>
                </div>
                <button
                  onClick={() => setShowUserMenu(false)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 16px',
                    fontSize: '14px',
                    color: '#4a5568',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <User style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 16px',
                    fontSize: '14px',
                    color: '#e53e3e',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <LogOut style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @media (min-width: 1024px) {
          .mobile-menu-btn {
            display: none !important;
          }
        }
        @media (max-width: 639px) {
          .header-title {
            display: none;
          }
          .user-name, .user-chevron {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
