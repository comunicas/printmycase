import { useRef, useState, useCallback, useEffect } from "react";
import { Camera, Move, Loader2, ImagePlus } from "lucide-react";

interface PhonePreviewProps {
  image: string | null;
  scale: number;
  position: { x: number; y: number };
  rotation?: number;
  onPositionChange: (pos: { x: number; y: number }) => void;
  onScaleChange?: (scale: number) => void;
  onImageUpload: (file: File) => void;
  modelName?: string;
  imageResolution?: { w: number; h: number } | null;
  isProcessing?: boolean;
}

const PhonePreview = ({ image, scale, position, rotation = 0, onPositionChange, onScaleChange, onImageUpload, imageResolution, isProcessing }: PhonePreviewProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startOffset = useRef({ x: 0, y: 0 });

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
      x: clamp(startOffset.current.x - dx),
      y: clamp(startOffset.current.y - dy),
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
          x: clamp(startOffset.current.x - dx),
          y: clamp(startOffset.current.y - dy),
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

  const imageLayerStyle = image
    ? {
        backgroundImage: `url(${image})`,
        backgroundSize: `${scale * (100 / oversize)}%`,
        backgroundPosition: `${position.x}% ${position.y}%`,
        backgroundRepeat: "no-repeat" as const,
        width: `${oversize}%`,
        height: `${oversize}%`,
        left: `${offset}%`,
        top: `${offset}%`,
      }
    : {};

  return (
    <div className="flex flex-col items-center gap-2 lg:gap-3">
      <div className="relative">
        <div className="relative w-[220px] h-[450px] lg:w-[260px] lg:h-[532px] rounded-[2.4rem] lg:rounded-[2.8rem] border-[4px] lg:border-[5px] border-foreground/80 bg-foreground/5 shadow-2xl overflow-hidden">
          {image && (
          <div
              className="absolute pointer-events-none"
              style={{
                ...imageLayerStyle,
                transform: `rotate(${rotation}deg)`,
                transition: isSnapping
                  ? 'background-position 0.2s ease-out, transform 0.3s ease'
                  : 'transform 0.3s ease',
              }}
            />
          )}
          <div
            ref={containerRef}
            className={`absolute inset-0 z-10 ${image ? 'touch-none' : 'touch-manipulation'} group/drag ${image ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            {image && !isDragging && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover/drag:opacity-100 transition-opacity">
                <Move className="w-6 h-6 text-white/60 drop-shadow-md" />
              </div>
            )}
            {!image && (
              <button
                onClick={() => inputRef.current?.click()}
                className="flex items-center justify-center h-full w-full hover:bg-primary/5 transition-colors group/upload"
              >
                <div className="text-center space-y-3 px-6">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center group-hover/upload:bg-primary/20 transition-colors">
                    <ImagePlus className="w-7 h-7 lg:w-8 lg:h-8 text-primary/60 group-hover/upload:text-primary transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground group-hover/upload:text-primary/80 transition-colors">
                      Envie sua foto
                    </p>
                    <p className="text-[10px] text-muted-foreground/40">
                      827×1772px recomendado
                    </p>
                  </div>
                </div>
              </button>
            )}
          </div>
          {/* Camera module overlay */}
          <div className="absolute top-4 left-4 lg:top-5 lg:left-5 z-20 pointer-events-none">
            <div className="w-[60px] h-[60px] lg:w-[72px] lg:h-[72px] rounded-2xl border border-foreground/20 bg-foreground/10 backdrop-blur-sm flex flex-wrap items-center justify-center gap-1 p-1.5 lg:p-2">
              <div className="w-[18px] h-[18px] lg:w-[22px] lg:h-[22px] rounded-full border-2 border-foreground/30 bg-foreground/20 shadow-inner" />
              <div className="w-[18px] h-[18px] lg:w-[22px] lg:h-[22px] rounded-full border-2 border-foreground/30 bg-foreground/20 shadow-inner" />
              <div className="w-[18px] h-[18px] lg:w-[22px] lg:h-[22px] rounded-full border-2 border-foreground/30 bg-foreground/20 shadow-inner" />
              <div className="w-[18px] h-[18px] lg:w-[22px] lg:h-[22px] flex items-center justify-center">
                <div className="w-[8px] h-[8px] lg:w-[10px] lg:h-[10px] rounded-full bg-yellow-300/60 border border-yellow-400/40" />
              </div>
            </div>
          </div>
          {isProcessing && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-[2rem] lg:rounded-[2.4rem]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-xs font-medium text-muted-foreground mt-2">Processando...</span>
            </div>
          )}
        </div>
        {image && (
          <div className="absolute -bottom-2 -right-2 flex items-center gap-1.5 z-30">
            {imageResolution && (() => {
              const isHD = imageResolution.w >= 800 && imageResolution.h >= 1600;
              const isLow = imageResolution.w < 400 || imageResolution.h < 800;
              return (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shadow ${isLow ? 'bg-destructive text-destructive-foreground' : isHD ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {isLow ? 'Baixa' : isHD ? 'HD' : 'Média'}
                </span>
              );
            })()}
            <button
              onClick={() => inputRef.current?.click()}
              className="w-9 h-9 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
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
