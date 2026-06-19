import { useState, useRef, useEffect, MouseEvent as ReactMouseEvent } from 'react';

export function useDraggable(sectionId: string, fieldId: string, initialOffset: any = { x: 0, y: 0 }) {
  const safeOffset = initialOffset || { x: 0, y: 0, w: undefined, h: undefined };
  const [offsetState, setOffsetState] = useState({ x: safeOffset.x || 0, y: safeOffset.y || 0 });
  const [sizeState, setSizeState] = useState({ w: safeOffset.w, h: safeOffset.h });

  const offset = useRef(offsetState);
  const size = useRef(sizeState);

  const setOffset = (newOffset: any) => {
    offset.current = newOffset;
    setOffsetState(newOffset);
  };

  const setSize = (newSize: any) => {
    size.current = newSize;
    setSizeState(newSize);
  };

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });

  const isResizing = useRef<string | null>(null);
  const resizeStart = useRef({ x: 0, y: 0 });
  const sizeStart = useRef({ w: 0, h: 0 });

  // Update offset if parent re-renders with new data (to sync with backend)
  useEffect(() => {
    setOffset({ x: safeOffset.x || 0, y: safeOffset.y || 0 });
    setSize({ w: safeOffset.w, h: safeOffset.h });
  }, [safeOffset.x, safeOffset.y, safeOffset.w, safeOffset.h]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag on left click and not on input/button elements unless drag handle
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'input' || target.tagName.toLowerCase() === 'button') {
      return;
    }
    
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    offsetStart.current = { ...offset.current };
    
    // Add document listeners
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    
    // Disable text selection during drag
    document.body.style.userSelect = 'none';
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging.current) return;
    
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    
    // Apply limits: let's constrain movement to a reasonable box
    // e.g. [-300, 300] or simply no limits if we trust the user. The prompt requested limits.
    const maxX = 400;
    const maxY = 400;
    
    let newX = offsetStart.current.x + dx;
    let newY = offsetStart.current.y + dy;
    
    newX = Math.max(-maxX, Math.min(maxX, newX));
    newY = Math.max(-maxY, Math.min(maxY, newY));
    
    setOffset({ x: newX, y: newY });
  };

  const handleResizeDown = (direction: string) => (e: React.PointerEvent) => {
    e.stopPropagation();
    isResizing.current = direction;
    resizeStart.current = { x: e.clientX, y: e.clientY };
    
    // We need the current computed size of the element if size state is undefined
    const target = e.currentTarget as HTMLElement;
    const parent = target.closest('.group\\/drag') as HTMLElement;
    
    let currentW = size.current.w;
    let currentH = size.current.h;
    
    if (parent) {
      if (currentW === undefined) currentW = parent.offsetWidth;
      if (currentH === undefined) currentH = parent.offsetHeight;
    }

    sizeStart.current = { w: currentW || 0, h: currentH || 0 };
    offsetStart.current = { ...offset.current };

    document.addEventListener('pointermove', handleResizeMove);
    document.addEventListener('pointerup', handleResizeUp);
    document.body.style.userSelect = 'none';
  };

  const handleResizeMove = (e: PointerEvent) => {
    if (!isResizing.current) return;

    const dx = e.clientX - resizeStart.current.x;
    const dy = e.clientY - resizeStart.current.y;
    const direction = isResizing.current;

    let newW = sizeStart.current.w;
    let newH = sizeStart.current.h;
    let newX = offsetStart.current.x;
    let newY = offsetStart.current.y;

    if (direction.includes('e')) newW += dx;
    if (direction.includes('s')) newH += dy;
    if (direction.includes('w')) {
      newW -= dx;
      newX += dx;
    }
    if (direction.includes('n')) {
      newH -= dy;
      newY += dy;
    }

    // Apply minimum limits
    newW = Math.max(20, newW);
    newH = Math.max(20, newH);

    setSize({ w: newW, h: newH });
    if (direction.includes('w') || direction.includes('n')) {
      setOffset({ x: newX, y: newY });
    }
  };

  const handleResizeUp = () => {
    isResizing.current = null;
    document.removeEventListener('pointermove', handleResizeMove);
    document.removeEventListener('pointerup', handleResizeUp);
    document.body.style.userSelect = '';
    
    // We need a small timeout to allow state to settle
    setTimeout(() => {
      triggerSaveRef();
    }, 50);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
    document.body.style.userSelect = '';
    
    // We need a small timeout to allow state to settle
    setTimeout(() => {
      triggerSaveRef();
    }, 50);
  };

  // Redefine triggerSave to use refs directly
  const triggerSaveRef = () => {
    window.parent.postMessage({
      type: 'CANVAS_UPDATE_ELEMENT_POSITION',
      section: sectionId,
      field: fieldId,
      position: { 
        x: offset.current.x, 
        y: offset.current.y,
        w: size.current.w,
        h: size.current.h
      }
    }, '*');
  };

  return {
    style: {
      transform: `translate(${offsetState.x}px, ${offsetState.y}px)`,
      width: sizeState.w !== undefined ? `${sizeState.w}px` : undefined,
      height: sizeState.h !== undefined ? `${sizeState.h}px` : undefined,
    },
    onPointerDown: handlePointerDown,
    onResizeDown: handleResizeDown,
    size: sizeState,
    isDragging: isDragging.current,
    isResizing: !!isResizing.current
  };
}
