import React, { useEffect, useState } from 'react';

const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('button') || 
        target.closest('a') ||
        target.classList.contains('clickable') ||
        window.getComputedStyle(target).cursor === 'pointer';
      
      setIsHovering(!!isClickable);
    };

    const onMouseDown = () => setIsMouseDown(true);
    const onMouseUp = () => setIsMouseDown(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        * {
          cursor: none !important;
        }
        
        @media (max-width: 1024px) {
          * {
            cursor: auto !important;
          }
          .custom-cursor-container {
            display: none !important;
          }
        }
      `}</style>
      
      <div 
        className="custom-cursor-container pointer-events-none fixed inset-0 z-[999999]"
      >
        {/* Custom Arrow */}
        <div 
          className="fixed transition-transform duration-75 ease-out"
          style={{ 
            left: position.x, 
            top: position.y,
            transform: `scale(${isMouseDown ? 0.9 : isHovering ? 1.1 : 1})`,
          }}
        >
          <svg 
            width="28" 
            height="28" 
            viewBox="0 0 32 32" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ 
              filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.5))',
              transform: 'rotate(-10deg) translate(-4px, -4px)'
            }}
          >
            {/* Main Body */}
            <path 
              d="M4 4L28 16L16 18L14 30L4 4Z" 
              fill="#0F172A" 
              stroke="#3B82F6" 
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Inner Accent */}
            <path 
              d="M7 8L22 15.5L14.5 17L13 24.5L7 8Z" 
              fill="#3B82F6" 
              opacity="0.2"
            />
          </svg>
        </div>
      </div>
    </>
  );
};

export default CustomCursor;
