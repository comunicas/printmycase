import { useState, useEffect, useRef } from 'react';
import { getOptimizedUrl } from '@/lib/image-utils';

const SUPABASE_BASE =
  'https://iqnqpwnbdqzvqssxcxgb.supabase.co/storage/v1/object/public/product-assets/galleries/public/';

const SLIDES = [
  {
    src: getOptimizedUrl(`${SUPABASE_BASE}a53835fa-0d07-4f8c-b15a-c881cec67f25.webp`, 560),
    filter: 'Cyberpunk',
    alt: 'Capa Cyberpunk gerada por IA',
    accent: '130,54,236',
  },
  {
    src: getOptimizedUrl(`${SUPABASE_BASE}ea13d65c-bd8f-4fbf-8143-50e161c77ad1.webp`, 560),
    filter: 'Cartoon 3D',
    alt: 'Capa Cartoon 3D gerada por IA',
    accent: '249,115,22',
  },
  {
    src: getOptimizedUrl(`${SUPABASE_BASE}2111d922-0452-458e-a74e-85e91e3b5e2f.webp`, 560),
    filter: 'Artística',
    alt: 'Capa Artística gerada por IA',
    accent: '16,185,129',
  },
  {
    src: getOptimizedUrl(`${SUPABASE_BASE}f106af29-bbe1-4bd2-bbe5-abfb77b5d83e.jpg`, 560),
    filter: 'Realista',
    alt: 'Capa Realista gerada por IA',
    accent: '250,204,21',
  },
  {
    src: getOptimizedUrl(`${SUPABASE_BASE}c13ca48b-216b-4193-b176-74ce6b12e5d6.webp`, 560),
    filter: 'Digital Art',
    alt: 'Capa Digital Art gerada por IA',
    accent: '236,72,153',
  },
];

function preloadImages() {
  SLIDES.forEach((s) => {
    const i = new Image();
    i.src = s.src;
  });
}

type Phase = 'idle' | 'scanning' | 'flash' | 'revealing';

const INTERVAL_MS = 4000;
const SCAN_MS = 600;
const FLASH_MS = 150;
const REVEAL_MS = 500;

interface CarouselProps {
  onAccentChange?: (accent: string, isTransitioning: boolean) => void;
}

