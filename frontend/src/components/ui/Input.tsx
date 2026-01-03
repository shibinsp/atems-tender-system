import React, { useState, useId } from 'react';
import { colors } from '../../styles/constants';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, id, required, disabled, style, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const [isFocused, setIsFocused] = useState(false);

    const getInputStyles = (): React.CSSProperties => {
      const baseStyles: React.CSSProperties = {
        display: 'block',
        width: '100%',
        borderRadius: '6px',
        border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        fontSize: '14px',
        paddingTop: '8px',
        paddingBottom: '8px',
        paddingRight: '12px',
        paddingLeft: icon ? '40px' : '12px',
        backgroundColor: disabled ? '#f3f4f6' : 'white',
        cursor: disabled ? 'not-allowed' : 'text',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      };

      if (isFocused) {
        if (error) {
          return {
            ...baseStyles,
            outline: 'none',
            boxShadow: '0 0 0 2px #ef4444',
            borderColor: '#ef4444',
          };
        }
        return {
          ...baseStyles,
          outline: 'none',
          boxShadow: `0 0 0 2px ${colors.primary}`,
          borderColor: colors.primary,
        };
      }

      return baseStyles;
    };

    return (
      <div style={{ width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '4px',
            }}
          >
            {label}
            {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
          </label>
        )}
        <div style={{ position: 'relative' }}>
          {icon && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                paddingLeft: '12px',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
                color: '#9ca3af',
              }}
            >
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            style={{ ...getInputStyles(), ...style }}
            required={required}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
        </div>
        {error && (
          <p style={{ marginTop: '4px', fontSize: '14px', color: '#ef4444' }}>{error}</p>
        )}
        {helperText && !error && (
          <p style={{ marginTop: '4px', fontSize: '14px', color: '#6b7280' }}>{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
