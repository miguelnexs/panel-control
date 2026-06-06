
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const slides = [
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=400&fit=crop&crop=center',
      alt: 'Modelo elegante con bolso',
      title: 'CÓDIGO DE',
      subtitle: 'ELEGANCIA'
    },
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&h=400&fit=crop&crop=center',
      alt: 'Modelo con accesorios',
      title: 'ESTILO',
      subtitle: 'ATEMPORAL'
    },
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop&crop=center',
      alt: 'Modelo urbana',
      title: 'URBANO Y',
      subtitle: 'SOFISTICADO'
    },
    {
      type: 'video',
      src: 'https://player.vimeo.com/external/371433421.sd.mp4?s=02b95c80b60e0c64c0e27cb2f0f8c8da4e3e6b0b&profile_id=165&oauth2_token_id=57447761',
      poster: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=400&fit=crop&crop=center',
      alt: 'Video promocional',
      title: 'NUEVA',
      subtitle: 'COLECCIÓN'
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <section className="relative h-96 bg-gradient-to-r from-neutral-100 to-neutral-200 overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-105'
          }`}
        >
          <div className="absolute inset-0 bg-black/30 z-10"></div>
          
          {slide.type === 'image' ? (
            <img
              src={slide.src}
              alt={slide.alt}
              className="w-full h-full object-cover transition-transform duration-1000 ease-out hover:scale-105"
            />
          ) : (
            <video
              src={slide.src}
              poster={slide.poster}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          )}
        </div>
      ))}

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="text-center space-y-4 text-white animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight transition-all duration-500">
            {slides[currentSlide].title}
          </h2>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight transition-all duration-500">
            {slides[currentSlide].subtitle}
          </h2>
          <div className="mt-8">
            <span className="inline-block bg-white text-neutral-900 px-8 py-2 text-sm font-medium tracking-wider hover:bg-neutral-100 transition-colors cursor-pointer">
              NUEVA COLECCIÓN
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 text-white border-0"
        onClick={prevSlide}
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 text-white border-0"
        onClick={nextSlide}
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Play/Pause Control */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-4 right-4 z-30 bg-white/20 hover:bg-white/30 text-white border-0"
        onClick={togglePlayPause}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>

      {/* Technical Detail */}
      <div className="absolute bottom-4 right-16 text-xs text-white/70 font-mono z-30">
        slide({currentSlide + 1}/{slides.length})
      </div>
    </section>
  );
};

export default HeroCarousel;
