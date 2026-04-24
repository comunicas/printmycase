import { useState, useEffect } from 'react';
import { getOptimizedUrl } from '@/lib/image-utils';

// URLs base no bucket product-assets/galleries/public/
// Usando o padrão object/public para que getOptimizedUrl aplique
// resize e conversão WebP automaticamente (seguindo AiCoinsSection)
const SUPABASE_BASE = 'https://iqnqpwnbdqzvqssxcxgb.supabase.co/storage/v1/object/public/product-assets/galleries/public/';

const SLIDES = [
  {
    src: getOptimizedUrl(`${SUPABASE_BASE}a53835fa-0d07-4f8c-b15a-c881cec67f25.webp`, 560),
    filter: 'Cyberpunk',
    alt: 'Capa personalizada estilo Cyberpunk gerada por IA PrintMyCase',
  },
  {
    src: getOptimizedUrl(`${SUPABASE_BASE}ea13d65c-bd8f-4fbf-8143-50e161c77ad1.webp`, 560),
    filter: 'Cartoon 3D',
    alt: 'Capa personalizada estilo Cartoon 3D gerada por IA PrintMyCase',
  },
  {
    src: getOptimizedUrl(`${SUPABASE_BASE}2111d922-0452-458e-a74e-85e91e3b5e2f.webp`, 560),
    filter: 'Artística',
    alt: 'Capa personalizada estilo Artístico gerada por IA PrintMyCase',
  },
  {
    src: getOptimizedUrl(`${SUPABASE_BASE}f106af29-bbe1-4bd2-bbe5-abfb77b5d83e.jpg`, 560),
    filter: 'Realista',
    alt: 'Capa personalizada estilo Realista gerada por IA PrintMyCase',
  },
  {
    src: getOptimizedUrl(`${SUPABASE_BASE}c13ca48b-216b-4193-b176-74ce6b12e5d6.webp`, 560),
    filter: 'Digital Art',
    alt: 'Capa personalizada estilo Digital Art gerada por IA PrintMyCase',
  },
];

// Pré-carrega todas as imagens para eliminar flash na primeira transição
function preloadImages() {
  SLIDES.forEach((slide) => {
    const img = new Image();
    img.src = slide.src;
  });
}

const INTERVAL_MS = 3400;
const FADE_MS = 700;

export default function HeroPhoneCarousel() {
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState<number | null>(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    preloadImages();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (current + 1) % SLIDES.length;
      setNext(nextIndex);
      setFading(true);
      setTimeout(() => {
        setCurrent(nextIndex);
        setNext(null);
        setFading(false);
      }, FADE_MS);
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, [current]);

  const goTo = (index: number) => {
    if (index === current || fading) return;
    setNext(index);
    setFading(true);
    setTimeout(() => {
      setCurrent(index);
      setNext(null);
      setFading(false);
    }, FADE_MS);
  };

  return (
    <div className="absolute inset-0">
      {/* Imagem atual — sai com fade out */}
      <img
        src={SLIDES[current].src}
        alt={SLIDES[current].alt}
        className="absolute inset-0 w-full h-full object-cover ease-in-out"
        style={{
          transitionProperty: 'opacity',
          transitionDuration: `${FADE_MS}ms`,
          opacity: fading ? 0 : 1,
        }}
        loading="eager"
        decoding="async"
      />

      {/* Próxima imagem — entra com fade in */}
      {next !== null && (
        <img
          src={SLIDES[next].src}
          alt={SLIDES[next].alt}
          className="absolute inset-0 w-full h-full object-cover ease-in-out"
          style={{
            transitionProperty: 'opacity',
            transitionDuration: `${FADE_MS}ms`,
            opacity: fading ? 1 : 0,
          }}
          loading="eager"
          decoding="async"
        />
      )}

      {/* Badge do filtro IA — topo centralizado */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 ease-in-out pointer-events-none"
        style={{
          transitionProperty: 'opacity',
          transitionDuration: `${FADE_MS}ms`,
          opacity: fading ? 0 : 1,
        }}
      >
        <span
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-md"
          style={{ background: 'rgba(0,0,0,0.45)' }}
        >
          ✦ {SLIDES[current].filter}
        </span>
      </div>

      {/* Dots de navegação — fundo */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Ver capa ${i + 1}: ${SLIDES[i].filter}`}
            className="rounded-full transition-all duration-300 focus:outline-none"
            style={{
              width: i === current ? '18px' : '6px',
              height: '6px',
              background:
                i === current
                  ? 'rgba(255,255,255,0.95)'
                  : 'rgba(255,255,255,0.40)',
              boxShadow: i === current ? '0 0 8px rgba(255,255,255,0.6)' : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}
