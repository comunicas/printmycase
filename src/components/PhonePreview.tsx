import { useRef, useState, useCallback } from "react";
import { Upload, Camera, Move } from "lucide-react";

interface PhonePreviewProps {
  image: string | null;
  scale: number;
  rotation: number;
  brightness: number;
  contrast: number;
  extraFilter?: string;
  position: { x: number; y: number };
  onPositionChange: (pos: { x: number; y: number }) => void;
  onImageUpload: (file: File) => void;
}

const PhonePreview = ({ image, scale, rotation, brightness, contrast, extraFilter, position, onPositionChange, onImageUpload }: PhonePreviewProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startOffset = useRef({ x: 0, y: 0 });

  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!image) return;
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

    // Convert drag delta to account for rotation
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rotatedDx = dx * cos + dy * sin;
    const rotatedDy = -dx * sin + dy * cos;

    onPositionChange({
      x: clamp(startOffset.current.x - rotatedDx),
      y: clamp(startOffset.current.y - rotatedDy),
    });
  }, [isDragging, onPositionChange, scale, rotation]);

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageUpload(file);
    e.target.value = '';
  };

  const baseFilter = `brightness(${1 + brightness / 100}) contrast(${1 + contrast / 100})`;
  const combinedFilter = extraFilter ? `${baseFilter} ${extraFilter}` : baseFilter;

  // Oversized inner layer to prevent gaps when rotated
  const oversize = 150;
  const offset = -(oversize - 100) / 2;

  const imageLayerStyle = image
    ? {
        backgroundImage: `url(${image})`,
        backgroundSize: `${scale}%`,
        backgroundPosition: `${position.x}% ${position.y}%`,
        backgroundRepeat: "no-repeat" as const,
        transform: `rotate(${rotation}deg)`,
        filter: combinedFilter,
        width: `${oversize}%`,
        height: `${oversize}%`,
        left: `${offset}%`,
        top: `${offset}%`,
      }
    : {};

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-xs font-medium text-muted-foreground">
        iPhone 15 Pro Max
      </div>
      <div className="relative">
        {/* Phone frame - back view */}
        <div className="relative w-[260px] h-[532px] rounded-[2.8rem] border-[5px] border-foreground/80 bg-foreground/5 shadow-2xl overflow-hidden">

          {/* Image layer - oversized to cover rotation gaps */}
          {image && (
            <div
              className="absolute pointer-events-none"
              style={imageLayerStyle}
            />
          )}

          {/* Interaction layer - handles drag and upload */}
          <div
            ref={containerRef}
            className={`absolute inset-0 z-10 touch-none ${image ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            {image && !isDragging && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                <Move className="w-6 h-6 text-white/60 drop-shadow-md" />
              </div>
            )}
            {!image && (
              <button
                onClick={() => inputRef.current?.click()}
                className="flex items-center justify-center h-full w-full hover:bg-primary/5 transition-colors group/upload"
              >
                <div className="text-center space-y-3">
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground/40 group-hover/upload:text-primary/60 transition-colors" />
                  <p className="text-xs text-muted-foreground/50 group-hover/upload:text-primary/60">Toque para adicionar sua imagem</p>
                </div>
              </button>
            )}
          </div>

          {/* Camera module - top left */}
          <div className="absolute top-5 left-5 z-20 pointer-events-none">
            <div className="w-[72px] h-[72px] rounded-2xl border border-foreground/20 bg-foreground/10 backdrop-blur-sm flex flex-wrap items-center justify-center gap-1 p-2">
              <div className="w-[22px] h-[22px] rounded-full border-2 border-foreground/30 bg-foreground/20 shadow-inner" />
              <div className="w-[22px] h-[22px] rounded-full border-2 border-foreground/30 bg-foreground/20 shadow-inner" />
              <div className="w-[22px] h-[22px] rounded-full border-2 border-foreground/30 bg-foreground/20 shadow-inner" />
              <div className="w-[22px] h-[22px] flex items-center justify-center">
                <div className="w-[10px] h-[10px] rounded-full bg-yellow-300/60 border border-yellow-400/40" />
              </div>
            </div>
          </div>

          {/* Apple logo - centered */}
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <span className="text-2xl text-foreground/15 select-none" style={{ fontFamily: 'system-ui' }}></span>
          </div>
        </div>

        {/* Floating change button */}
        {image && (
          <button
            onClick={() => inputRef.current?.click()}
            className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors z-30"
          >
            <Camera className="w-4 h-4" />
          </button>
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
