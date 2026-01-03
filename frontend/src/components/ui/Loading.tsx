import React from 'react';
import { Loader2 } from 'lucide-react';
import { colors } from '../../styles/constants';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  fullScreen = false,
}) => {
  const sizes = {
    sm: { width: '16px', height: '16px' },
    md: { width: '32px', height: '32px' },
    lg: { width: '48px', height: '48px' },
  };

  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Loader2
        style={{
          color: colors.primary,
          animation: 'spin 1s linear infinite',
          ...sizes[size],
        }}
      />
      {text && (
        <p style={{ marginTop: '8px', fontSize: '14px', color: '#4a5568' }}>{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;
