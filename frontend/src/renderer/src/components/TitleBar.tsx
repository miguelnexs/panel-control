import React from 'react';
import logo from '../assets/logo.png';

const TitleBar: React.FC = () => {
  return (
    <div 
      className="h-14 bg-gray-950 flex items-center px-4 select-none" 
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center gap-3">
        <img src={logo} alt="Logo" className="w-5 h-5" />
        <span className="text-gray-300 text-sm font-semibold tracking-wide">Localix Dashboard</span>
      </div>
    </div>
  );
};

export default TitleBar;
