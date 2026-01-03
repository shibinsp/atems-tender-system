import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Toast from '../ui/Toast';
import { useAuthStore } from '../../store/authStore';
import Loading from '../ui/Loading';

const Layout: React.FC = () => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <Loading fullScreen text="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7fafc' }}>
      <Header />
      <Sidebar />
      <main
        style={{
          paddingTop: '64px',
          minHeight: '100vh',
          marginLeft: '0',
        }}
        className="lg-main-content"
      >
        <div style={{ padding: '16px' }} className="lg-main-padding">
          <Outlet />
        </div>
      </main>
      <Toast />
      <style>{`
        @media (min-width: 1024px) {
          .lg-main-content {
            margin-left: 256px !important;
          }
          .lg-main-padding {
            padding: 24px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
