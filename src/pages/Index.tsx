import { useState } from "react";
import { ArrowLeft, HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PhonePreview from "@/components/PhonePreview";
import ControlPanel from "@/components/ControlPanel";
import FilterPresets, { filters } from "@/components/FilterPresets";
import sampleCase from "@/assets/sample-case.jpg";

const Index = () => {
  const [image, setImage] = useState<string | null>(sampleCase);
  const [scale, setScale] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Get extra CSS filter from active preset
  const activeFilterObj = filters.find((f) => f.id === activeFilter);
  const extraFilter = activeFilterObj?.cssFilter ?? undefined;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b bg-card">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base font-semibold text-foreground">Case Studio</h1>
        </div>
        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
          <HelpCircle className="w-5 h-5 text-muted-foreground" />
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 p-5 lg:p-10">
        {/* Phone preview */}
        <div className="flex-shrink-0">
          <PhonePreview
            image={image}
            scale={scale}
            rotation={rotation}
            brightness={brightness}
            contrast={contrast}
            extraFilter={extraFilter}
            position={position}
            onPositionChange={setPosition}
            onImageUpload={handleImageUpload}
          />
        </div>

        {/* Right panel */}
        <div className="w-full max-w-sm space-y-6">
          <Tabs defaultValue="adjust" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="adjust" className="flex-1">Adjustments</TabsTrigger>
              <TabsTrigger value="filters" className="flex-1">Filters</TabsTrigger>
            </TabsList>
            <TabsContent value="adjust">
              <ControlPanel
                scale={scale}
                rotation={rotation}
                brightness={brightness}
                contrast={contrast}
                onScaleChange={setScale}
                onRotationChange={setRotation}
                onBrightnessChange={setBrightness}
                onContrastChange={setContrast}
              />
            </TabsContent>
            <TabsContent value="filters">
              <FilterPresets
                image={image}
                activeFilter={activeFilter}
                onSelectFilter={setActiveFilter}
              />
            </TabsContent>
          </Tabs>

          {/* Action buttons */}
          <div className="flex gap-3">
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
