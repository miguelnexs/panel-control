import React, { useState, useEffect } from 'react';
import { useContent } from '@/context/ContentContext';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
} from "@/components/ui/context-menu";
import { Check, Palette, Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic } from 'lucide-react';

interface EditableTextProps {
  id: string;
  defaultText: string;
  className?: string;
  as?: any;
}

const EditableText: React.FC<EditableTextProps> = ({ id, defaultText, className, as: Component = 'span' }) => {
  const { content, editMode, updateContent } = useContent();
  const text = content[id] || defaultText;
  
  // Style states from content
  const color = content[`${id}_style_color`];
  const fontSize = content[`${id}_style_fontSize`];
  const textAlign = content[`${id}_style_textAlign`];
  const fontWeight = content[`${id}_style_fontWeight`];
  const fontStyle = content[`${id}_style_fontStyle`];
  const fontKey = content[`${id}_style_fontKey`];

  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Allow editing if editMode is true OR if the element is hovered/focused
  const isEditable = isFocused || isHovered || editMode;

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    setIsFocused(false);
    const newValue = e.currentTarget.innerText;
    if (newValue !== text) {
      updateContent(id, newValue);
    }
  };

  const handleStyleChange = (property: string, value: string) => {
    updateContent(`${id}_style_${property}`, value);
  };

  const currentStyle = {
    color,
    fontSize,
    textAlign: textAlign as any,
    fontWeight,
    fontStyle,
  };

  const colors = [
    { name: 'Negro', value: '#000000' },
    { name: 'Blanco', value: '#FFFFFF' },
    { name: 'Acento', value: 'var(--accent)' },
    { name: 'Gris', value: '#6b7280' },
    { name: 'Rojo', value: '#ef4444' },
    { name: 'Azul', value: '#3b82f6' },
  ];

  const sizes = [
    { name: 'Pequeño', value: '0.875rem' },
    { name: 'Normal', value: '1rem' },
    { name: 'Grande', value: '1.25rem' },
    { name: 'Extra Grande', value: '1.5rem' },
    { name: 'Título 1', value: '2.25rem' },
    { name: 'Título 2', value: '3rem' },
    { name: 'Gigante', value: '4.5rem' },
  ];

  const fonts = [
    { key: 'bebas', name: 'Original (Bebas Neue)', value: 'var(--font-display)' },
    { key: 'inter', name: 'Texto (Inter)', value: 'var(--font-body)' },
    { key: 'arial', name: 'Sans Serif (Arial)', value: 'Arial, sans-serif' },
    { key: 'serif', name: 'Serif (Times)', value: 'Times New Roman, serif' },
    { key: 'mono', name: 'Monospace (Courier)', value: 'Courier New, monospace' },
    { key: 'cursive', name: 'Cursive', value: 'cursive' },
  ];

  const selectedFont = fonts.find(f => f.key === fontKey);
  if (selectedFont) {
    currentStyle.fontFamily = selectedFont.value;
  }

  const renderContent = () => {
    if (isEditable) {
      return (
        <Component 
          className={cn(
            className, 
            "relative border-2 border-transparent hover:border-blue-500 rounded cursor-text transition-all outline-none",
            isFocused ? "border-blue-500" : ""
          )}
          style={currentStyle}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleBlur}
          onFocus={() => setIsFocused(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={(e: React.MouseEvent) => e.preventDefault()}
        >
          {text}
        </Component>
      );
    }

    return (
      <Component 
        className={className}
        style={currentStyle}
        onMouseEnter={() => setIsHovered(true)}
      >
        {text}
      </Component>
    );
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {renderContent()}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuLabel>Personalizar Texto</ContextMenuLabel>
        <ContextMenuSeparator />
        
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Palette className="w-4 h-4 mr-2" />
            Color
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuRadioGroup value={color} onValueChange={(v) => handleStyleChange('color', v)}>
              {colors.map(c => (
                <ContextMenuRadioItem key={c.value} value={c.value}>
                  <div className="w-3 h-3 rounded-full mr-2 border border-gray-200" style={{ background: c.value }} />
                  {c.name}
                </ContextMenuRadioItem>
              ))}
            </ContextMenuRadioGroup>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Type className="w-4 h-4 mr-2" />
            Tamaño
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuRadioGroup value={fontSize} onValueChange={(v) => handleStyleChange('fontSize', v)}>
              {sizes.map(s => (
                <ContextMenuRadioItem key={s.value} value={s.value}>
                  {s.name}
                </ContextMenuRadioItem>
              ))}
            </ContextMenuRadioGroup>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Type className="w-4 h-4 mr-2" />
            Fuente
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
             <ContextMenuRadioGroup value={fontKey} onValueChange={(v) => handleStyleChange('fontKey', v)}>
              {fonts.map(f => (
                <ContextMenuRadioItem key={f.key} value={f.key}>
                  <span style={{ fontFamily: f.value }} className="mr-2">Aa</span>
                  {f.name}
                </ContextMenuRadioItem>
              ))}
            </ContextMenuRadioGroup>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={() => handleStyleChange('textAlign', 'left')}>
          <AlignLeft className="w-4 h-4 mr-2" />
          Alinear Izquierda
          {textAlign === 'left' && <Check className="w-4 h-4 ml-auto" />}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleStyleChange('textAlign', 'center')}>
          <AlignCenter className="w-4 h-4 mr-2" />
          Centrar
          {textAlign === 'center' && <Check className="w-4 h-4 ml-auto" />}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleStyleChange('textAlign', 'right')}>
          <AlignRight className="w-4 h-4 mr-2" />
          Alinear Derecha
          {textAlign === 'right' && <Check className="w-4 h-4 ml-auto" />}
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={() => handleStyleChange('fontWeight', fontWeight === 'bold' ? 'normal' : 'bold')}>
          <Bold className="w-4 h-4 mr-2" />
          Negrita
          {fontWeight === 'bold' && <Check className="w-4 h-4 ml-auto" />}
        </ContextMenuItem>
        
        <ContextMenuItem onClick={() => handleStyleChange('fontStyle', fontStyle === 'italic' ? 'normal' : 'italic')}>
          <Italic className="w-4 h-4 mr-2" />
          Cursiva
          {fontStyle === 'italic' && <Check className="w-4 h-4 ml-auto" />}
        </ContextMenuItem>

      </ContextMenuContent>
    </ContextMenu>
  );
};

export default EditableText;
