
import React, { useState, useEffect, useRef } from 'react';

interface StatProps {
  value: number;
  label: string;
  suffix?: string;
  delay: number;
}

const StatCounter: React.FC<StatProps> = ({ value, label, suffix = "", delay }) => {
  const [count, setCount] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          
          // Start counting after the delay
          const timer = setTimeout(() => {
            let start = 0;
            const increment = value / 40; // Divide by steps for smooth animation
            const interval = setInterval(() => {
              start += increment;
              if (start >= value) {
                start = value;
                clearInterval(interval);
              }
              setCount(Math.floor(start));
            }, 30); // 30ms per step
            
            return () => clearInterval(interval);
          }, delay);
          
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [value, delay]);

  return (
    <div ref={sectionRef} className="text-center animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
      <h3 className="text-4xl md:text-5xl font-bold text-primary mb-2 animate-float-medium" style={{ animationDelay: `${delay + 200}ms` }}>
        {count}{suffix}
      </h3>
      <p className="text-gray-300">{label}</p>
    </div>
  );
};

const StatsSection: React.FC = () => {
  const stats = [
    { value: 120, label: "Proyectos Completados", suffix: "+", delay: 0 },
    { value: 98, label: "Clientes Satisfechos", suffix: "%", delay: 150 },
    { value: 5, label: "Años de Experiencia", suffix: "+", delay: 300 },
    { value: 24, label: "Tecnologías Dominadas", suffix: "+", delay: 450 }
  ];

  return (
    <section className="py-20 bg-card/80 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 grid-lines"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto dark-card rounded-xl p-10 backdrop-blur-sm hover:animate-glow transition-all duration-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <StatCounter
                key={index}
                value={stat.value}
                label={stat.label}
                suffix={stat.suffix}
                delay={stat.delay}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
