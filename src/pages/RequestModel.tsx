import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Smartphone, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/AppHeader";
import FormCard from "@/components/forms/FormCard";
import FormField from "@/components/ui/form-field";
import SubmitButton from "@/components/forms/SubmitButton";
import { Input } from "@/components/ui/input";
import { maskPhone } from "@/lib/masks";
import SeoHead from "@/components/SeoHead";

const RequestModel = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [modelName, setModelName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; modelName?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) e.phone = "Informe um telefone válido com DDD.";
    if (modelName.trim().length < 2) e.modelName = "Informe o modelo desejado.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await supabase.from("model_requests").insert({
      phone: phone.replace(/\D/g, ""),
      model_name: modelName.trim(),
    });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao enviar", description: "Tente novamente mais tarde.", variant: "destructive" });
      return;
    }
    setSubmitted(true);
  };

  return (
    <>
      <SeoHead />
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader breadcrumbs={[{ label: "Solicitar Modelo" }]} />
        <main className="flex-1 flex items-center justify-center px-5 py-12">
          {submitted ? (
            <div className="max-w-md w-full text-center space-y-5 animate-fade-in" style={{ animationFillMode: "forwards" }}>
              <CheckCircle className="w-16 h-16 text-primary mx-auto" />
              <h1 className="text-2xl font-bold text-foreground">Solicitação Enviada!</h1>
              <p className="text-muted-foreground">
                Recebemos seu pedido. Entraremos em contato quando o modelo estiver disponível.
              </p>
              <SubmitButton onClick={() => navigate("/")} className="mt-4">
                Voltar ao Início
              </SubmitButton>
            </div>
          ) : (
            <FormCard
              title="Solicitar Modelo"
              description="Não encontrou seu celular? Deixe seu contato e o modelo desejado que avisaremos quando estiver disponível."
              className="max-w-md w-full"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField label="Telefone (WhatsApp)" id="phone" required error={errors.phone}>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(maskPhone(e.target.value))}
                    maxLength={15}
                  />
                </FormField>
                <FormField label="Modelo do Celular" id="model" required error={errors.modelName}>
                  <Input
                    id="model"
                    placeholder="Ex: iPhone 16 Pro Max"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value.slice(0, 100))}
                    maxLength={100}
                  />
                </FormField>
                <SubmitButton loading={loading} className="w-full">
                  Enviar Solicitação
                </SubmitButton>
              </form>
            </FormCard>
          )}
        </main>
      </div>
    </>
  );
};

export default RequestModel;
