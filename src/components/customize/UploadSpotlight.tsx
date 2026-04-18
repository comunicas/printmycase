import { Upload, ImageIcon } from "lucide-react";

interface UploadSpotlightProps {
  open: boolean;
  modelName: string;
  onUploadClick: () => void;
  onGalleryClick: () => void;
}

const UploadSpotlight = ({ open, modelName, onUploadClick, onGalleryClick }: UploadSpotlightProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-300">
      <div className="flex flex-col items-center justify-center gap-5 bg-background w-screen h-[100dvh] rounded-none mx-0 p-6 pb-[max(2rem,env(safe-area-inset-bottom))] border-0 shadow-2xl animate-in zoom-in-95 duration-300 sm:w-full sm:h-auto sm:max-w-sm sm:rounded-2xl sm:mx-4 sm:p-8 sm:pb-8 sm:border sm:border-border sm:justify-start">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <Upload className="w-10 h-10 text-primary" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-foreground">
            Envie a imagem para capa do {modelName}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Envie uma foto sua, do pet, da família… nós transformamos na capa perfeita para o seu {modelName}!
          </p>
        </div>

        <button
          onClick={onUploadClick}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3.5 px-6 rounded-xl text-base hover:bg-primary/90 transition-colors"
        >
          <Upload className="w-5 h-5" />
          Escolher foto
        </button>

        <button
          onClick={onGalleryClick}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ImageIcon className="w-4 h-4" />
          Ou escolha da galeria
        </button>
      </div>
    </div>
  );
};

export default UploadSpotlight;