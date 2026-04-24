import { useState, useEffect, useRef, useCallback } from 'react';
import { getOptimizedUrl } from '@/lib/image-utils';

const BASE =
  'https://iqnqpwnbdqzvqssxcxgb.supabase.co/storage/v1/object/public/product-assets/galleries/public/';

const SLIDES = [
  { src: getOptimizedUrl(`${BASE}a53835fa-0d07-4f8c-b15a-c881cec67f25.webp`, 560), filter: 'Cyberpunk',   accent: '130,54,236' },
  { src: getOptimizedUrl(`${BASE}ea13d65c-bd8f-4fbf-8143-50e161c77ad1.webp`, 560), filter: 'Cartoon 3D',  accent: '249,115,22' },
  { src: getOptimizedUrl(`${BASE}2111d922-0452-458e-a74e-85e91e3b5e2f.webp`, 560), filter: 'Artística',   accent: '16,185,129' },
  { src: getOptimizedUrl(`${BASE}f106af29-bbe1-4bd2-bbe5-abfb77b5d83e.jpg`,  560), filter: 'Realista',    accent: '250,204,21' },
  { src: getOptimizedUrl(`${BASE}c13ca48b-216b-4193-b176-74ce6b12e5d6.webp`, 560), filter: 'Digital Art', accent: '236,72,153' },
];

// Pré-carrega todas as imagens ao iniciar
SLIDES.forEach(s => { const img = new Image(); img.src = s.src; });

const INTERVAL_MS = 4500;
const SCAN_MS     = 600;
const FLASH_MS    = 120;
const REVEAL_MS   = 500;

interface CarouselProps {
  onAccentChange?: (accent: string, glowing: boolean) => void;
}