export default function HeroPhoneCarousel({ onAccentChange }: CarouselProps) {
  const [current, setCurrent] = useState(0);
  const [nextIdx, setNextIdx] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [scanY, setScanY] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    preloadImages();
  }, []);

  const startTransition = (toIndex: number) => {
    if (phase !== 'idle') return;
    const nextAccent = SLIDES[toIndex].accent;
    setNextIdx(toIndex);
    setPhase('scanning');
    setScanY(0);
    onAccentChange?.(nextAccent, true);

    const startTime = performance.now();
    const animScan = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / SCAN_MS, 1);
      setScanY(progress * 100);
      if (progress < 1) {
        animRef.current = setTimeout(animScan, 16);
      } else {
        setPhase('flash');
        animRef.current = setTimeout(() => {
          setCurrent(toIndex);
          setPhase('revealing');
          animRef.current = setTimeout(() => {
            setPhase('idle');
            setNextIdx(null);
            onAccentChange?.(nextAccent, false);
          }, REVEAL_MS);
        }, FLASH_MS);
      }
    };
    animRef.current = setTimeout(animScan, 16);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      const next = (current + 1) % SLIDES.length;
      startTransition(next);
    }, INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animRef.current) clearTimeout(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, phase]);

  const goTo = (index: number) => {
    if (index === current || phase !== 'idle') return;
    if (timerRef.current) clearInterval(timerRef.current);
    startTransition(index);
  };

  const slide = SLIDES[current];
  const nextSlide = nextIdx !== null ? SLIDES[nextIdx] : null;
  const accent = slide.accent;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* IMAGEM ATUAL */}
      <img
        src={slide.src}
        alt={slide.alt}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: phase === 'scanning' ? 'brightness(1.08) saturate(1.1)' : 'none',
          transition: 'filter 300ms ease-out',
        }}
        loading="eager"
        decoding="async"
      />

      {/* PRÓXIMA IMAGEM (entra no reveal) */}
      {nextSlide && (
        <img
          src={nextSlide.src}
          alt={nextSlide.alt}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: phase === 'revealing' || phase === 'flash' ? 1 : 0,
            transition: `opacity ${REVEAL_MS}ms cubic-bezier(0.4,0,0.2,1)`,
          }}
          loading="eager"
          decoding="async"
        />
      )}

      {/* SCAN LINE */}
      {phase === 'scanning' && (
        <>
          {/* Gradiente abaixo da scan line — área "já processada" */}
          <div
            className="absolute inset-x-0 top-0 pointer-events-none"
            style={{
              height: `${scanY}%`,
              background: `linear-gradient(180deg, rgba(${accent},0) 0%, rgba(${accent},0.08) 60%, rgba(${accent},0.18) 100%)`,
              mixBlendMode: 'screen',
            }}
          />
          {/* Linha principal */}
          <div
            className="absolute inset-x-0 pointer-events-none"
            style={{
              top: `${scanY}%`,
              height: '3px',
              background: `linear-gradient(90deg, transparent, rgba(${accent},1) 50%, transparent)`,
              boxShadow: `0 0 20px rgba(${accent},0.9), 0 0 40px rgba(${accent},0.6)`,
              transform: 'translateY(-1.5px)',
            }}
          />
          {/* Partículas de energia */}
          {[
            { top: '8%', left: '12%', delay: '0ms' },
            { top: '15%', left: '80%', delay: '120ms' },
            { top: '35%', left: '5%', delay: '60ms' },
            { top: '50%', left: '88%', delay: '200ms' },
            { top: '70%', left: '20%', delay: '80ms' },
            { top: '80%', left: '75%', delay: '140ms' },
          ].map((p, i) => (
            <span
              key={i}
              className="absolute pointer-events-none rounded-full"
              style={{
                top: p.top,
                left: p.left,
                width: '4px',
                height: '4px',
                background: `rgba(${accent},1)`,
                boxShadow: `0 0 8px rgba(${accent},0.9), 0 0 16px rgba(${accent},0.6)`,
                animation: `hero-pulse 600ms ease-in-out ${p.delay} infinite`,
              }}
            />
          ))}
        </>
      )}

      {/* FLASH BRANCO */}
      <div
        className="absolute inset-0 pointer-events-none bg-white"
        style={{
          opacity: phase === 'flash' ? 0.55 : 0,
          transition: `opacity ${FLASH_MS}ms ease-out`,
        }}
      />

      {/* OVERLAY SCANLINES SUTIL (textura CRT) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 3px)',
          mixBlendMode: 'multiply',
          opacity: 0.35,
        }}
      />

      {/* BADGE FILTRO IA */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          transition: 'all 400ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white backdrop-blur-md"
          style={{
            background: `linear-gradient(135deg, rgba(${accent},0.55), rgba(0,0,0,0.55))`,
            boxShadow: `0 4px 16px rgba(${accent},0.35), inset 0 1px 0 rgba(255,255,255,0.2)`,
            border: `1px solid rgba(${accent},0.5)`,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              animation: phase === 'idle' ? 'hero-pulse 2s ease-in-out infinite' : 'none',
            }}
          >
            ✦
          </span>
          {nextSlide && phase !== 'idle' ? nextSlide.filter : slide.filter}
        </span>
      </div>

      {/* DOTS NAVEGAÇÃO */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        {SLIDES.map((s, i) => {
          const isActiveDot = i === current;
          const isNext = i === nextIdx;
          return (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ver capa ${s.filter}`}
              className="rounded-full focus:outline-none"
              style={{
                width: isActiveDot ? '20px' : isNext ? '10px' : '6px',
                height: '6px',
                background: isActiveDot
                  ? `rgba(${accent},0.95)`
                  : isNext
                  ? `rgba(${s.accent},0.6)`
                  : 'rgba(255,255,255,0.4)',
                boxShadow: isActiveDot ? `0 0 10px rgba(${accent},0.8)` : 'none',
                transition: 'all 300ms cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
