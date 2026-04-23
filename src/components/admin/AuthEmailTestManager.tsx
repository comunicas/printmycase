import { useMemo, useState } from "react";
import { Mail, RefreshCcw, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface EmailLogRow {
  created_at: string;
  error_message: string | null;
  message_id: string | null;
  metadata: Record<string, unknown> | null;
  recipient_email: string;
  status: string;
  template_name: string;
}

const AuthEmailTestManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState(user?.email ?? "");
  const [logs, setLogs] = useState<EmailLogRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [lastTriggeredAt, setLastTriggeredAt] = useState<string | null>(null);

  const canSubmit = useMemo(() => email.trim().length > 0, [email]);

  const loadLogs = async (targetEmail = email) => {
    if (!targetEmail.trim()) return;

    setLoadingLogs(true);
    const { data, error } = await supabase.functions.invoke("admin-auth-email-log", {
      body: { email: targetEmail.trim().toLowerCase() },
    });
    setLoadingLogs(false);

    if (error) {
      toast({ title: "Erro ao consultar logs", description: error.message, variant: "destructive" });
      return;
    }

    setLogs((data?.logs as EmailLogRow[] | undefined) ?? []);
  };

  const handleTrigger = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "Erro ao disparar recovery", description: error.message, variant: "destructive" });
      return;
    }

    const triggeredAt = new Date().toISOString();
    setLastTriggeredAt(triggeredAt);
    toast({ title: "Recovery disparado", description: "Agora você pode atualizar os logs abaixo." });
    await loadLogs(normalizedEmail);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Mail className="h-5 w-5" />
            Teste de recovery em produção
          </CardTitle>
          <CardDescription>
            Dispara um email real de recuperação e consulta os registros do auth-email-hook no email_send_log.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@dominio.com"
            />
            <Button onClick={handleTrigger} disabled={!canSubmit || submitting} className="gap-2">
              <Send className="h-4 w-4" />
              {submitting ? "Enviando…" : "Disparar recovery"}
            </Button>
            <Button variant="outline" onClick={() => void loadLogs()} disabled={!canSubmit || loadingLogs} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              {loadingLogs ? "Atualizando…" : "Atualizar logs"}
            </Button>
          </div>

          <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
            <div><strong className="text-foreground">Último disparo:</strong> {lastTriggeredAt ? new Date(lastTriggeredAt).toLocaleString("pt-BR") : "—"}</div>
            <div><strong className="text-foreground">Destino:</strong> {email.trim() || "—"}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registros recentes do auth email</CardTitle>
          <CardDescription>
            Mostra somente eventos de autenticação para o email informado, incluindo pending, sent e falhas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingLogs ? <LoadingSpinner /> : null}

          {!loadingLogs && logs.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhum registro encontrado para este email.</p>
          ) : null}

          {!loadingLogs && logs.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Message ID</TableHead>
                    <TableHead>Provider ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={`${log.created_at}-${log.message_id ?? log.status}`}>
                      <TableCell className="whitespace-nowrap text-xs">{new Date(log.created_at).toLocaleString("pt-BR")}</TableCell>
                      <TableCell>{log.template_name}</TableCell>
                      <TableCell>{log.status}</TableCell>
                      <TableCell className="max-w-[220px] truncate text-xs">{log.message_id ?? "—"}</TableCell>
                      <TableCell className="max-w-[220px] truncate text-xs">{String(log.metadata?.provider_message_id ?? "—")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator />

              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={`${log.created_at}-detail-${log.message_id ?? log.status}`} className="rounded-md border p-4 text-sm">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span><strong>Status:</strong> {log.status}</span>
                      <span><strong>Template:</strong> {log.template_name}</span>
                      <span><strong>Destinatário:</strong> {log.recipient_email}</span>
                    </div>
                    {log.error_message ? (
                      <p className="mt-2 text-destructive"><strong>Erro:</strong> {log.error_message}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthEmailTestManager;