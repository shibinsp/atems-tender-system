import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_STYLES: Record<string, { backgroundColor: string; color: string }> = {
  Draft: { backgroundColor: '#edf2f7', color: '#4a5568' },
  Published: { backgroundColor: '#c6f6d5', color: '#22543d' },
  Active: { backgroundColor: '#c6f6d5', color: '#22543d' },
  Open: { backgroundColor: '#bee3f8', color: '#2a4365' },
  'Under Evaluation': { backgroundColor: '#fefcbf', color: '#744210' },
  Evaluation: { backgroundColor: '#fefcbf', color: '#744210' },
  Closed: { backgroundColor: '#fed7d7', color: '#742a2a' },
  Awarded: { backgroundColor: '#c6f6d5', color: '#22543d' },
  Cancelled: { backgroundColor: '#fed7d7', color: '#742a2a' },
  Pending: { backgroundColor: '#fefcbf', color: '#744210' },
  Submitted: { backgroundColor: '#bee3f8', color: '#2a4365' },
  Approved: { backgroundColor: '#c6f6d5', color: '#22543d' },
  Rejected: { backgroundColor: '#fed7d7', color: '#742a2a' },
  Winner: { backgroundColor: '#c6f6d5', color: '#22543d' },
  'Under Review': { backgroundColor: '#fefcbf', color: '#744210' },
  Shortlisted: { backgroundColor: '#e9d8fd', color: '#553c9a' },
  Disqualified: { backgroundColor: '#fed7d7', color: '#742a2a' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizes = {
    sm: { padding: '2px 8px', fontSize: '11px' },
    md: { padding: '4px 10px', fontSize: '12px' },
    lg: { padding: '6px 12px', fontSize: '14px' },
  };

  const statusStyle = STATUS_STYLES[status] || { backgroundColor: '#edf2f7', color: '#4a5568' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontWeight: 500,
        borderRadius: '9999px',
        ...sizes[size],
        ...statusStyle,
      }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
