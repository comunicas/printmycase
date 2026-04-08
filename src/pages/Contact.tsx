import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import FormCard from "@/components/forms/FormCard";
import FormField from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import SubmitButton from "@/components/forms/SubmitButton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SeoHead from "@/components/SeoHead";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });
    setLoading(false);

    if (error) {
      toast({ title: "Erro ao enviar mensagem", description: "Tente novamente mais tarde.", variant: "destructive" });
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <>
        <SeoHead title="Contato — PrintMyCase" description="Entre em contato com a PrintMyCase." />
        <AppHeader />
        <main className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center space-y-4 max-w-md">
            <h1 className="text-2xl font-bold text-foreground">Mensagem enviada!</h1>
            <p className="text-muted-foreground">Obrigado pelo contato. Responderemos o mais breve possível.</p>
            <button onClick={() => navigate("/")} className="text-primary hover:underline text-sm">
              Voltar ao início
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SeoHead title="Contato — PrintMyCase" description="Envie uma mensagem para a PrintMyCase." />
      <AppHeader />
      <main className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <FormCard title="Fale Conosco" description="Preencha o formulário abaixo e retornaremos em breve." className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Nome" id="name" required>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required />
            </FormField>
            <FormField label="Email" id="email" required>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} required />
            </FormField>
            <FormField label="Mensagem" id="message" required>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1000}
                required
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </FormField>
            <SubmitButton loading={loading} className="w-full">Enviar</SubmitButton>
          </form>
        </FormCard>
      </main>
    </>
  );
};

export default Contact;
