import { useState, useEffect } from 'react';

const SLIDES = [
  { src: '/hero-slides/slide-1.jpg', filter: 'Cyberpunk', alt: 'Capa personalizada estilo Cyberpunk gerada por IA' },
  { src: '/hero-slides/slide-2.jpg', filter: 'Cartoon 3D', alt: 'Capa personalizada estilo Cartoon 3D gerada por IA' },
  { src: '/hero-slides/slide-3.jpg', filter: 'Pixel Art', alt: 'Capa personalizada estilo Pixel Art gerada por IA' },
  { src: '/hero-slides/slide-4.jpg', filter: 'Anime', alt: 'Capa personalizada estilo Anime gerada por IA' },
  { src: '/hero-slides/slide-5.jpg', filter: 'Aquarela', alt: 'Capa personalizada estilo Aquarela gerada por IA' },
];

const INTERVAL_MS = 3200;
const FADE_MS = 800;

export default function HeroPhoneCarousel() {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const goTo = (index: number) => {
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setTransitioning(false);
    }, FADE_MS / 2);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % SLIDES.length);
        setTransitioning(false);
      }, FADE_MS / 2);
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className="absolute inset-0">
      {/* Camada de imagem com crossfade */}
      <div
        className="absolute inset-0 transition-opacity ease-in-out"
        style={{ transitionDuration: `${FADE_MS}ms`, opacity: transitioning ? 0 : 1 }}
      >
        <img
          src={slide.src}
          alt={slide.alt}
          className="w-full h-full object-cover"
          loading="eager"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = '0';
          }}
        />
      </div>

      {/* Badge do filtro IA */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 transition-opacity ease-in-out pointer-events-none"
        style={{ transitionDuration: `${FADE_MS}ms`, opacity: transitioning ? 0 : 1 }}
      >
        <span
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-md"
          style={{ background: 'rgba(0,0,0,0.45)' }}
        >
          ✦ {slide.filter}
        </span>
      </div>

      {/* Indicadores de posição */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            className="transition-all duration-300 rounded-full"
            style={{
              width: i === current ? '20px' : '6px',
              height: '6px',
              background: i === current ? 'white' : 'rgba(255,255,255,0.45)',
            }}
            aria-label={`Ver slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
