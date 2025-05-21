
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
  animated?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'full', animated = true }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center bg-primary p-1 rounded-md">
        <div className={`flex items-end space-x-1 h-5 ${animated ? 'audio-visualizer' : ''}`}>
          <div className={`h-3 w-1 bg-primary-foreground rounded-full ${animated ? 'audio-bar' : ''}`}></div>
          <div className={`h-4 w-1 bg-primary-foreground rounded-full ${animated ? 'audio-bar' : ''}`}></div>
          <div className={`h-2 w-1 bg-primary-foreground rounded-full ${animated ? 'audio-bar' : ''}`}></div>
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
