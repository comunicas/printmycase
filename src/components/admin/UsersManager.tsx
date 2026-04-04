import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Search, Users, Coins, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import UserDetailDialog from "@/components/admin/UserDetailDialog";

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

type SortKey = "created_at" | "full_name" | "coin_balance" | "order_count";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

const UsersManager = () => {
  const [users, setUsers] = useState<MergedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedUser, setSelectedUser] = useState<MergedUser | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.functions.invoke("admin-list-users");
      if (authError) throw authError;
      const authUsers: AuthUser[] = authData?.users || [];

      const { data: profiles } = await supabase.from("profiles").select("id, full_name, phone, avatar_url, created_at");

      const { data: transactions } = await supabase
        .from("coin_transactions")
        .select("user_id, amount, expires_at");

      const { data: orders } = await supabase
        .from("orders")
        .select("user_id")
        .neq("status", "pending");

      const profileMap = new Map<string, Profile>();
      (profiles || []).forEach((p) => profileMap.set(p.id, p));

      const now = new Date();
      const balanceMap = new Map<string, number>();
      (transactions || []).forEach((t) => {
        const prev = balanceMap.get(t.user_id) || 0;
        const expires = new Date(t.expires_at);
        if (expires > now || t.amount < 0) {
          balanceMap.set(t.user_id, prev + t.amount);
        }
      });

      const orderCountMap = new Map<string, number>();
      (orders || []).forEach((o) => {
        orderCountMap.set(o.user_id, (orderCountMap.get(o.user_id) || 0) + 1);
      });

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

      setUsers(merged);
    } catch (err: any) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = users;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.full_name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.includes(q))
      );
    }

    // Date range filter
    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter((u) => new Date(u.created_at) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo + "T23:59:59");
      result = result.filter((u) => new Date(u.created_at) <= to);
    }

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "full_name") {
        cmp = a.full_name.localeCompare(b.full_name);
      } else if (sortKey === "coin_balance") {
        cmp = a.coin_balance - b.coin_balance;
      } else if (sortKey === "order_count") {
        cmp = a.order_count - b.order_count;
      } else {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [users, search, dateFrom, dateTo, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(
    () => filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [filtered, page]
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [search, dateFrom, dateTo, sortKey, sortDir]);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const renderSortIcon = (col: SortKey) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3.5 h-3.5 ml-1 inline opacity-40" />;
    return sortDir === "asc"
      ? <ArrowUp className="w-3.5 h-3.5 ml-1 inline text-primary" />
      : <ArrowDown className="w-3.5 h-3.5 ml-1 inline text-primary" />;
  };

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

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou telefone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-end gap-2">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">De</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-10 px-3 rounded-md border bg-background text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Até</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-10 px-3 rounded-md border bg-background text-sm"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); }}
              className="h-10 px-3 text-xs text-muted-foreground hover:text-foreground"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Carregando usuários…</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort("full_name")}>
                  Nome {renderSortIcon("full_name")}
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort("created_at")}>
                  Cadastro {renderSortIcon("created_at")}
                </TableHead>
                <TableHead className="text-right cursor-pointer select-none" onClick={() => handleSort("coin_balance")}>
                  Coins {renderSortIcon("coin_balance")}
                </TableHead>
                <TableHead className="text-right cursor-pointer select-none" onClick={() => handleSort("order_count")}>
                  Pedidos {renderSortIcon("order_count")}
                </TableHead>
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
                  <TableRow
                    key={u.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedUser(u)}
                  >
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
                      <span className="inline-flex items-center gap-1 text-sm">🪙 {u.coin_balance}</span>
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

      {/* User Detail Dialog */}
      <UserDetailDialog
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
      />
    </div>
  );
};

export default UsersManager;
