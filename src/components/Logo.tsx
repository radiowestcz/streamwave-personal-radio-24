
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
}

const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'full' }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center bg-primary p-1 rounded-md">
        <div className="flex items-end space-x-1 h-5">
          <div className="audio-bar h-3"></div>
          <div className="audio-bar h-4"></div>
          <div className="audio-bar h-2"></div>
        </div>
      </div>
      
      {variant === 'full' && (
        <div className={`font-bold ${sizeClasses[size]}`}>
          <span className="text-primary">Radio</span>
          <span>Admin</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