export default function HeroPhoneCarousel({ onAccentChange }: CarouselProps) {
  const [layerA, setLayerA] = useState(0);
  const [layerB, setLayerB] = useState(1);
  const [topLayer, setTopLayer] = useState<'A' | 'B'>('A');

  const [scanning, setScanning]   = useState(false);
  const [flashing, setFlashing]   = useState(false);
  const [revealing, setRevealing] = useState(false);

  const busyRef     = useRef(false);
  const topRef      = useRef<'A' | 'B'>('A');
  const layerARef   = useRef(0);
  const layerBRef   = useRef(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const t1Ref       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t2Ref       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t3Ref       = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onAccentRef = useRef(onAccentChange);
  useEffect(() => { onAccentRef.current = onAccentChange; }, [onAccentChange]);

  const clearTimers = () => {
    [t1Ref, t2Ref, t3Ref].forEach(r => { if (r.current) { clearTimeout(r.current); r.current = null; } });
  };

  const clearAll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    clearTimers();
  };

  const currentIndex = () => topRef.current === 'A' ? layerARef.current : layerBRef.current;

  const transition = useCallback((toIndex: number) => {
    if (busyRef.current) return;
    if (toIndex === currentIndex()) return;
    busyRef.current = true;

    const nextTop = topRef.current === 'A' ? 'B' : 'A';
    if (nextTop === 'B') {
      setLayerB(toIndex);
      layerBRef.current = toIndex;
    } else {
      setLayerA(toIndex);
      layerARef.current = toIndex;
    }

    const accent = SLIDES[toIndex].accent;
    onAccentRef.current?.(accent, true);

    setScanning(true);

    t1Ref.current = setTimeout(() => {
      setScanning(false);
      setFlashing(true);

      t2Ref.current = setTimeout(() => {
        setFlashing(false);
        setTopLayer(nextTop);
        topRef.current = nextTop;
        setRevealing(true);

        t3Ref.current = setTimeout(() => {
          setRevealing(false);
          busyRef.current = false;
          onAccentRef.current?.(accent, false);
        }, REVEAL_MS);
      }, FLASH_MS);
    }, SCAN_MS);
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const next = (currentIndex() + 1) % SLIDES.length;
      transition(next);
    }, INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [transition]);

  useEffect(() => () => { clearAll(); }, []);

  const goTo = useCallback((index: number) => {
    if (busyRef.current) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    transition(index);
    intervalRef.current = setInterval(() => {
      const next = (currentIndex() + 1) % SLIDES.length;
      transition(next);
    }, INTERVAL_MS);
  }, [transition]);

  const slideA = SLIDES[layerA];
  const slideB = SLIDES[layerB];
  const frontSlide = topLayer === 'A' ? slideA : slideB;
  const backSlide  = topLayer === 'A' ? slideB : slideA;
  const accent     = frontSlide.accent;
  const scanAccent = backSlide.accent;
  const idle       = !scanning && !flashing && !revealing;
  const badgeFilter = (scanning || flashing || revealing) ? backSlide.filter : frontSlide.filter;
  const badgeAccent = (scanning || flashing || revealing) ? scanAccent : accent;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* CAMADA A */}
      <img
        src={slideA.src}
        alt={topLayer === 'A' ? `Capa ${slideA.filter} gerada por IA PrintMyCase` : ''}
        aria-hidden={topLayer !== 'A'}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          zIndex: topLayer === 'A' ? 2 : 1,
          opacity: revealing && topLayer === 'B' ? 0 : 1,
          transition: revealing
            ? `opacity ${REVEAL_MS}ms cubic-bezier(0.25,0.46,0.45,0.94)`
            : 'none',
          willChange: 'opacity',
        }}
        draggable={false}
        loading="eager"
      />

      {/* CAMADA B */}
      <img
        src={slideB.src}
        alt={topLayer === 'B' ? `Capa ${slideB.filter} gerada por IA PrintMyCase` : ''}
        aria-hidden={topLayer !== 'B'}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          zIndex: topLayer === 'B' ? 2 : 1,
          opacity: revealing && topLayer === 'A' ? 0 : 1,
          transition: revealing
            ? `opacity ${REVEAL_MS}ms cubic-bezier(0.25,0.46,0.45,0.94)`
            : 'none',
          willChange: 'opacity',
        }}
        draggable={false}
        loading="eager"
      />

      {/* SCAN LINE */}
      {scanning && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
          <div
            className="absolute inset-x-0 top-0 pointer-events-none"
            style={{
              animation: `scan-trail ${SCAN_MS}ms linear forwards`,
              background: `linear-gradient(180deg, rgba(${scanAccent},0.15), transparent)`,
            }}
          />
          <div
            className="absolute inset-x-0 top-0 h-[3px] pointer-events-none"
            style={{
              animation: `scan-line ${SCAN_MS}ms linear forwards`,
              background: `linear-gradient(90deg, transparent, rgba(${scanAccent},1), transparent)`,
              boxShadow: `0 0 14px rgba(${scanAccent},0.9), 0 0 28px rgba(${scanAccent},0.5)`,
            }}
          />
          {[
            { top: '10%', left: '15%', delay: '0ms'   },
            { top: '20%', left: '78%', delay: '80ms'  },
            { top: '40%', left: '8%',  delay: '160ms' },
            { top: '55%', left: '88%', delay: '40ms'  },
            { top: '72%', left: '25%', delay: '200ms' },
            { top: '85%', left: '70%', delay: '120ms' },
          ].map((p, i) => (
            <div
              key={i}
              className="absolute pointer-events-none rounded-full"
              style={{
                top: p.top,
                left: p.left,
                width: '6px',
                height: '6px',
                background: `rgba(${scanAccent},0.95)`,
                boxShadow: `0 0 10px rgba(${scanAccent},0.9)`,
                animation: `particle-blink ${SCAN_MS}ms ease-in-out ${p.delay} forwards`,
                opacity: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* FLASH */}
      <div
        className="absolute inset-0 pointer-events-none bg-white"
        style={{
          opacity: flashing ? 0.55 : 0,
          transition: 'opacity 90ms ease-out',
          zIndex: 6,
        }}
      />

      {/* SCANLINES CRT */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.08]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 3px)',
          zIndex: 7,
        }}
      />

      {/* BADGE */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none" style={{ zIndex: 10 }}>
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md text-[11px] font-bold uppercase tracking-widest text-white"
          style={{
            background: `linear-gradient(135deg, rgba(${badgeAccent},0.85), rgba(0,0,0,0.55))`,
            boxShadow: `0 4px 14px rgba(${badgeAccent},0.4)`,
            border: '1px solid rgba(255,255,255,0.25)',
          }}
        >
          <span style={{ animation: idle ? 'hero-pulse 2s ease-in-out infinite' : 'none' }}>
            ✦
          </span>
          {badgeFilter}
        </div>
      </div>

      {/* DOTS */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5" style={{ zIndex: 10 }}>
        {SLIDES.map((s, i) => {
          const isFront = i === (topLayer === 'A' ? layerA : layerB);
          const isBack  = !isFront && i === (topLayer === 'A' ? layerB : layerA);
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ver capa ${s.filter}`}
              className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              style={{
                width:  isFront ? '20px' : isBack ? '10px' : '6px',
                height: '6px',
                background: isFront
                  ? `rgba(${accent},0.95)`
                  : isBack
                  ? `rgba(${s.accent},0.5)`
                  : 'rgba(255,255,255,0.35)',
                boxShadow: isFront ? `0 0 10px rgba(${accent},0.75)` : 'none',
                transition: 'all 300ms cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
