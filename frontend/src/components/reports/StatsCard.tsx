import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { colors, shadows } from '../../styles/constants';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

const colorStyles: Record<string, { backgroundColor: string; color: string }> = {
  primary: { backgroundColor: 'rgba(30, 58, 95, 0.1)', color: colors.primary },
  success: { backgroundColor: '#dcfce7', color: '#16a34a' },
  warning: { backgroundColor: '#fef3c7', color: '#d97706' },
  danger: { backgroundColor: '#fee2e2', color: '#dc2626' },
  info: { backgroundColor: '#dbeafe', color: '#2563eb' },
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'primary'
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp style={{ width: '16px', height: '16px' }} />;
    if (trend.value < 0) return <TrendingDown style={{ width: '16px', height: '16px' }} />;
    return <Minus style={{ width: '16px', height: '16px' }} />;
  };

  const getTrendColor = () => {
    if (!trend) return '#6b7280';
    if (trend.value > 0) return '#16a34a';
    if (trend.value < 0) return '#dc2626';
    return '#6b7280';
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: shadows.govt,
        padding: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280', marginBottom: '4px' }}>
            {title}
          </p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px', marginBottom: 0 }}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '8px',
                fontSize: '14px',
                color: getTrendColor(),
              }}
            >
              {getTrendIcon()}
              <span style={{ fontWeight: 500 }}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              {trend.label && (
                <span style={{ color: '#6b7280' }}>{trend.label}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              ...colorStyles[color],
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
