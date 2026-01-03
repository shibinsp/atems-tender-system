import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { colors } from '../../styles/constants';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, iconPosition = 'left', fullWidth, children, disabled, style, ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Check if w-full class is passed
    const isFullWidth = fullWidth || className?.includes('w-full');

    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: { padding: '6px 12px', fontSize: '14px' },
      md: { padding: '8px 16px', fontSize: '14px' },
      lg: { padding: '12px 24px', fontSize: '16px' },
    };

    // Get inline styles based on variant
    const getVariantStyles = (): React.CSSProperties => {
      switch (variant) {
        case 'primary':
          return {
            backgroundColor: isHovered ? colors.primaryLight : colors.primary,
            color: 'white',
            ...(isFocused && { boxShadow: `0 0 0 2px white, 0 0 0 4px ${colors.primary}` }),
          };
        case 'secondary':
          return {
            backgroundColor: isHovered ? '#b91c1c' : colors.secondary,
            color: 'white',
            ...(isFocused && { boxShadow: `0 0 0 2px white, 0 0 0 4px ${colors.secondary}` }),
          };
        case 'danger':
          return {
            backgroundColor: isHovered ? '#b91c1c' : colors.error,
            color: 'white',
            ...(isFocused && { boxShadow: `0 0 0 2px white, 0 0 0 4px ${colors.error}` }),
          };
        case 'outline':
          return {
            backgroundColor: isHovered ? '#f9fafb' : 'white',
            color: '#374151',
            border: '1px solid #d1d5db',
            ...(isFocused && { boxShadow: `0 0 0 2px white, 0 0 0 4px ${colors.primary}` }),
          };
        case 'ghost':
          return {
            backgroundColor: isHovered ? '#f3f4f6' : 'transparent',
            color: '#374151',
            ...(isFocused && { boxShadow: `0 0 0 2px white, 0 0 0 4px #6b7280` }),
          };
        default:
          return {};
      }
    };

    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 500,
      borderRadius: '6px',
      transition: 'background-color 0.15s, color 0.15s, box-shadow 0.15s',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.5 : 1,
      outline: 'none',
      border: 'none',
      width: isFullWidth ? '100%' : 'auto',
      ...sizeStyles[size],
    };

    return (
      <button
        ref={ref}
        style={{
          ...baseStyles,
          ...getVariantStyles(),
          ...style,
        }}
        disabled={disabled || loading}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      >
        {loading && (
          <Loader2
            style={{
              width: '16px',
              height: '16px',
              marginRight: '8px',
              animation: 'spin 1s linear infinite',
            }}
          />
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>{icon}</span>
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <span style={{ marginLeft: '8px', display: 'flex', alignItems: 'center' }}>{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
