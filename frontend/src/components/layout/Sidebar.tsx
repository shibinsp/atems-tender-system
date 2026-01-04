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
  X,
  ChevronLeft,
  ChevronRight,
  FileSignature,
  PieChart,
  Calendar,
  Shield
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

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
  { icon: FileSignature, label: 'Contracts', path: '/contracts', roles: ['Admin', 'Tender Officer'] },
  { icon: Calendar, label: 'Calendar', path: '/calendar', roles: ['Admin', 'Tender Officer', 'Evaluator'] },
  { icon: PieChart, label: 'Analytics', path: '/analytics', roles: ['Admin', 'Tender Officer'] },
  { icon: FileSearch, label: 'RFP Generator', path: '/rfp', roles: ['Admin', 'Tender Officer'] },
  { icon: BarChart3, label: 'Reports', path: '/reports', roles: ['Admin', 'Tender Officer'] },
  { icon: Users, label: 'Users', path: '/admin/users', roles: ['Admin'] },
  { icon: Building2, label: 'Departments', path: '/admin/departments', roles: ['Admin'] },
  { icon: Shield, label: 'Security', path: '/security' },
  { icon: Settings, label: 'Settings', path: '/admin/settings', roles: ['Admin'] },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, toggleSidebarCollapse } = useUIStore();

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  const sidebarWidth = sidebarCollapsed ? 72 : 256;

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
          }}
          className="lg-hide"
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          left: 0,
          top: 64,
          height: 'calc(100vh - 64px)',
          width: sidebarWidth,
          backgroundColor: '#1e3a5f',
          zIndex: 40,
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
        className={sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}
      >
        {/* Mobile Close */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg-hide"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            padding: 4,
            color: 'rgba(255,255,255,0.7)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* Nav Items */}
        <nav style={{ flex: 1, paddingTop: 16, overflowY: 'auto' }}>
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                title={sidebarCollapsed ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: sidebarCollapsed ? '12px 0' : '12px 20px',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: isActive ? '#fff' : '#94a3b8',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  borderLeft: isActive ? '3px solid #d69e2e' : '3px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
                {!sidebarCollapsed && <span style={{ marginLeft: 12 }}>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse Toggle - Desktop Only */}
        <button
          onClick={toggleSidebarCollapse}
          className="lg-show"
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
            margin: 8,
            color: '#94a3b8',
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!sidebarCollapsed && <span style={{ marginLeft: 8, fontSize: 13 }}>Collapse</span>}
        </button>

        {/* Footer */}
        <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            {sidebarCollapsed ? 'v1.0' : 'ATEMS v1.0.0'}
          </p>
        </div>
      </aside>

      <style>{`
        @media (max-width: 1023px) {
          .sidebar-closed { transform: translateX(-100%); }
          .sidebar-open { transform: translateX(0); }
          .lg-hide { display: block; }
          .lg-show { display: none !important; }
        }
        @media (min-width: 1024px) {
          .sidebar-closed, .sidebar-open { transform: translateX(0); }
          .lg-hide { display: none !important; }
          .lg-show { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
