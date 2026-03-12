import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Upload, X, Image, Send, Wand2, Save, Zap } from "lucide-react";
import { compressForAI } from "@/lib/image-utils";

const QUICK_PROMPTS = [
  { label: "Still Matte", text: "Renderize a case do smartphone aplicando o background no local demarcado. O resultado deve ser um still com fundo 100% branco, garantindo texturas realistas e um material com brilho difuso (matte) inclusive no espaço das cameras." },
  { label: "Fundo Branco RGB", text: "Aplique o background na área indicada da case do smartphone. Finalize a imagem em formato still, com fundo branco puro (RGB 255, 255, 255), textura realista e acabamento de brilho fosco inclusive no espaço das cameras." },
  { label: "Arte Fosca", text: "Aplique a arte na case respeitando a marcação. Finalize como still em fundo branco, com foco em texturas realistas e um toque fosco suave inclusive no espaço das cameras." },
];

const IMAGE_SIZES = [
  { value: "auto", label: "Auto" },
  { value: "square_hd", label: "Square HD" },
  { value: "square", label: "Square" },
  { value: "portrait_4_3", label: "Portrait 4:3" },
  { value: "portrait_16_9", label: "Portrait 16:9" },
  { value: "landscape_4_3", label: "Landscape 4:3" },
  { value: "landscape_16_9", label: "Landscape 16:9" },
];

const STEPS = [
  { label: "Comprimindo imagens...", icon: Image },
  { label: "Enviando referências...", icon: Send },
  { label: "Gerando com IA...", icon: Wand2 },
  { label: "Salvando resultado...", icon: Save },
] as const;

export interface AiSetup {
  prompt: string;
  seed: string;
  imageSize: string;
  safetyTolerance: number;
  outputFormat: "png" | "jpeg";
  imageUrls: string[];
}

interface AiImageGeneratorProps {
  onGenerated: () => void;
  initialSetup?: AiSetup | null;
  onSetupConsumed?: () => void;
}

const AiImageGenerator = ({ onGenerated, initialSetup, onSetupConsumed }: AiImageGeneratorProps) => {
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const [image1, setImage1] = useState<string | null>(null);
  const [image2, setImage2] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [seed, setSeed] = useState("");
  const [imageSize, setImageSize] = useState("auto");
  const [safetyTolerance, setSafetyTolerance] = useState(2);
  const [outputFormat, setOutputFormat] = useState<"png" | "jpeg">("png");
  const [generating, setGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [lastSeed, setLastSeed] = useState<number | null>(null);
  const file1Ref = useRef<HTMLInputElement>(null);
  const file2Ref = useRef<HTMLInputElement>(null);

  // Apply initialSetup when it changes
  useEffect(() => {
    if (!initialSetup) return;
    setPrompt(initialSetup.prompt);
    setSeed(initialSetup.seed);
    setImageSize(initialSetup.imageSize);
    setSafetyTolerance(initialSetup.safetyTolerance);
    setOutputFormat(initialSetup.outputFormat);
    // Load reference image URLs directly (they are public URLs)
    setImage1(initialSetup.imageUrls[0] ?? null);
    setImage2(initialSetup.imageUrls[1] ?? null);
    // Scroll to the form
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    onSetupConsumed?.();
    toast({ title: "Setup carregado! Ajuste e gere novamente." });
  }, [initialSetup]);

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

  /** Check if a string is a remote URL (not a data URL) */
  const isRemoteUrl = (url: string) => url.startsWith("http://") || url.startsWith("https://");

  /** Upload a data-URL to temp-refs and return the public URL. If already a remote URL, return as-is. */
  const uploadToStorage = async (dataUrl: string): Promise<string> => {
    if (isRemoteUrl(dataUrl)) return dataUrl;
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const ext = blob.type.includes("png") ? "png" : "jpg";
    const path = `temp-refs/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("product-assets")
      .upload(path, blob, { contentType: blob.type });
    if (error) throw new Error("Erro ao enviar imagem: " + error.message);
    const { data } = supabase.storage.from("product-assets").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleGenerate = async () => {
    if (!image1 || !prompt.trim()) {
      toast({ title: "Envie ao menos 1 imagem e um prompt", variant: "destructive" });
      return;
    }

    setGenerating(true);
    setStepIndex(0);

    try {
      // Step 0: Compress (skip for remote URLs — already compressed)
      const compressed1 = isRemoteUrl(image1) ? image1 : await compressForAI(image1);
      const compressed2 = image2 ? (isRemoteUrl(image2) ? image2 : await compressForAI(image2)) : null;

      // Step 1: Upload to storage
      setStepIndex(1);
      const url1 = await uploadToStorage(compressed1);
      const url2 = compressed2 ? await uploadToStorage(compressed2) : null;

      // Step 2: Generate
      setStepIndex(2);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const image_urls = [url1];
      if (url2) image_urls.push(url2);

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

      // Step 3: Done
      setStepIndex(3);
      setLastSeed(result.seed ?? null);
      toast({ title: `Imagem gerada!${result.seed ? ` Seed: ${result.seed}` : ""}` });
      setImage1(null);
      setImage2(null);
      setPrompt("");
      setSeed("");
      onGenerated();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      setGenerating(false);
      setStepIndex(0);
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
    <div ref={containerRef} className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Envie até 2 imagens de referência e um prompt. A IA gerará uma nova imagem salva na galeria de gerações.
      </p>

      {/* Reference images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ImageSlot label="Imagem 1" image={image1} setImage={setImage1} fileRef={file1Ref} required />
        <ImageSlot label="Imagem 2" image={image2} setImage={setImage2} fileRef={file2Ref} />
      </div>

      {/* Quick prompts */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Prompts rápidos</label>
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((qp) => (
            <Button
              key={qp.label}
              type="button"
              variant="outline"
              size="sm"
              disabled={generating}
              onClick={() => setPrompt(qp.text)}
              className={prompt === qp.text ? "border-primary bg-primary/10" : ""}
            >
              <Zap className="h-3.5 w-3.5 mr-1" />
              {qp.label}
            </Button>
          ))}
        </div>
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

      {/* Progress stepper */}
      {generating && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const active = i === stepIndex;
            const done = i < stepIndex;
            return (
              <div key={i} className="flex items-center gap-1.5">
                <div className={`rounded-full p-1.5 transition-colors ${active ? "bg-primary text-primary-foreground animate-pulse" : done ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className={`text-xs hidden sm:inline ${active ? "font-semibold text-primary" : done ? "text-primary/70" : "text-muted-foreground"}`}>
                  {step.label}
                </span>
                {i < STEPS.length - 1 && <div className={`w-4 h-px ${done ? "bg-primary/40" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Last seed info */}
      {lastSeed != null && (
        <p className="text-xs text-muted-foreground">
          Último seed: <button type="button" className="font-mono underline" onClick={() => { setSeed(String(lastSeed)); toast({ title: "Seed copiado para o campo" }); }}>{lastSeed}</button>
        </p>
      )}

      <Button onClick={handleGenerate} disabled={generating || !image1 || !prompt.trim()} className="w-full sm:w-auto">
        <Sparkles className="h-4 w-4 mr-2" />
        {generating ? STEPS[stepIndex].label : "Gerar Imagem"}
      </Button>
    </div>
  );
};

export default AiImageGenerator;
