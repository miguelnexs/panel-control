import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';

interface ModeToggleProps {
  className?: string;
  collapsed?: boolean;
}

export function ModeToggle({ className, collapsed }: ModeToggleProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group w-full 
        ${theme === 'dark' 
          ? 'text-gray-400 hover:bg-gray-800 hover:text-white' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'} 
        ${className || ''}`}
      title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 transition-transform duration-300 rotate-0" />
        ) : (
          <Moon className="w-5 h-5 transition-transform duration-300 rotate-0" />
        )}
      </div>
      
      {!collapsed && (
        <span className="font-medium text-sm whitespace-nowrap">
          {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
        </span>
      )}
    </button>
  );
}
