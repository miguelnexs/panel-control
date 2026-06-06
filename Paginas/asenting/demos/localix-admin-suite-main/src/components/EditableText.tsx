import React, { useState, useEffect } from 'react';
import { useContent } from '@/context/ContentContext';
import { cn } from '@/lib/utils';

interface EditableTextProps {
  id: string;
  defaultText: string;
  className?: string;
  as?: any;
}

const EditableText: React.FC<EditableTextProps> = ({ id, defaultText, className, as: Component = 'span' }) => {
  const { content, editMode, updateContent } = useContent();
  const text = content[id] || defaultText;
  
  // Local state to handle typing without re-rendering from context immediately
  // preventing cursor jumps.
  const [localValue, setLocalValue] = useState(text);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setLocalValue(text);
  }, [text]);

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    setIsFocused(false);
    const newValue = e.currentTarget.innerText;
    if (newValue !== text) {
      updateContent(id, newValue);
    }
  };

  const isEditable = isFocused || isHovered || editMode;

  if (isEditable) {
    return (
      <Component 
        className={cn(
          className, 
          "relative border-2 border-transparent hover:border-blue-500 rounded cursor-text transition-all outline-none",
          isFocused ? "border-blue-500" : ""
        )}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        onFocus={() => setIsFocused(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => e.preventDefault()}
      >
        {text}
      </Component>
    );
  }

  return (
    <Component 
      className={className}
      onMouseEnter={() => setIsHovered(true)}
    >
      {text}
    </Component>
  );
};

export default EditableText;
