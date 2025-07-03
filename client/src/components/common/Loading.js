import React from 'react';

const Loading = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="loading-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      minHeight: '200px'
    }}>
      <div 
        className={`loading-spinner ${sizeClasses[size]}`}
        style={{
          width: size === 'small' ? '16px' : size === 'large' ? '48px' : '32px',
          height: size === 'small' ? '16px' : size === 'large' ? '48px' : '32px',
          border: '3px solid rgba(102, 126, 234, 0.1)',
          borderTop: '3px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}
      />
      <p style={{
        color: '#667eea',
        fontSize: size === 'small' ? '14px' : size === 'large' ? '18px' : '16px',
        fontWeight: '500',
        textAlign: 'center'
      }}>
        {text}
      </p>
      
      <style jsx="true">{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loading; 