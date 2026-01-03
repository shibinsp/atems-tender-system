import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

const Toast: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle style={{ width: '20px', height: '20px', color: '#38a169' }} />,
    error: <AlertCircle style={{ width: '20px', height: '20px', color: '#e53e3e' }} />,
    warning: <AlertTriangle style={{ width: '20px', height: '20px', color: '#d69e2e' }} />,
    info: <Info style={{ width: '20px', height: '20px', color: '#3182ce' }} />,
  };

  const bgColors = {
    success: { backgroundColor: '#f0fff4', borderColor: '#9ae6b4' },
    error: { backgroundColor: '#fff5f5', borderColor: '#feb2b2' },
    warning: { backgroundColor: '#fffff0', borderColor: '#faf089' },
    info: { backgroundColor: '#ebf8ff', borderColor: '#90cdf4' },
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            padding: '16px',
            borderRadius: '8px',
            border: `1px solid ${bgColors[toast.type].borderColor}`,
            backgroundColor: bgColors[toast.type].backgroundColor,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            maxWidth: '384px',
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <div style={{ flexShrink: 0 }}>{icons[toast.type]}</div>
          <div style={{ marginLeft: '12px', flex: 1 }}>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#1a202c', margin: 0 }}>
              {toast.title}
            </p>
            {toast.message && (
              <p style={{ marginTop: '4px', fontSize: '14px', color: '#4a5568', marginBottom: 0 }}>
                {toast.message}
              </p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              marginLeft: '16px',
              flexShrink: 0,
              color: '#a0aec0',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;
