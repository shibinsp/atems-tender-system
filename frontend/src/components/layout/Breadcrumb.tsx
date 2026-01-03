import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { colors } from '../../styles/constants';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

const pathLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  tenders: 'Tenders',
  bids: 'My Bids',
  evaluation: 'Evaluation',
  rfp: 'RFP Generator',
  reports: 'Reports',
  admin: 'Admin',
  users: 'Users',
  departments: 'Departments',
  settings: 'Settings',
  create: 'Create',
  edit: 'Edit',
  details: 'Details'
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const location = useLocation();
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  // Auto-generate breadcrumbs from path if items not provided
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    return pathParts.map((part, index) => {
      const path = '/' + pathParts.slice(0, index + 1).join('/');
      const label = pathLabels[part] || part.charAt(0).toUpperCase() + part.slice(1);
      return { label, path: index < pathParts.length - 1 ? path : undefined };
    });
  })();

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '14px',
        color: '#4b5563',
        marginBottom: '16px',
      }}
    >
      <Link
        to="/dashboard"
        style={{
          display: 'flex',
          alignItems: 'center',
          color: hoveredIndex === -1 ? colors.primary : '#4b5563',
          textDecoration: 'none',
        }}
        onMouseEnter={() => setHoveredIndex(-1)}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <Home style={{ width: '16px', height: '16px' }} />
      </Link>

      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
          {item.path ? (
            <Link
              to={item.path}
              style={{
                color: hoveredIndex === index ? colors.primary : '#4b5563',
                textDecoration: 'none',
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {item.label}
            </Link>
          ) : (
            <span style={{ color: '#111827', fontWeight: 500 }}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
