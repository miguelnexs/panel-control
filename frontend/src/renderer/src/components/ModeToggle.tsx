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
      document.documentElement.setAttribute("data-theme", nextTheme);
    });

    transition.ready.then(() => {
      const animations = [
        // 1. Gota de agua asimétrica (Elipse con rebote suave) desde el cursor
        {
          clipPath: [
            `ellipse(0px 0px at ${x}px ${y}px)`,
            `ellipse(${endRadius}px ${endRadius * 1.2}px at ${x}px ${y}px)`
          ],
          easing: "cubic-bezier(0.34, 1.2, 0.64, 1)",
          duration: 900
        },
        // 2. Cortina Teatral Curva (Elipse cayendo desde arriba)
        {
          clipPath: [
            `ellipse(150% 0% at 50% 0%)`,
            `ellipse(150% 150% at 50% 0%)`
          ],
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
          duration: 950
        },
        // 3. Cortina Curva Inversa (Elipse subiendo desde abajo)
        {
          clipPath: [
            `ellipse(150% 0% at 50% 100%)`,
            `ellipse(150% 150% at 50% 100%)`
          ],
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
          duration: 950
        },
        // 4. Inundación diagonal suave (Triángulo que crece como una ola)
        {
          clipPath: [
            'polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)',
            'polygon(-50% 150%, 150% -50%, 150% 150%, -50% 150%)'
          ],
          easing: "cubic-bezier(0.76, 0, 0.24, 1)",
          duration: 900
        },
        // 5. Apertura de Abanico / Ola desde esquina inferior
        {
          clipPath: [
            `circle(0% at 100% 100%)`,
            `circle(150% at 100% 100%)`
          ],
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          duration: 900
        },
        // 6. Apertura de Abanico inversa desde esquina superior
        {
          clipPath: [
            `circle(0% at 0% 0%)`,
            `circle(150% at 0% 0%)`
          ],
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          duration: 900
        },
        // 7. Iris Ovoide (Expansión curva desde el centro con inicio rápido)
        {
          clipPath: [
            `ellipse(0% 0% at 50% 50%)`,
            `ellipse(150% 150% at 50% 50%)`
          ],
          easing: "cubic-bezier(0.19, 1, 0.22, 1)",
          duration: 1000
        },
        // 8. Fuego consumiendo la pantalla (Llamas dentadas ascendentes)
        {
          clipPath: [
            'polygon(0% 100%, 10% 100%, 20% 100%, 30% 100%, 40% 100%, 50% 100%, 60% 100%, 70% 100%, 80% 100%, 90% 100%, 100% 100%, 100% 100%, 0% 100%)',
            'polygon(0% -50%, 10% -20%, 20% -70%, 30% -10%, 40% -80%, 50% -20%, 60% -90%, 70% -10%, 80% -60%, 90% -30%, 100% -50%, 100% 100%, 0% 100%)'
          ],
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
          duration: 1100
        }
      ];

      // Seleccionar una animación aleatoria
      const selectedAnim = animations[Math.floor(Math.random() * animations.length)];

      document.documentElement.animate(
        {
          clipPath: selectedAnim.clipPath,
        },
        {
          duration: selectedAnim.duration,
          easing: selectedAnim.easing,
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className={`group relative w-full flex items-center px-2 py-1.5 rounded-lg transition-all duration-300 font-medium overflow-hidden
        ${theme === 'dark' 
          ? 'text-gray-400 hover:bg-white/5 hover:text-white' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'} 
        ${className?.replace(/group|relative|w-full|flex|items-center|px-2|py-1\.5|rounded-lg|hover:bg-gray-100|dark:hover:bg-white\/5|transition-all|duration-300|text-gray-700|dark:text-gray-400|hover:text-gray-900|dark:hover:text-white|font-medium|overflow-hidden/g, '') || ''}`}
      title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300">
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 transition-transform duration-300 rotate-0" />
        ) : (
          <Moon className="w-4 h-4 transition-transform duration-300 rotate-0" />
        )}
      </div>
      
      <span className={`inline-block overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap text-[13px] ${collapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100 ml-3'}`}>
        {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
      </span>
      <span className={collapsed ? 'absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-1 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs shadow-xl border border-gray-200 dark:border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none z-50' : 'hidden'}>
        {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
      </span>
    </button>
  );
}
