import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Upload, X } from "lucide-react";

const IMAGE_SIZES = [
  { value: "auto", label: "Auto" },
  { value: "square_hd", label: "Square HD" },
  { value: "square", label: "Square" },
  { value: "portrait_4_3", label: "Portrait 4:3" },
  { value: "portrait_16_9", label: "Portrait 16:9" },
  { value: "landscape_4_3", label: "Landscape 4:3" },
  { value: "landscape_16_9", label: "Landscape 16:9" },
];

interface AiImageGeneratorProps {
  onGenerated: () => void;
}

const AiImageGenerator = ({ onGenerated }: AiImageGeneratorProps) => {
  const { toast } = useToast();
  const [image1, setImage1] = useState<string | null>(null);
  const [image2, setImage2] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [seed, setSeed] = useState("");
  const [imageSize, setImageSize] = useState("auto");
  const [safetyTolerance, setSafetyTolerance] = useState(2);
  const [outputFormat, setOutputFormat] = useState<"png" | "jpeg">("png");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState("");
  const [lastSeed, setLastSeed] = useState<number | null>(null);
  const file1Ref = useRef<HTMLInputElement>(null);
  const file2Ref = useRef<HTMLInputElement>(null);

  const readFile = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

  const handleFile = async (file: File, setter: (v: string | null) => void) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Selecione uma imagem válida", variant: "destructive" });
      return;
    }
    const dataUrl = await readFile(file);
    setter(dataUrl);
  };

  const handleGenerate = async () => {
    if (!image1 || !prompt.trim()) {
      toast({ title: "Envie ao menos 1 imagem e um prompt", variant: "destructive" });
      return;
    }

    setGenerating(true);
    setProgress("Enviando imagens para IA...");

    try {
      const image_urls = [image1];
      if (image2) image_urls.push(image2);

      setProgress("Gerando imagem com IA...");

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const body: Record<string, unknown> = {
        image_urls,
        prompt: prompt.trim(),
        image_size: imageSize,
        safety_tolerance: safetyTolerance,
        output_format: outputFormat,
      };
      if (seed.trim()) body.seed = Number(seed);

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-gallery-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Erro na geração");

      setLastSeed(result.seed ?? null);
      toast({ title: `Imagem gerada!${result.seed ? ` Seed: ${result.seed}` : ""}` });
      setImage1(null);
      setImage2(null);
      setPrompt("");
      setSeed("");
      onGenerated();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
      setProgress("");
    }
  };

  const ImageSlot = ({
    label,
    image,
    setImage,
    fileRef,
    required,
  }: {
    label: string;
    image: string | null;
    setImage: (v: string | null) => void;
    fileRef: React.RefObject<HTMLInputElement>;
    required?: boolean;
  }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}{required ? "" : " (opcional)"}</label>
      {image ? (
        <div className="relative">
          <img src={image} alt="" className="h-28 w-full rounded-md border object-contain bg-background" />
          <button
            type="button"
            onClick={() => setImage(null)}
            className="absolute top-1 right-1 rounded-full bg-background/80 p-1 text-destructive hover:bg-background"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Button variant="outline" className="w-full h-28" onClick={() => fileRef.current?.click()}>
          <Upload className="h-5 w-5 mr-2" /> Enviar imagem
        </Button>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) handleFile(f, setImage);
        e.target.value = "";
      }} />
    </div>
  );

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Envie até 2 imagens de referência e um prompt. A IA gerará uma nova imagem salva na galeria de gerações.
      </p>

      {/* Reference images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ImageSlot label="Imagem 1" image={image1} setImage={setImage1} fileRef={file1Ref} required />
        <ImageSlot label="Imagem 2" image={image2} setImage={setImage2} fileRef={file2Ref} />
      </div>

      {/* Prompt */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Prompt</label>
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Descreva a imagem que deseja gerar..."
          disabled={generating}
        />
      </div>

      {/* Controls grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Image Size */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Tamanho</label>
          <select
            value={imageSize}
            onChange={(e) => setImageSize(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={generating}
          >
            {IMAGE_SIZES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Seed */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Seed (opcional)</label>
          <Input
            type="number"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="Aleatório"
            disabled={generating}
          />
        </div>

        {/* Safety Tolerance */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Tolerância ({safetyTolerance})</label>
          <Slider
            value={[safetyTolerance]}
            onValueChange={([v]) => setSafetyTolerance(v)}
            min={1}
            max={5}
            step={1}
            disabled={generating}
          />
        </div>

        {/* Output Format */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Formato</label>
          <div className="flex gap-2">
            {(["png", "jpeg"] as const).map((fmt) => (
              <Button
                key={fmt}
                type="button"
                variant={outputFormat === fmt ? "default" : "outline"}
                size="sm"
                onClick={() => setOutputFormat(fmt)}
                disabled={generating}
                className="flex-1"
              >
                {fmt.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Last seed info */}
      {lastSeed != null && (
        <p className="text-xs text-muted-foreground">
          Último seed: <button type="button" className="font-mono underline" onClick={() => { setSeed(String(lastSeed)); toast({ title: "Seed copiado para o campo" }); }}>{lastSeed}</button>
        </p>
      )}

      <Button onClick={handleGenerate} disabled={generating || !image1 || !prompt.trim()} className="w-full sm:w-auto">
        <Sparkles className="h-4 w-4 mr-2" />
        {generating ? progress || "Gerando..." : "Gerar Imagem"}
      </Button>
    </div>
  );
};

export default AiImageGenerator;
