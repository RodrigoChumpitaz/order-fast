import { Link, NavLink, Outlet, useSearchParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { useCartStore, cartItemCount } from "@/stores/cartStore";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ToastContainer } from "@/components/ui/ToastContainer";

const NAV_LINK_CLASS = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${isActive ? "text-primary" : "text-muted hover:text-ink"}`;

export function AppShell() {
  const { session, profile, signOut } = useAuth();
  const lines = useCartStore((state) => state.lines);
  const [searchParams] = useSearchParams();
  const mesa = searchParams.get("mesa");
  const count = cartItemCount(lines);

  const isStaff = profile?.role === "STAFF" || profile?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to={mesa ? `/carta?mesa=${mesa}` : "/carta"} className="font-display text-xl font-bold text-ink">
            OrderFast
          </Link>
          <nav className="flex items-center gap-5">
            <NavLink to={mesa ? `/carta?mesa=${mesa}` : "/carta"} className={NAV_LINK_CLASS}>
              Carta
            </NavLink>
            {isStaff && (
              <>
                <NavLink to="/staff/pedidos" className={NAV_LINK_CLASS}>
                  Pedidos
                </NavLink>
                <NavLink to="/staff/nuevo-pedido" className={NAV_LINK_CLASS}>
                  Nuevo pedido
                </NavLink>
              </>
            )}
            {profile?.role === "ADMIN" && (
              <>
                <NavLink to="/admin/productos" className={NAV_LINK_CLASS}>
                  Productos
                </NavLink>
                <NavLink to="/admin/categorias" className={NAV_LINK_CLASS}>
                  Categorías
                </NavLink>
                <NavLink to="/admin/mesas" className={NAV_LINK_CLASS}>
                  Mesas
                </NavLink>
              </>
            )}
            {!isStaff && (
              <NavLink to={mesa ? `/carrito?mesa=${mesa}` : "/carrito"} className={NAV_LINK_CLASS}>
                Carrito{count > 0 ? ` (${count})` : ""}
              </NavLink>
            )}
            {session ? (
              <Button variant="secondary" onClick={signOut}>
                Salir
              </Button>
            ) : (
              <Link to="/login">
                <Button variant="secondary">Ingresar</Button>
              </Link>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}
