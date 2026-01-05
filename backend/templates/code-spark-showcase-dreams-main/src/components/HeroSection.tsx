
import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Code, Rocket } from 'lucide-react';

const HeroSection: React.FC = () => {
  const codeTextRef = useRef<HTMLDivElement>(null);
  const [codeContent, setCodeContent] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  
  const codeLines = [
    "// App Web Soluciones - Su socio tecnológico",
    "class EquipoDesarrollo {",
    "  constructor() {",
    "    this.especialidades = [",
    "      'Desarrollo Web',",
    "      'Tiendas Online',",
    "      'Posicionamiento SEO',",
    "      'Soluciones Personalizadas',",
    "      'Mantenimiento Tecnológico'",
    "    ];",
    "    this.compromiso = 'Excelencia';",
    "    this.experiencia = '+5 años';",
    "  }",
    "",
    "  desarrollarSolucion(necesidadEmpresa) {",
    "    const analisis = this.analizarRequerimientos(necesidadEmpresa);",
    "    const solucion = this.diseñarEstrategia(analisis);",
    "    return this.implementarYOptimizar(solucion);",
    "  }",
    "",
    "  garantizarResultados() {",
    "    return {",
    "      calidad: 'Premium',",
    "      rendimiento: 'Optimizado',",
    "      diseño: 'Profesional',",
    "      soporte: 'Continuo',",
    "      resultado: '¡Éxito garantizado!'",
    "    };",
    "  }",
    "}",
    "",
    "// ¿Listos para impulsar su empresa?",
    "const suProyecto = new EquipoDesarrollo();",
    "suProyecto.desarrollarSolucion(suVision);"
  ];

  // Animation for the code typing
  useEffect(() => {
    let timeout: number;
    
    const typingSpeed = 50; // ms per character
    const erasingSpeed = 20; // ms per character
    const pauseBetweenLines = 1000; // ms to pause at the end of typing
    const pauseBeforeErasing = 2000; // ms to wait before erasing
    
    const animateTyping = () => {
      // Complete text to be displayed
      const targetText = codeLines.slice(0, currentLineIndex + 1).join('\n');
      
      if (isTyping) {
        // Typing animation
        if (codeContent.length < targetText.length) {
          setCodeContent(targetText.substring(0, codeContent.length + 1));
          timeout = window.setTimeout(animateTyping, typingSpeed);
        } else {
          // Finished typing current set of lines
          if (currentLineIndex < codeLines.length - 1) {
            // Move to next line
            timeout = window.setTimeout(() => {
              setCurrentLineIndex(currentLineIndex + 1);
            }, pauseBetweenLines);
          } else {
            // Reached the end, pause before erasing
            timeout = window.setTimeout(() => {
              setIsTyping(false);
            }, pauseBeforeErasing);
          }
        }
      } else {
        // Erasing animation
        if (codeContent.length > 0) {
          setCodeContent(codeContent.substring(0, codeContent.length - 1));
          timeout = window.setTimeout(animateTyping, erasingSpeed);
        } else {
          // Start over
          setCurrentLineIndex(0);
          setIsTyping(true);
        }
      }
    };
    
    timeout = window.setTimeout(animateTyping, 500); // Initial delay
    
    return () => {
      clearTimeout(timeout);
    };
  }, [codeContent, isTyping, currentLineIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (codeTextRef.current) {
        const phrases = [
          "Desarrollo Web Profesional",
          "Tiendas Online Rentables", 
          "Posicionamiento SEO Efectivo",
          "Soluciones Empresariales",
          "Mantenimiento Tecnológico"
        ];
        
        const currentText = codeTextRef.current.innerText;
        const currentIndex = phrases.indexOf(currentText);
        const nextIndex = (currentIndex + 1) % phrases.length;
        
        codeTextRef.current.style.opacity = '0';
        
        setTimeout(() => {
          if (codeTextRef.current) {
            codeTextRef.current.innerText = phrases[nextIndex];
            codeTextRef.current.style.opacity = '1';
          }
        }, 500);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="min-h-screen pt-16 grid-lines custom-gradient-bg relative overflow-hidden">
      {/* Enhanced decorative elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-theme-purple/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-theme-cyan/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      
      <div className="absolute -right-20 top-40 w-80 h-80 border border-white/10 rounded-full opacity-20 animate-rotate-slow"></div>
      <div className="absolute -left-40 top-60 w-96 h-96 border border-white/10 rounded-full opacity-10 animate-rotate-slow" style={{ animationDirection: 'reverse', animationDuration: '15s' }}></div>
      
      {/* Additional floating particles */}
      <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-primary/30 rounded-full animate-float-slow"></div>
      <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-accent/30 rounded-full animate-float-medium" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-5 h-5 bg-secondary/30 rounded-full animate-float-fast" style={{ animationDelay: '0.7s' }}></div>

      <div className="container mx-auto px-4 flex flex-col items-center justify-center h-full py-20">
        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl mx-auto gap-10">
          <div className="w-full md:w-1/2 space-y-6 animate-slide-up">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-4 animate-float-slow">
              <span>Equipo Especializado en Desarrollo</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-gradient animate-float-medium">App Web Soluciones</span><br />
              Transformamos Ideas en<br />
              Realidad Digital
            </h1>
            
            <div className="h-12 flex items-center">
              <div className="flex items-center text-xl md:text-2xl text-gray-300">
                <span>{'{'}</span>
                <div ref={codeTextRef} className="text-primary font-medium mx-2 transition-opacity duration-500">
                  Desarrollo Web Profesional
                </div>
                <span>{'}'}</span>
              </div>
            </div>
            
            <p className="text-gray-300 text-lg">
              Somos un equipo especializado en crear soluciones digitales integrales. Desarrollamos sitios web, tiendas online y aplicaciones que impulsan el crecimiento de su empresa con tecnología de vanguardia.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <Button size="lg" className="bg-primary hover:bg-primary/80 text-white animate-float-slow">
                <Rocket className="mr-2 h-5 w-5" /> Ver nuestros proyectos
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 animate-float-slow" style={{ animationDelay: '0.5s' }}>
                <Code className="mr-2 h-5 w-5" /> Contactar equipo
              </Button>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 flex justify-center animate-slide-up delay-300">
            <div className="relative animate-float-medium">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-theme-cyan rounded-lg blur-lg opacity-75 glow animate-pulse-slow"></div>
              <div className="relative dark-card rounded-lg p-4 shadow-xl">
                <pre className="text-xs md:text-sm lg:text-base font-mono overflow-x-auto whitespace-pre-wrap text-left code-container">
                  <code className="language-javascript inline-typing-animation">
                    {codeContent}
                    <span className="typing-cursor">▌</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
