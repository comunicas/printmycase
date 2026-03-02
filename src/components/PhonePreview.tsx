import { useRef } from "react";

interface PhonePreviewProps {
  image: string | null;
  scale: number;
  rotation: number;
  brightness: number;
  contrast: number;
}

const PhonePreview = ({ image, scale, rotation, brightness, contrast }: PhonePreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const imageStyle = image
    ? {
        backgroundImage: `url(${image})`,
        backgroundSize: `${scale}%`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat" as const,
        transform: `rotate(${rotation}deg)`,
        filter: `brightness(${1 + brightness / 100}) contrast(${1 + contrast / 100})`,
      }
    : {};

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm font-medium text-muted-foreground">
        Previewing iPhone 15 Pro Max
      </div>
      <div className="relative">
        {/* Phone frame */}
        <div className="relative w-[280px] h-[572px] rounded-[3rem] border-[6px] border-foreground/80 bg-foreground/5 shadow-2xl overflow-hidden">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-foreground/80 rounded-b-2xl z-20" />
          
          {/* Case area */}
          <div
            ref={containerRef}
            className="absolute inset-0 overflow-hidden"
            style={imageStyle}
          >
            {!image && (
              <div className="flex items-center justify-center h-full text-muted-foreground/50">
                <div className="text-center space-y-2">
                  <svg className="w-12 h-12 mx-auto opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs">Upload an image</p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[100px] h-[4px] bg-foreground/60 rounded-full z-20" />
        </div>
      </div>
    </div>
  );
};

export default PhonePreview;
