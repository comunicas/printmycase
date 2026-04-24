import { useRef, useState, useCallback, useEffect } from "react";
import { Camera, CheckCircle2, ImagePlus, Move, Loader2, Sparkles } from "lucide-react";
import { SAFE_ZONE_PRESETS, DEFAULT_SAFE_ZONE_PRESET, type SafeZonePreset } from "@/lib/safe-zone-presets";

type UploadState = "idle" | "preparing" | "optimizing" | "ready";

interface PhonePreviewProps {
  image: string | null;
  scale: number;
  position: { x: number; y: number };
  rotation?: number;
  deviceSlug?: string;
  showSafeZone?: boolean;
  onPositionChange: (pos: { x: number; y: number }) => void;
  onScaleChange?: (scale: number) => void;
  onImageUpload: (file: File) => void;
  
  imageResolution?: { w: number; h: number } | null;
  isProcessing?: boolean;
  uploadState?: UploadState;
  uploadStatusLabel?: string;
  processingMessage?: string;
  onUpscaleClick?: () => void;
  previewImageUrl?: string | null;
  disabled?: boolean;
}

const CROSSFADE_MS = 200;

// Safe zone presets are imported from @/lib/safe-zone-presets

const PhonePreview = ({ image, scale, position, rotation = 0, deviceSlug, showSafeZone = true, onPositionChange, onScaleChange, onImageUpload, imageResolution, isProcessing, uploadState = "idle", uploadStatusLabel, processingMessage, onUpscaleClick, previewImageUrl, disabled }: PhonePreviewProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : false
  );
  const startPos = useRef({ x: 0, y: 0 });
  const startOffset = useRef({ x: 0, y: 0 });

  // Crossfade state
  const [displayImage, setDisplayImage] = useState<string | null>(image);
  const [prevImage, setPrevImage] = useState<string | null>(null);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    if (image === displayImage) return;
    // Start crossfade
    setPrevImage(displayImage);
    setDisplayImage(image);
    setFadeIn(false);
    // Trigger fade-in on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setFadeIn(true));
    });
    // Clean up prev image after transition
    const t = setTimeout(() => setPrevImage(null), CROSSFADE_MS + 50);
    return () => clearTimeout(t);
  }, [image]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 1024px)");
    const handleChange = (event: MediaQueryListEvent) => setIsDesktopViewport(event.matches);

    setIsDesktopViewport(media.matches);
    media.addEventListener("change", handleChange);

    return () => media.removeEventListener("change", handleChange);
  }, []);

  // Pinch refs
  const isPinching = useRef(false);
  const initialPinchDist = useRef(0);
  const initialPinchScale = useRef(100);

  const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

  // Snap animation on drag end
  useEffect(() => {
    if (!isDragging && image) {
      setIsSnapping(true);
      const t = setTimeout(() => setIsSnapping(false), 200);
      return () => clearTimeout(t);
    }
  }, [isDragging, image]);

  // --- Pointer events (desktop drag) ---
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!image || e.pointerType === 'touch') return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startOffset.current = { x: position.x, y: position.y };
  }, [image, position]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleFactor = scale / 100;
    const sensitivity = 100 / scaleFactor;
    const dx = ((e.clientX - startPos.current.x) / rect.width) * sensitivity;
    const dy = ((e.clientY - startPos.current.y) / rect.height) * sensitivity;
    onPositionChange({
      x: clamp(startOffset.current.x + dx),
      y: clamp(startOffset.current.y + dy),
    });
  }, [isDragging, onPositionChange, scale]);

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Refs for touch handler access to latest state
  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const isDraggingRef = useRef(isDragging);
  isDraggingRef.current = isDragging;
  const positionRef = useRef(position);
  positionRef.current = position;
  const onPositionChangeRef = useRef(onPositionChange);
  onPositionChangeRef.current = onPositionChange;
  const onScaleChangeRef = useRef(onScaleChange);
  onScaleChangeRef.current = onScaleChange;

  // --- Native touch + wheel events (passive: false for preventDefault) ---
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (!image) return;
      if (e.touches.length === 2) {
        isPinching.current = true;
        setIsDragging(false);
        const t1 = e.touches[0], t2 = e.touches[1];
        initialPinchDist.current = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        initialPinchScale.current = scaleRef.current;
        navigator.vibrate?.(10);
      } else if (e.touches.length === 1 && !isPinching.current) {
        setIsDragging(true);
        startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        startOffset.current = { x: positionRef.current.x, y: positionRef.current.y };
        navigator.vibrate?.(10);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!image || !containerRef.current) return;
      if (e.touches.length === 2 && isPinching.current && onScaleChangeRef.current) {
        e.preventDefault();
        const t1 = e.touches[0], t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const ratio = dist / initialPinchDist.current;
        const newScale = Math.round(clamp(initialPinchScale.current * ratio, 50, 200));
        onScaleChangeRef.current(newScale);
      } else if (e.touches.length === 1 && isDraggingRef.current && !isPinching.current) {
        e.preventDefault();
        const rect = containerRef.current.getBoundingClientRect();
        const scaleFactor = scaleRef.current / 100;
        const sensitivity = 100 / scaleFactor;
        const dx = ((e.touches[0].clientX - startPos.current.x) / rect.width) * sensitivity;
        const dy = ((e.touches[0].clientY - startPos.current.y) / rect.height) * sensitivity;
        onPositionChangeRef.current({
          x: clamp(startOffset.current.x + dx),
          y: clamp(startOffset.current.y + dy),
        });
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) isPinching.current = false;
      if (e.touches.length === 0) setIsDragging(false);
    };

    const handleWheel = (e: WheelEvent) => {
      if (!image || !onScaleChangeRef.current) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -5 : 5;
      onScaleChangeRef.current(clamp(scaleRef.current + delta, 50, 200));
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("wheel", handleWheel);
    };
  }, [image]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageUpload(file);
    e.target.value = '';
  };

  const oversize = Math.max(150, scale * 1.25);
  const offset = -(oversize - 100) / 2;
  const safeZonePreset = (deviceSlug && SAFE_ZONE_PRESETS[deviceSlug]) || DEFAULT_SAFE_ZONE_PRESET;
  const safeZoneRadius = isDesktopViewport ? safeZonePreset.radius : safeZonePreset.mobileRadius ?? safeZonePreset.radius;
  const safeZoneBottomRadius = isDesktopViewport ? safeZonePreset.bottomRadius : safeZonePreset.mobileBottomRadius ?? safeZonePreset.bottomRadius;
  const isUploadBusy = uploadState === "preparing" || uploadState === "optimizing";
  const showUploadReady = uploadState === "ready";
  const showStatusOverlay = isProcessing || isUploadBusy || showUploadReady;
  const statusMessage = isUploadBusy ? uploadStatusLabel : processingMessage || uploadStatusLabel || "Processando...";
  const buildImageStyle = (src: string) => ({
    backgroundImage: `url("${src}")`,
    backgroundSize: `${scale * (100 / oversize)}%`,
    backgroundPosition: `${position.x}% ${position.y}%`,
    backgroundRepeat: "no-repeat" as const,
    width: `${oversize}%`,
    height: `${oversize}%`,
    left: `${offset}%`,
    top: `${offset}%`,
  });

  return (
    <div className="flex flex-col items-center gap-2 lg:gap-3">
      <div className="relative">
        <div
          className="relative h-[min(410px,50dvh)] aspect-[260/532] lg:h-[70vh] lg:w-auto lg:aspect-[260/532] rounded-[2.2rem] lg:rounded-[2.8rem] border-[4px] lg:border-[5px] border-foreground/80 bg-foreground/5 shadow-2xl overflow-hidden"
          aria-busy={isProcessing || isUploadBusy}
          aria-describedby="customize-upload-status"
        >
          {/* Previous image layer (fading out) */}
          {prevImage && (
            <div
              className="absolute pointer-events-none"
              style={{
                ...buildImageStyle(prevImage),
                transform: `rotate(${rotation}deg)`,
                opacity: fadeIn ? 0 : 1,
                transition: `opacity ${CROSSFADE_MS}ms ease-in-out, transform 0.3s ease`,
              }}
            />
          )}
          {/* Current image layer (fading in) */}
          {displayImage && (
            <div
              className="absolute pointer-events-none"
              style={{
                ...buildImageStyle(displayImage),
                transform: `rotate(${rotation}deg)`,
                opacity: prevImage ? (fadeIn ? 1 : 0) : 1,
                transition: isSnapping
                  ? `background-position 0.2s ease-out, transform 0.3s ease, opacity ${CROSSFADE_MS}ms ease-in-out`
                  : `transform 0.3s ease, opacity ${CROSSFADE_MS}ms ease-in-out`,
              }}
            />
          )}
          {/* Preview overlay for filter style image */}
          {previewImageUrl && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              <img
                src={previewImageUrl}
                alt="Prévia do filtro"
                className="w-full h-full object-cover animate-in fade-in duration-200"
              />
            </div>
          )}
          <div
              ref={containerRef}
              className={`absolute inset-0 z-20 ${image ? 'touch-none' : 'touch-manipulation cursor-pointer'} group/drag ${image ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            {!image && !isProcessing && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
                className="upload-cta-glow upload-cta-pulse absolute inset-x-4 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center justify-center gap-2.5 rounded-[1.6rem] border border-primary/20 bg-card/80 px-4 py-5 text-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.015] hover:border-primary/35 hover:bg-card/88 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 sm:inset-x-5 sm:gap-3 sm:rounded-[2rem] sm:px-6 sm:py-7"
                aria-label="Enviar imagem para começar a personalizar sua capinha"
              >
                <span className="upload-cta-icon flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary shadow-md sm:h-16 sm:w-16">
                  <ImagePlus className="h-6 w-6 sm:h-8 sm:w-8" aria-hidden="true" />
                </span>
                <span className="space-y-0.5 sm:space-y-1">
                  <span className="block text-base font-semibold text-foreground sm:text-xl">
                    Envie sua imagem
                  </span>
                  <span className="block text-[12px] leading-snug text-muted-foreground sm:text-[15px] sm:leading-relaxed">
                    Toque aqui para começar sua capinha
                  </span>
                </span>
              </button>
            )}
            {showSafeZone && (
              <div
                className="pointer-events-none absolute z-10 overflow-hidden border border-foreground bg-foreground/40 box-border"
                aria-hidden="true"
                style={{
                  left: safeZonePreset.width ? (safeZonePreset.insetX ?? "5%") : safeZonePreset.insetX,
                  right: safeZonePreset.width ? "auto" : safeZonePreset.insetX,
                  width: safeZonePreset.width,
                  top: safeZonePreset.top,
                  height: safeZonePreset.height,
                  borderTopLeftRadius: safeZoneRadius,
                  borderTopRightRadius: safeZoneRadius,
                  borderBottomLeftRadius: safeZonePreset.width ? safeZoneRadius : safeZoneBottomRadius,
                  borderBottomRightRadius: safeZonePreset.width ? safeZoneRadius : safeZoneBottomRadius,
                  borderColor: "hsl(var(--foreground))",
                }}
              />
            )}
            {image && !isDragging && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover/drag:opacity-100 transition-opacity">
                <Move className="w-6 h-6 text-white/60 drop-shadow-md" />
              </div>
            )}
          </div>
            {showStatusOverlay && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/65 backdrop-blur-md rounded-[2rem] lg:rounded-[2.4rem] motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200 motion-reduce:animate-none">
                <div className="flex flex-col items-center gap-3 rounded-[1.5rem] border border-border/70 bg-card/90 px-5 py-4 shadow-xl motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-reduce:animate-none">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-background/90 text-primary shadow-sm">
                    {showUploadReady ? (
                      <CheckCircle2 className="h-6 w-6 motion-safe:animate-in motion-safe:zoom-in-75 motion-safe:duration-200 motion-reduce:animate-none" />
                    ) : (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    )}
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-sm font-semibold text-foreground">{showUploadReady ? "Tudo certo" : "Aguarde um instante"}</p>
                    <span className="block text-xs font-medium text-muted-foreground">{statusMessage}</span>
                  </div>
                </div>
            </div>
          )}
        </div>
        {image && (
          <div className="absolute -bottom-2 -right-2 flex items-center gap-1.5 z-30">
            {imageResolution && (() => {
              const isHD = imageResolution.w >= 800 && imageResolution.h >= 1600;
              const isLow = imageResolution.w < 400 || imageResolution.h < 800;
              const canUpscale = !isHD && onUpscaleClick;
              const badge = isLow ? 'Baixa' : isHD ? 'HD' : 'Média';
              const badgeClass = `text-[10px] font-semibold px-1.5 py-0.5 rounded-full shadow ${isLow ? 'bg-destructive text-destructive-foreground' : isHD ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`;
              return canUpscale ? (
                <button onClick={onUpscaleClick} className={`${badgeClass} flex items-center gap-0.5 animate-pulse hover:animate-none cursor-pointer`}>
                  {badge} <Sparkles className="w-2.5 h-2.5" />
                </button>
              ) : (
                <span className={badgeClass}>{badge}</span>
              );
            })()}
            <button
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              className="w-9 h-9 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
              aria-label="Trocar imagem da capinha"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Enviar imagem para personalizar sua capinha"
      />
      <div id="customize-upload-status" className="sr-only" aria-live="polite" aria-atomic="true">
        {showStatusOverlay ? statusMessage : ""}
      </div>
    </div>
  );
};

export default PhonePreview;
