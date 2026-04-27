import React from 'react';
import { Minus, Square, X, Copy, Layout } from 'lucide-react';

const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = React.useState(false);

  // Detect window state
  React.useEffect(() => {
    if ((window as any).electron) {
      (window as any).electron.ipcRenderer.on('window-maximized', () => setIsMaximized(true));
      (window as any).electron.ipcRenderer.on('window-unmaximized', () => setIsMaximized(false));
    }
  }, []);

  const handleAction = (action: string) => {
    if ((window as any).electron) {
      (window as any).electron.ipcRenderer.send(`window:${action}`);
    }
  };

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-10 flex items-center justify-between select-none z-[2000] bg-[#0B0D14]/80 backdrop-blur-xl border-b border-white/5" 
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left side: App Info */}
      <div className="flex items-center gap-3 px-4 h-full">
        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
          <Layout size={12} className="text-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-widest text-white/90 uppercase">Asenting</span>
          <div className="w-1 h-1 rounded-full bg-white/20" />
          <span className="text-[11px] font-medium text-white/50">Dashboard Principal</span>
        </div>
      </div>

      {/* Right side: Window Controls */}
      <div 
        className="flex items-center h-full"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Minimize */}
        <button 
          onClick={() => handleAction('minimize')}
          className="w-12 h-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors group"
        >
          <Minus size={16} className="transition-transform group-hover:scale-x-125" />
        </button>

        {/* Maximize/Restore */}
        <button 
          onClick={() => handleAction('maximize')}
          className="w-12 h-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors group"
        >
          {isMaximized ? (
            <Copy size={14} className="transition-transform group-hover:rotate-12" />
          ) : (
            <Square size={14} className="transition-transform group-hover:scale-110" />
          )}
        </button>

        {/* Close */}
        <button 
          onClick={() => handleAction('close')}
          className="w-12 h-full flex items-center justify-center text-white/40 hover:text-white hover:bg-red-500 transition-colors group"
        >
          <X size={18} className="transition-transform group-hover:rotate-90" />
        </button>
      </div>

      {/* Decorative Gradient Line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-30" />
    </div>
  );
};

export default TitleBar;
