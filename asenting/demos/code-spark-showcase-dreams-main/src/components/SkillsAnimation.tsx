
import React, { useEffect, useRef } from 'react';

interface Skill {
  name: string;
  size: number;
  color: string;
  speed: number;
}

const SkillsAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const skills: Skill[] = [
      { name: 'React', size: 80, color: '#61DAFB', speed: 0.4 },
      { name: 'JavaScript', size: 90, color: '#F7DF1E', speed: 0.3 },
      { name: 'Node.js', size: 75, color: '#339933', speed: 0.5 },
      { name: 'TypeScript', size: 70, color: '#3178C6', speed: 0.2 },
      { name: 'HTML5', size: 65, color: '#E34F26', speed: 0.3 },
      { name: 'CSS3', size: 65, color: '#1572B6', speed: 0.35 },
      { name: 'MongoDB', size: 60, color: '#47A248', speed: 0.45 },
      { name: 'Express', size: 55, color: '#ffffff', speed: 0.25 },
      { name: 'SQL', size: 70, color: '#e16c25', speed: 0.4 },
      { name: 'Git', size: 50, color: '#F05032', speed: 0.35 },
      { name: 'UI/UX', size: 75, color: '#FF3E81', speed: 0.3 },
      { name: 'Responsive', size: 70, color: '#4cc9f0', speed: 0.4 }
    ];
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    // Set canvas size
    const handleResize = () => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Initialize positions
    const skillPositions = skills.map((skill) => {
      return {
        ...skill,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dx: (Math.random() - 0.5) * skill.speed,
        dy: (Math.random() - 0.5) * skill.speed
      };
    });
    
    // Animation function
    const animate = () => {
      if (!canvas || !ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw and update each skill
      skillPositions.forEach((skill) => {
        // Update position
        skill.x += skill.dx;
        skill.y += skill.dy;
        
        // Bounce off walls
        if (skill.x < skill.size / 2 || skill.x > canvas.width - skill.size / 2) {
          skill.dx = -skill.dx;
        }
        
        if (skill.y < skill.size / 2 || skill.y > canvas.height - skill.size / 2) {
          skill.dy = -skill.dy;
        }
        
        // Draw skill bubble
        ctx.beginPath();
        ctx.arc(skill.x, skill.y, skill.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = `${skill.color}20`;
        ctx.fill();
        ctx.strokeStyle = skill.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw skill name
        ctx.fillStyle = skill.color;
        ctx.font = `${skill.size / 3}px Poppins, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(skill.name, skill.x, skill.y);
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <div className="w-full h-full">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      />
    </div>
  );
};

export default SkillsAnimation;
