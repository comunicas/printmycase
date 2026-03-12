import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Upload, X, ChevronDown, ChevronUp } from "lucide-react";

interface AiImageGeneratorProps {
  onGenerated: () => void;
}

const AiImageGenerator = ({ onGenerated }: AiImageGeneratorProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [image1, setImage1] = useState<string | null>(null);
  const [image2, setImage2] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState("");
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

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-gallery-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ image_urls, prompt: prompt.trim() }),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Erro na geração");

      toast({ title: "Imagem gerada e salva na galeria!" });
      setImage1(null);
      setImage2(null);
      setPrompt("");
      onGenerated();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
      setProgress("");
    }
  };

  return (
    <div className="rounded-lg border bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left font-medium"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Gerar Imagem com IA
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="border-t px-4 pb-4 pt-3 space-y-4">
          <p className="text-sm text-muted-foreground">
            Envie até 2 imagens de referência e um prompt. A IA gerará uma nova imagem que será salva na galeria.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Image 1 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Imagem 1 (obrigatória)</label>
              {image1 ? (
                <div className="relative">
                  <img src={image1} alt="Ref 1" className="h-32 w-full rounded-md border object-contain bg-background" />
                  <button
                    type="button"
                    onClick={() => setImage1(null)}
                    className="absolute top-1 right-1 rounded-full bg-background/80 p-1 text-destructive hover:bg-background"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Button variant="outline" className="w-full h-32" onClick={() => file1Ref.current?.click()}>
                  <Upload className="h-5 w-5 mr-2" /> Enviar imagem
                </Button>
              )}
              <input ref={file1Ref} type="file" accept="image/*" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f, setImage1);
                e.target.value = "";
              }} />
            </div>

            {/* Image 2 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Imagem 2 (opcional)</label>
              {image2 ? (
                <div className="relative">
                  <img src={image2} alt="Ref 2" className="h-32 w-full rounded-md border object-contain bg-background" />
                  <button
                    type="button"
                    onClick={() => setImage2(null)}
                    className="absolute top-1 right-1 rounded-full bg-background/80 p-1 text-destructive hover:bg-background"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Button variant="outline" className="w-full h-32" onClick={() => file2Ref.current?.click()}>
                  <Upload className="h-5 w-5 mr-2" /> Enviar imagem
                </Button>
              )}
              <input ref={file2Ref} type="file" accept="image/*" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f, setImage2);
                e.target.value = "";
              }} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt</label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Descreva a imagem que deseja gerar..."
              disabled={generating}
            />
          </div>

          <Button onClick={handleGenerate} disabled={generating || !image1 || !prompt.trim()} className="w-full sm:w-auto">
            <Sparkles className="h-4 w-4 mr-2" />
            {generating ? progress || "Gerando..." : "Gerar Imagem"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AiImageGenerator;
