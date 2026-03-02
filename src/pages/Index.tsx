import { useState } from "react";
import { ArrowLeft, HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PhonePreview from "@/components/PhonePreview";
import ControlPanel from "@/components/ControlPanel";
import sampleCase from "@/assets/sample-case.jpg";

const Index = () => {
  const [image, setImage] = useState<string | null>(sampleCase);
  const [scale, setScale] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Case Studio</h1>
        </div>
        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
          <HelpCircle className="w-5 h-5 text-muted-foreground" />
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 p-6 lg:p-12">
        {/* Phone preview */}
        <div className="flex-shrink-0">
          <PhonePreview
            image={image}
            scale={scale}
            rotation={rotation}
            brightness={brightness}
            contrast={contrast}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center lg:items-start gap-8">
          <ControlPanel
            scale={scale}
            rotation={rotation}
            brightness={brightness}
            contrast={contrast}
            onScaleChange={setScale}
            onRotationChange={setRotation}
            onBrightnessChange={setBrightness}
            onContrastChange={setContrast}
            onImageUpload={handleImageUpload}
            hasImage={!!image}
          />

          {/* Action buttons */}
          <div className="flex gap-3 w-full max-w-xs">
            <Button variant="outline" className="flex-1">
              Save Draft
            </Button>
            <Button className="flex-1 gap-1.5">
              Checkout
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
