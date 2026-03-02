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
    const dx = ((e.clientX - startPos.current.x) / rect.width) * 100;
    const dy = ((e.clientY - startPos.current.y) / rect.height) * 100;
    onPositionChange({
      x: clamp(startOffset.current.x - dx),
      y: clamp(startOffset.current.y - dy),
    });
  }, [isDragging, onPositionChange]);

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageUpload(file);
  };

  const baseFilter = `brightness(${1 + brightness / 100}) contrast(${1 + contrast / 100})`;
  const combinedFilter = extraFilter ? `${baseFilter} ${extraFilter}` : baseFilter;

  const imageStyle = image
    ? {
        backgroundImage: `url(${image})`,
        backgroundSize: `${scale}%`,
        backgroundPosition: `${position.x}% ${position.y}%`,
        backgroundRepeat: "no-repeat" as const,
        transform: `rotate(${rotation}deg)`,
        filter: combinedFilter,
      }
    : {};

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-xs font-medium text-muted-foreground">
        iPhone 15 Pro Max
      </div>
      <div className="relative">
        {/* Phone frame */}
        <div className="relative w-[260px] h-[532px] rounded-[2.8rem] border-[5px] border-foreground/80 bg-foreground/5 shadow-2xl overflow-hidden">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[26px] bg-foreground/80 rounded-b-xl z-20" />

          {/* Case area */}
          <div
            ref={containerRef}
            className={`absolute inset-0 overflow-hidden touch-none ${image ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
            style={imageStyle}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            {image && !isDragging && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover-parent-opacity transition-opacity z-10">
                <Move className="w-6 h-6 text-white/60 drop-shadow-md" />
              </div>
            )}
            {!image && (
              <button
                onClick={() => inputRef.current?.click()}
                className="flex items-center justify-center h-full w-full hover:bg-primary/5 transition-colors group"
              >
                <div className="text-center space-y-2">
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                  <p className="text-xs text-muted-foreground/50 group-hover:text-primary/60">Upload image</p>
                </div>
              </button>
            )}
          </div>

          {/* Bottom bar */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[90px] h-[3px] bg-foreground/60 rounded-full z-20" />
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
