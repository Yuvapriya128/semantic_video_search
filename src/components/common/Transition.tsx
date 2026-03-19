import React, { useEffect, useState } from 'react';

interface Props {
  show?: boolean;
  type?: 'fade-in' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right';
  children: React.ReactNode;
}

const Transition: React.FC<Props> = ({ 
  show = true, 
  type = 'fade-in', 
  children 
}) => {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!shouldRender) return null;

  const animations = {
    'fade-in': 'animate-fade-in',
    'slide-up': 'animate-slide-up',
    'slide-down': 'animate-slide-down',
    'slide-left': 'animate-slide-left',
    'slide-right': 'animate-slide-right',
  };

  return (
    <div className={show ? animations[type] : 'opacity-0'}>
      {children}
    </div>
  );
};

export default Transition;