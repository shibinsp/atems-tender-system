import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import Loading from '../ui/Loading';

const Layout: React.FC = () => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const { sidebarCollapsed } = useUIStore();

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <Loading fullScreen text="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const marginLeft = sidebarCollapsed ? 72 : 256;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      <Header />
      <Sidebar />
      <main
        className="main-content"
        style={{
          paddingTop: 64,
          minHeight: '100vh',
          marginLeft: 0,
          transition: 'margin-left 0.3s ease',
        }}
      >
        <div style={{ padding: 24 }}>
          <Outlet />
        </div>
      </main>
      <style>{`
        @media (min-width: 1024px) {
          .main-content { margin-left: ${marginLeft}px !important; }
        }
      `}</style>
    </div>
  );
};

export default Layout;
