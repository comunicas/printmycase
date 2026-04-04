import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Search, Users, Coins } from "lucide-react";
import Pagination from "@/components/admin/Pagination";

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface MergedUser {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  coin_balance: number;
  order_count: number;
}

const PAGE_SIZE = 10;

const UsersManager = () => {
  const [users, setUsers] = useState<MergedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // 1. Fetch auth users via edge function
      const { data: authData, error: authError } = await supabase.functions.invoke("admin-list-users");
      if (authError) throw authError;
      const authUsers: AuthUser[] = authData?.users || [];

      // 2. Fetch profiles
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, phone, avatar_url, created_at");

      // 3. Fetch coin balances from coin_transactions
      const { data: transactions } = await supabase
        .from("coin_transactions")
        .select("user_id, amount, expires_at");

      // 4. Fetch order counts
      const { data: orders } = await supabase
        .from("orders")
        .select("user_id")
        .neq("status", "pending");

      // Build lookup maps
      const profileMap = new Map<string, Profile>();
      (profiles || []).forEach((p) => profileMap.set(p.id, p));

      // Calculate balances (same logic as get_coin_balance)
      const now = new Date();
      const balanceMap = new Map<string, number>();
      (transactions || []).forEach((t) => {
        const prev = balanceMap.get(t.user_id) || 0;
        const expires = new Date(t.expires_at);
        if (expires > now || t.amount < 0) {
          balanceMap.set(t.user_id, prev + t.amount);
        }
      });

      // Count orders per user
      const orderCountMap = new Map<string, number>();
      (orders || []).forEach((o) => {
        orderCountMap.set(o.user_id, (orderCountMap.get(o.user_id) || 0) + 1);
      });

      // Merge
      const merged: MergedUser[] = authUsers.map((au) => {
        const profile = profileMap.get(au.id);
        return {
          id: au.id,
          email: au.email,
          full_name: profile?.full_name || "",
          phone: profile?.phone || null,
          avatar_url: profile?.avatar_url || null,
          created_at: profile?.created_at || au.created_at,
          coin_balance: balanceMap.get(au.id) || 0,
          order_count: orderCountMap.get(au.id) || 0,
        };
      });

      // Sort by created_at desc
      merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setUsers(merged);
    } catch (err: any) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q))
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(
    () => filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [filtered, page]
  );

  // Reset page when search changes
  useEffect(() => {
    setPage(0);
  }, [search]);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4 flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <div>
            <p className="text-2xl font-bold">{users.length}</p>
            <p className="text-xs text-muted-foreground">Usuários cadastrados</p>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4 flex items-center gap-3">
          <Coins className="w-8 h-8 text-amber-500" />
          <div>
            <p className="text-2xl font-bold">
              {users.reduce((s, u) => s + Math.max(0, u.coin_balance), 0)}
            </p>
            <p className="text-xs text-muted-foreground">Coins ativos (total)</p>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4 flex items-center gap-3">
          <Users className="w-8 h-8 text-green-500" />
          <div>
            <p className="text-2xl font-bold">
              {users.filter((u) => u.order_count > 0).length}
            </p>
            <p className="text-xs text-muted-foreground">Usuários com pedidos</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, email ou telefone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Carregando usuários…</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="text-right">Coins</TableHead>
                <TableHead className="text-right">Pedidos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {u.full_name?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                        {u.full_name || "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{u.email || "—"}</TableCell>
                    <TableCell className="text-sm">{u.phone || "—"}</TableCell>
                    <TableCell className="text-sm">{fmtDate(u.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-1 text-sm">
                        🪙 {u.coin_balance}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm">{u.order_count}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={filtered.length}
          />
        </>
      )}
    </div>
  );
};

export default UsersManager;
