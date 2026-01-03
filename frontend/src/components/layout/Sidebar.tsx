import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Send,
  ClipboardCheck,
  FileSearch,
  BarChart3,
  Users,
  Settings,
  Building2,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { colors } from '../../styles/constants';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'Tenders', path: '/tenders', roles: ['Admin', 'Tender Officer', 'Evaluator', 'Viewer'] },
  { icon: Send, label: 'My Bids', path: '/bids', roles: ['Bidder'] },
  { icon: ClipboardCheck, label: 'Evaluation', path: '/evaluation', roles: ['Admin', 'Tender Officer', 'Evaluator'] },
  { icon: FileSearch, label: 'RFP Generator', path: '/rfp', roles: ['Admin', 'Tender Officer'] },
  { icon: BarChart3, label: 'Reports', path: '/reports', roles: ['Admin', 'Tender Officer'] },
  { icon: Users, label: 'Users', path: '/admin/users', roles: ['Admin'] },
  { icon: Building2, label: 'Departments', path: '/admin/departments', roles: ['Admin'] },
  { icon: Settings, label: 'Settings', path: '/admin/settings', roles: ['Admin'] },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="sidebar-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 30,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className="sidebar-container"
        style={{
          position: 'fixed',
          left: 0,
          top: '64px',
          height: 'calc(100vh - 64px)',
          width: '256px',
          backgroundColor: colors.primary,
          color: 'white',
          boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
          zIndex: 30,
          transition: 'transform 0.3s ease-in-out',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="sidebar-close-btn"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            padding: '4px',
            color: 'rgba(255, 255, 255, 0.7)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <X style={{ width: '20px', height: '20px' }} />
        </button>

        <nav style={{ padding: '16px 0', marginTop: '32px' }} className="sidebar-nav">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path ||
                           location.pathname.startsWith(item.path + '/');
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'background-color 0.15s',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  borderRight: isActive ? `4px solid ${colors.accent}` : '4px solid transparent',
                  color: isActive ? 'white' : '#cbd5e0',
                }}
              >
                <Icon style={{ width: '20px', height: '20px', marginRight: '12px' }} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.5)',
              textAlign: 'center',
              margin: 0,
            }}
          >
            ATEMS v1.0.0
          </p>
        </div>
      </aside>
      <style>{`
        @media (min-width: 1024px) {
          .sidebar-container {
            transform: translateX(0) !important;
          }
          .sidebar-overlay {
            display: none !important;
          }
          .sidebar-close-btn {
            display: none !important;
          }
          .sidebar-nav {
            margin-top: 0 !important;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
