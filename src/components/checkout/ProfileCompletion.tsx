import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import FormField from "@/components/ui/form-field";
import SubmitButton from "@/components/forms/SubmitButton";
import { maskPhone } from "@/lib/masks";
import { useToast } from "@/hooks/use-toast";

interface ProfileCompletionProps {
  userId: string;
  currentName: string | null;
  onComplete: () => void;
}

export function ProfileCompletion({ userId, currentName, onComplete }: ProfileCompletionProps) {
  const [name, setName] = useState(currentName || "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentName && currentName.trim().length > 1) {
      setName(currentName);
    }
  }, [currentName]);

  const { toast } = useToast();

  if (currentName && currentName.trim().length > 1) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name, phone: phone.replace(/\D/g, "") || null })
      .eq("id", userId);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      onComplete();
    }
    setLoading(false);
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">Só mais um detalhe 👋</p>
        <p className="text-xs text-muted-foreground">
          Precisamos do seu nome para o pedido e WhatsApp para atualizações de entrega.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <FormField label="Nome completo" id="profile-name" required>
          <Input
            id="profile-name"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </FormField>
        <FormField label="WhatsApp (opcional)" id="profile-phone">
          <Input
            id="profile-phone"
            type="tel"
            placeholder="(11) 91234-5678"
            value={phone}
            onChange={(e) => setPhone(maskPhone(e.target.value))}
            autoComplete="tel"
            maxLength={15}
          />
        </FormField>
        <SubmitButton loading={loading} className="w-full">
          Salvar e continuar
        </SubmitButton>
      </form>
    </div>
  );
}
