import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, icon, actions }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      marginBottom: 24,
      padding: 20,
      backgroundColor: '#fff',
      borderRadius: 8,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    }}
    className="page-header"
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {icon && (
          <div style={{ padding: 10, backgroundColor: 'rgba(30,58,95,0.1)', borderRadius: 8 }}>{icon}</div>
        )}
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h1>
          {subtitle && <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0' }}>{subtitle}</p>}
        </div>
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  </div>
);

export default PageHeader;
