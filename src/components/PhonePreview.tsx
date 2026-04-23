import { useRef, useState, useCallback, useEffect } from "react";
import { Camera, Move, Loader2, Sparkles, Eye, EyeOff } from "lucide-react";

interface PhonePreviewProps {
  image: string | null;
  scale: number;
  position: { x: number; y: number };
  rotation?: number;
  onPositionChange: (pos: { x: number; y: number }) => void;
  onScaleChange?: (scale: number) => void;
  onImageUpload: (file: File) => void;
  
  imageResolution?: { w: number; h: number } | null;
  isProcessing?: boolean;
  processingMessage?: string;
  onUpscaleClick?: () => void;
  previewImageUrl?: string | null;
  onGalleryClick?: () => void;
  disabled?: boolean;
}

const CROSSFADE_MS = 200;

const PhonePreview = ({ image, scale, position, rotation = 0, onPositionChange, onScaleChange, onImageUpload, imageResolution, isProcessing, processingMessage, onUpscaleClick, previewImageUrl, onGalleryClick, disabled }: PhonePreviewProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startOffset = useRef({ x: 0, y: 0 });

  // Crossfade state
  const [displayImage, setDisplayImage] = useState<string | null>(image);
  const [prevImage, setPrevImage] = useState<string | null>(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [showSafeAreaOverlay, setShowSafeAreaOverlay] = useState(true);

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
        <div className="relative h-[min(410px,50dvh)] aspect-[260/532] lg:h-[70vh] lg:w-auto lg:aspect-[260/532] rounded-[2.2rem] lg:rounded-[2.8rem] border-[4px] lg:border-[5px] border-foreground/80 bg-foreground/5 shadow-2xl overflow-hidden">
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
            className={`absolute inset-0 z-10 ${image ? 'touch-none' : 'touch-manipulation'} group/drag ${image ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            {showSafeAreaOverlay && (
              <>
                <div className="pointer-events-none absolute left-[10%] right-[10%] top-[3%] h-[20%] rounded-b-[2rem] bg-gradient-to-b from-foreground/40 via-foreground/18 to-transparent" />
              </>
            )}
            {image && !isDragging && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover/drag:opacity-100 transition-opacity">
                <Move className="w-6 h-6 text-white/60 drop-shadow-md" />
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowSafeAreaOverlay((current) => !current)}
              className="absolute bottom-3 left-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-background/85 text-foreground shadow-lg transition-colors hover:bg-background"
              aria-label={showSafeAreaOverlay ? "Ocultar área segura da câmera" : "Mostrar área segura da câmera"}
              title={showSafeAreaOverlay ? "Ocultar área segura da câmera" : "Mostrar área segura da câmera"}
            >
              {showSafeAreaOverlay ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {isProcessing && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-[2rem] lg:rounded-[2.4rem]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-xs font-medium text-muted-foreground mt-2">{processingMessage || "Processando..."}</span>
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
              className="w-9 h-9 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
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
      />
    </div>
  );
};

export default PhonePreview;
