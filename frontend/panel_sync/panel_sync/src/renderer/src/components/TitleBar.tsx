import React from 'react';
import logo from '../assets/logo.png';

const TitleBar: React.FC = () => {
  return (
    <div 
      className="h-8 bg-gray-950 flex items-center px-3 select-none" 
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center gap-2">
        <img src={logo} alt="Logo" className="w-4 h-4" />
        <span className="text-gray-400 text-xs font-medium">Localix Dashboard</span>
      </div>
    </div>
  );
};

export default TitleBar;
