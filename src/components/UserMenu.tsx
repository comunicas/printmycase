import { useNavigate } from "react-router-dom";
import { LogOut, User, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

const UserMenu = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
        Entrar
      </Button>
    );
  }

  const displayName = profile?.full_name || user.email?.split("@")[0] || "Usuário";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {initials}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/profile")}>
          <User className="mr-2 h-4 w-4" />
          Meu Perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/orders")}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          Meus Pedidos
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
