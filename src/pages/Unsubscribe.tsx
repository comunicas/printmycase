import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/ui/loading-spinner";

type UnsubState = "loading" | "valid" | "already" | "invalid" | "confirming" | "done" | "error";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<UnsubState>("loading");

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }

    const validate = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(
          `${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`,
          { headers: { apikey: anonKey } }
        );
        const data = await res.json();

        if (!res.ok) {
          setState("invalid");
        } else if (data.valid === false && data.reason === "already_unsubscribed") {
          setState("already");
        } else if (data.valid) {
          setState("valid");
        } else {
          setState("invalid");
        }
      } catch {
        setState("invalid");
      }
    };

    validate();
  }, [token]);

  const handleConfirm = async () => {
    setState("confirming");
    try {
      const { error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      setState("done");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <img
          src="https://iqnqpwnbdqzvqssxcxgb.supabase.co/storage/v1/object/public/email-assets/logo-printmycase.png"
          alt="PrintMyCase"
          className="h-10 mx-auto"
        />

        {state === "loading" && <LoadingSpinner />}

        {state === "valid" && (
          <>
            <h1 className="text-xl font-semibold text-foreground">
              Cancelar inscrição
            </h1>
            <p className="text-muted-foreground text-sm">
              Você não receberá mais emails transacionais da PrintMyCase.
            </p>
            <button
              onClick={handleConfirm}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-[var(--radius)] font-semibold text-sm hover:opacity-90 transition"
            >
              Confirmar Cancelamento
            </button>
          </>
        )}

        {state === "confirming" && (
          <>
            <LoadingSpinner />
            <p className="text-muted-foreground text-sm">Processando...</p>
          </>
        )}

        {state === "done" && (
          <>
            <h1 className="text-xl font-semibold text-foreground">
              Inscrição cancelada
            </h1>
            <p className="text-muted-foreground text-sm">
              Você foi removido da nossa lista de emails. Não receberá mais
              notificações por email.
            </p>
          </>
        )}

        {state === "already" && (
          <>
            <h1 className="text-xl font-semibold text-foreground">
              Já cancelado
            </h1>
            <p className="text-muted-foreground text-sm">
              Sua inscrição já foi cancelada anteriormente.
            </p>
          </>
        )}

        {state === "invalid" && (
          <>
            <h1 className="text-xl font-semibold text-foreground">
              Link inválido
            </h1>
            <p className="text-muted-foreground text-sm">
              Este link de cancelamento é inválido ou expirou.
            </p>
          </>
        )}

        {state === "error" && (
          <>
            <h1 className="text-xl font-semibold text-foreground">
              Erro
            </h1>
            <p className="text-muted-foreground text-sm">
              Ocorreu um erro ao processar seu cancelamento. Tente novamente mais tarde.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
