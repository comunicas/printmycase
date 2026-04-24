import { useState, useEffect, useRef, useCallback } from 'react';
import { getOptimizedUrl } from '@/lib/image-utils';

const BASE =
  'https://iqnqpwnbdqzvqssxcxgb.supabase.co/storage/v1/object/public/product-assets/galleries/public/';

const SLIDES = [
  { src: getOptimizedUrl(`${BASE}a53835fa-0d07-4f8c-b15a-c881cec67f25.webp`, 560), filter: 'Cyberpunk',   accent: '130,54,236'  },
  { src: getOptimizedUrl(`${BASE}ea13d65c-bd8f-4fbf-8143-50e161c77ad1.webp`, 560), filter: 'Cartoon 3D', accent: '249,115,22'  },
  { src: getOptimizedUrl(`${BASE}2111d922-0452-458e-a74e-85e91e3b5e2f.webp`, 560), filter: 'Artística',  accent: '16,185,129'  },
  { src: getOptimizedUrl(`${BASE}f106af29-bbe1-4bd2-bbe5-abfb77b5d83e.jpg`,  560), filter: 'Realista',   accent: '250,204,21'  },
  { src: getOptimizedUrl(`${BASE}c13ca48b-216b-4193-b176-74ce6b12e5d6.webp`, 560), filter: 'Digital Art', accent: '236,72,153' },
];

// Pré-carrega todas as imagens uma única vez ao importar o módulo
SLIDES.forEach(s => { const img = new Image(); img.src = s.src; });

const INTERVAL_MS = 4200;
const SCAN_MS     = 550;
const FLASH_MS    = 130;
const REVEAL_MS   = 480;

interface CarouselProps {
  onAccentChange?: (accent: string, glowing: boolean) => void;
}

export default function HeroPhoneCarousel({ onAccentChange }: CarouselProps) {
  const [current, setCurrent]     = useState(0);
  const [incoming, setIncoming]   = useState<number | null>(null);
  const [scanning, setScanning]   = useState(false);
  const [flashing, setFlashing]   = useState(false);
  const [revealing, setRevealing] = useState(false);

  const busyRef    = useRef(false);
  const currentRef = useRef(0);
  const t1Ref      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t2Ref      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t3Ref      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAll = () => {
    if (t1Ref.current) { clearTimeout(t1Ref.current); t1Ref.current = null; }
    if (t2Ref.current) { clearTimeout(t2Ref.current); t2Ref.current = null; }
    if (t3Ref.current) { clearTimeout(t3Ref.current); t3Ref.current = null; }
  };

  const transition = useCallback((toIndex: number) => {
    if (busyRef.current) return;
    if (toIndex === currentRef.current) return;
    busyRef.current = true;

    const accent = SLIDES[toIndex].accent;
    onAccentChange?.(accent, true);

    setIncoming(toIndex);
    setScanning(true);

    t1Ref.current = setTimeout(() => {
      setScanning(false);
      setFlashing(true);

      t2Ref.current = setTimeout(() => {
        setCurrent(toIndex);
        currentRef.current = toIndex;
        setFlashing(false);
        setRevealing(true);

        t3Ref.current = setTimeout(() => {
          setRevealing(false);
          setIncoming(null);
          busyRef.current = false;
          onAccentChange?.(accent, false);
        }, REVEAL_MS);
      }, FLASH_MS);
    }, SCAN_MS);
  }, [onAccentChange]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const next = (currentRef.current + 1) % SLIDES.length;
      transition(next);
    }, INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearAll();
    };
  }, [transition]);

  useEffect(() => () => { clearAll(); }, []);

  const goTo = useCallback((index: number) => {
    if (busyRef.current) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    transition(index);
    intervalRef.current = setInterval(() => {
      const next = (currentRef.current + 1) % SLIDES.length;
      transition(next);
    }, INTERVAL_MS);
  }, [transition]);

  const slide   = SLIDES[current];
  const inSlide = incoming !== null ? SLIDES[incoming] : null;
  const accent  = slide.accent;
  const badgeAccent = (inSlide && (scanning || flashing || revealing)) ? inSlide.accent : accent;
  const scanAccent = inSlide?.accent ?? accent;
  const idle = !scanning && !flashing && !revealing;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* IMAGEM ATUAL */}
      <img
        src={slide.src}
        alt={`Capa ${slide.filter} gerada por IA`}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: revealing ? 0 : 1,
          transition: revealing ? `opacity ${REVEAL_MS}ms cubic-bezier(0.4,0,0.2,1)` : 'none',
        }}
        draggable={false}
      />

      {/* NOVA IMAGEM — dissolve no reveal */}
      {inSlide && (
        <img
          src={inSlide.src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: revealing ? 1 : 0,
            transition: revealing ? `opacity ${REVEAL_MS}ms cubic-bezier(0.4,0,0.2,1)` : 'none',
          }}
          draggable={false}
        />
      )}

      {/* SCAN LINE */}
      {scanning && (
        <>
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
          {['8% 14%','18% 82%','38% 6%','52% 90%','68% 22%','82% 76%'].map((pos, i) => {
            const [top, left] = pos.split(' ');
            return (
              <div
                key={i}
                className="absolute pointer-events-none rounded-full"
                style={{
                  top, left,
                  width: '6px',
                  height: '6px',
                  background: `rgba(${scanAccent},0.95)`,
                  boxShadow: `0 0 10px rgba(${scanAccent},0.9)`,
                  animation: `particle-blink ${SCAN_MS}ms ease-in-out ${i * 60}ms forwards`,
                  opacity: 0,
                }}
              />
            );
          })}
        </>
      )}

      {/* FLASH */}
      <div
        className="absolute inset-0 pointer-events-none bg-white"
        style={{
          opacity: flashing ? 0.55 : 0,
          transition: 'opacity 90ms ease-out',
        }}
      />

      {/* SCANLINES CRT */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.08]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 3px)',
        }}
      />

      {/* BADGE FILTRO IA */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none z-10">
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
          {inSlide && !idle ? inSlide.filter : slide.filter}
        </div>
      </div>

      {/* DOTS */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        {SLIDES.map((s, i) => {
          const isActive = i === current;
          const isNext   = i === incoming;
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ver capa ${s.filter}`}
              className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              style={{
                width:  isActive ? '20px' : isNext ? '10px' : '6px',
                height: '6px',
                background: isActive
                  ? `rgba(${accent},0.95)`
                  : isNext
                  ? `rgba(${s.accent},0.55)`
                  : 'rgba(255,255,255,0.38)',
                boxShadow: isActive ? `0 0 10px rgba(${accent},0.75)` : 'none',
                transition: 'all 280ms cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
