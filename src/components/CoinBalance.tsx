import { Link } from "react-router-dom";
import { useCoins } from "@/hooks/useCoins";
import { useAuth } from "@/hooks/useAuth";

interface CoinBalanceProps {
  transparent?: boolean;
}

const CoinBalance = ({ transparent }: CoinBalanceProps) => {
  const { user } = useAuth();
  const { balance, loading } = useCoins();

  if (!user) return null;

  return (
    <Link
      to="/coins"
      className={`flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-semibold transition-colors ${
        transparent
          ? "text-white/90 hover:bg-white/10"
          : "text-foreground bg-accent hover:bg-accent/80"
      }`}
      title="Minhas moedas"
    >
      <span className="text-sm">🪙</span>
      {loading ? "…" : balance}
    </Link>
  );
};

export default CoinBalance;
