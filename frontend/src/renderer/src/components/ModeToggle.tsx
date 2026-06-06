import React from 'react';
import { flushSync } from 'react-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';

interface ModeToggleProps {
  className?: string;
  collapsed?: boolean;
}

export function ModeToggle({ className, collapsed }: ModeToggleProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = (e: React.MouseEvent) => {
    // Resolver el tema actual en caso de que sea 'system'
    const actualTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const isDark = actualTheme === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';

    // Fallback if browser doesn't support View Transitions API
    if (!document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme);
      });
      // Forzar el cambio en el DOM inmediatamente para que lo capture
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(nextTheme);
    });

    transition.ready.then(() => {
      const animations = [
        // 1. Círculo expansivo desde el cursor (Original)
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ],
          easing: "ease-out"
        },
        // 2. Barrido hacia arriba (Cortina)
        {
          clipPath: [
            'inset(100% 0 0 0)',
            'inset(0% 0 0 0)'
          ],
          easing: "ease-in-out"
        },
        // 3. Apertura vertical desde el centro (Puertas corredizas)
        {
          clipPath: [
            'inset(0 50% 0 50%)',
            'inset(0 0% 0 0%)'
          ],
          easing: "ease-out"
        },
        // 4. Apertura horizontal desde el centro (Persiana)
        {
          clipPath: [
            'inset(50% 0 50% 0)',
            'inset(0% 0 0% 0)'
          ],
          easing: "ease-out"
        },
        // 5. Círculo expansivo desde el centro de la pantalla (Iris)
        {
          clipPath: [
            `circle(0px at 50% 50%)`,
            `circle(150% at 50% 50%)`
          ],
          easing: "ease-in-out"
        }
      ];

      // Seleccionar una animación aleatoria
      const selectedAnim = animations[Math.floor(Math.random() * animations.length)];

      document.documentElement.animate(
        {
          clipPath: selectedAnim.clipPath,
        },
        {
          duration: 500,
          easing: selectedAnim.easing,
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center ${collapsed ? 'justify-center' : ''} gap-3 p-3 rounded-xl transition-all duration-200 group w-full 
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
