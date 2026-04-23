import { useEffect, useMemo, useState } from "react";
import { LifeBuoy, MailCheck } from "lucide-react";
import SubmitButton from "@/components/forms/SubmitButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FormField from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CustomizeContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormErrors = {
  name?: string;
  email?: string;
  message?: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialValues = {
  name: "",
  email: "",
  message: "",
  website: "",
};

const CustomizeContactDialog = ({ open, onOpenChange }: CustomizeContactDialogProps) => {
  const [name, setName] = useState(initialValues.name);
  const [email, setEmail] = useState(initialValues.email);
  const [message, setMessage] = useState(initialValues.message);
  const [website, setWebsite] = useState(initialValues.website);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const { toast } = useToast();

  const trimmedValues = useMemo(
    () => ({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    }),
    [name, email, message]
  );

  useEffect(() => {
    if (!open) {
      setName(initialValues.name);
      setEmail(initialValues.email);
      setMessage(initialValues.message);
      setWebsite(initialValues.website);
      setLoading(false);
      setSent(false);
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!trimmedValues.name) nextErrors.name = "Informe seu nome.";
    else if (trimmedValues.name.length > 100) nextErrors.name = "Use até 100 caracteres.";

    if (!trimmedValues.email) nextErrors.email = "Informe seu email.";
    else if (!emailRegex.test(trimmedValues.email)) nextErrors.email = "Digite um email válido.";
    else if (trimmedValues.email.length > 255) nextErrors.email = "Use até 255 caracteres.";

    if (!trimmedValues.message) nextErrors.message = "Escreva sua mensagem.";
    else if (trimmedValues.message.length > 1000) nextErrors.message = "Use até 1000 caracteres.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (website) {
      setSent(true);
      return;
    }

    if (!validate()) return;

    setLoading(true);
    const { error } = await supabase.functions.invoke("submit-contact", {
      body: {
        name: trimmedValues.name,
        email: trimmedValues.email,
        message: trimmedValues.message,
        website,
      },
    });
    setLoading(false);

    if (error) {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente em instantes.",
        variant: "destructive",
      });
      return;
    }

    setSent(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="inset-0 flex h-[100dvh] w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:left-0 sm:top-0 sm:h-[100dvh] sm:max-h-none sm:max-w-none sm:translate-x-0 sm:translate-y-0 sm:rounded-none sm:border-0">
        <DialogHeader className="shrink-0 border-b bg-background/95 px-5 pb-4 pt-5 text-left backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-8 sm:pb-5 sm:pt-6 lg:px-10">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-2">
            <DialogTitle className="flex items-center gap-2.5 pr-12 text-base sm:text-lg">
              <LifeBuoy className="h-4.5 w-4.5 shrink-0 text-primary sm:h-5 sm:w-5" />
              Falar com suporte
            </DialogTitle>
            <DialogDescription className="max-w-xl text-sm leading-relaxed">
              Envie sua dúvida sem sair da customização.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-2xl flex-col px-5 py-5 sm:px-8 sm:py-7 lg:px-10 lg:py-8">
            {sent ? (
              <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 py-10 text-center sm:py-16">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MailCheck className="h-6 w-6" />
                </span>
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-foreground">Mensagem enviada</h2>
                  <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                    Recebemos seu contato e vamos responder em breve.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 pb-6 sm:space-y-5 sm:pb-8">
                <FormField label="Nome" id="customize-contact-name" required error={errors.name}>
                  <Input
                    id="customize-contact-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={100}
                    required
                  />
                </FormField>

                <FormField label="Email" id="customize-contact-email" required error={errors.email}>
                  <Input
                    id="customize-contact-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    maxLength={255}
                    required
                  />
                </FormField>

                <FormField label="Mensagem" id="customize-contact-message" required error={errors.message}>
                  <textarea
                    id="customize-contact-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    maxLength={1000}
                    required
                    rows={5}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                </FormField>

                <div className="absolute h-0 overflow-hidden opacity-0 pointer-events-none" aria-hidden="true">
                  <label htmlFor="customize-contact-website">Website</label>
                  <input
                    id="customize-contact-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                  />
                </div>
              </form>
            )}
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t bg-background/95 px-5 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-8 sm:py-5 lg:px-10">
          <div className="mx-auto flex w-full max-w-2xl flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {sent ? (
              <Button className="w-full sm:min-w-40 sm:w-auto" onClick={() => onOpenChange(false)}>
                Voltar à customização
              </Button>
            ) : (
              <>
                <Button className="w-full sm:min-w-32 sm:w-auto" variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <SubmitButton
                  className="w-full sm:min-w-40 sm:w-auto"
                  loading={loading}
                  onClick={(event) => {
                    const form = (event.currentTarget as HTMLButtonElement).form;
                    form?.requestSubmit();
                  }}
                >
                  Enviar
                </SubmitButton>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomizeContactDialog;