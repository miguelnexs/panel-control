import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  currentColor?: string;
  currentFontSize?: number;
  currentFontFamily?: string;
  currentTextAlign?: string;
  currentAlignItems?: string;
  currentFontWeight?: string;
  currentFontStyle?: string;
  currentTextDecoration?: string;
  currentBackgroundColor?: string;
  onChange: (field: string, value: any) => void;
  onDelete?: () => void;
}

const FONTS = ["Inter", "Roboto", "Outfit", "Playfair Display", "Arial", "Times New Roman"];

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x, y, onClose, currentColor = '#000000', currentFontSize, currentFontFamily = 'Inter',
  currentTextAlign = 'center', currentAlignItems = 'center', currentFontWeight = 'normal', currentFontStyle = 'normal', currentTextDecoration = 'none',
  currentBackgroundColor = 'transparent',
  onChange, onDelete
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [localSize, setLocalSize] = useState(currentFontSize ? String(currentFontSize) : '');

  useEffect(() => {
    setLocalSize(currentFontSize ? String(currentFontSize) : '');
  }, [currentFontSize]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('pointerdown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [onClose]);

  const handleInteraction = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
  };

  const applySize = () => {
    const parsed = parseInt(localSize);
    if (!isNaN(parsed)) {
      onChange('fontSize', parsed);
    } else {
      onChange('fontSize', undefined);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div 
      ref={menuRef}
      className="fixed z-[99999] bg-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2)] border border-gray-200 rounded-lg p-1.5 flex flex-row items-center gap-1 min-w-max animate-in fade-in zoom-in-95 duration-150"
      style={{ left: Math.min(x, window.innerWidth - 300), top: Math.min(y, window.innerHeight - 50) }}
      onPointerDown={handleInteraction}
      onMouseDown={handleInteraction}
      onClick={handleInteraction}
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      {/* Font Family */}
      <div className="relative group">
        <select 
          value={currentFontFamily}
          onChange={(e) => onChange('fontFamily', e.target.value)}
          className="appearance-none bg-transparent hover:bg-gray-100 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 outline-none cursor-pointer pr-8 w-[140px] truncate"
        >
          {FONTS.map(f => (
            <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
        </div>
      </div>

      <div className="w-px h-5 bg-gray-200 mx-1"></div>

      {/* Font Size */}
      <div className="relative flex items-center group">
        <input 
          type="text" 
          value={localSize}
          placeholder="Auto"
          onChange={(e) => setLocalSize(e.target.value)}
          onBlur={applySize}
          onKeyDown={(e) => { if (e.key === 'Enter') applySize(); }}
          className="w-12 text-center bg-transparent hover:bg-gray-100 px-1 py-1.5 rounded-md text-sm font-medium text-gray-700 outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
        />
      </div>

      <div className="w-px h-5 bg-gray-200 mx-1"></div>

      {/* Bold, Italic, Underline */}
      <div className="flex items-center gap-0.5 bg-gray-50 p-0.5 rounded-md border border-gray-100">
        <button
          onClick={() => onChange('fontWeight', currentFontWeight === 'bold' ? 'normal' : 'bold')}
          className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${currentFontWeight === 'bold' ? 'bg-gray-200 text-gray-900 font-extrabold' : 'text-gray-500 hover:text-gray-900'}`}
          title="Negrita"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onChange('fontStyle', currentFontStyle === 'italic' ? 'normal' : 'italic')}
          className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${currentFontStyle === 'italic' ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          title="Cursiva"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onChange('textDecoration', currentTextDecoration === 'underline' ? 'none' : 'underline')}
          className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${currentTextDecoration === 'underline' ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          title="Subrayado"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-px h-5 bg-gray-200 mx-1"></div>

      {/* Text Alignment */}
      <div className="flex items-center gap-0.5 bg-gray-50 p-0.5 rounded-md border border-gray-100">
        <button
          onClick={() => onChange('textAlign', 'left')}
          className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${currentTextAlign === 'left' ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          title="Alinear a la izquierda"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onChange('textAlign', 'center')}
          className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${(currentTextAlign === 'center' || !currentTextAlign) ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          title="Centrar"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onChange('textAlign', 'right')}
          className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${currentTextAlign === 'right' ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          title="Alinear a la derecha"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-px h-5 bg-gray-200 mx-1"></div>

      {/* Vertical Alignment */}
      <div className="flex items-center gap-0.5 bg-gray-50 p-0.5 rounded-md border border-gray-100">
        <button
          onClick={() => onChange('alignItems', 'flex-start')}
          className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${currentAlignItems === 'flex-start' ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          title="Alinear arriba"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="3" x2="20" y2="3"></line>
            <rect x="6" y="9" width="12" height="12" rx="2"></rect>
          </svg>
        </button>
        <button
          onClick={() => onChange('alignItems', 'center')}
          className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${(currentAlignItems === 'center' || !currentAlignItems) ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          title="Centrar verticalmente"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <rect x="6" y="5" width="12" height="4" rx="1"></rect>
            <rect x="6" y="15" width="12" height="4" rx="1"></rect>
          </svg>
        </button>
        <button
          onClick={() => onChange('alignItems', 'flex-end')}
          className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${currentAlignItems === 'flex-end' ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          title="Alinear abajo"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="20" y2="21"></line>
            <rect x="6" y="3" width="12" height="12" rx="2"></rect>
          </svg>
        </button>
      </div>

      <div className="w-px h-5 bg-gray-200 mx-1"></div>

      {/* Font Color */}
      <label className="relative flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 cursor-pointer overflow-hidden group" title="Color de letra">
        <div 
          className="w-4 h-4 rounded-sm shadow-sm ring-1 ring-black/10 transition-transform group-hover:scale-110" 
          style={{ backgroundColor: currentColor }}
        ></div>
        <input 
          type="color" 
          value={currentColor} 
          onChange={(e) => onChange('color', e.target.value)}
          className="absolute opacity-0 w-full h-full cursor-pointer"
        />
      </label>

      {/* Background Color */}
      <label className="relative flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 cursor-pointer overflow-hidden group" title="Color de fondo">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-500">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
        </div>
        <div 
          className="w-3.5 h-1.5 absolute bottom-1.5 rounded-sm shadow-sm ring-1 ring-black/10 transition-transform group-hover:scale-y-125" 
          style={{ backgroundColor: currentBackgroundColor !== 'transparent' ? currentBackgroundColor : '#ffffff' }}
        ></div>
        <input 
          type="color" 
          value={currentBackgroundColor !== 'transparent' ? currentBackgroundColor : '#ffffff'} 
          onChange={(e) => onChange('backgroundColor', e.target.value)}
          className="absolute opacity-0 w-full h-full cursor-pointer"
        />
      </label>

      {currentBackgroundColor !== 'transparent' && (
        <button
          onClick={() => onChange('backgroundColor', 'transparent')}
          className="p-1.5 rounded-md hover:bg-gray-150 text-gray-400 hover:text-red-500 transition-colors"
          title="Quitar color de fondo"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </button>
      )}

      {onDelete && (
        <>
          <div className="w-px h-5 bg-gray-200 mx-1"></div>
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="p-1.5 rounded-md hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors"
            title="Borrar elemento"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        </>
      )}
    </div>,
    document.body
  );
};
