import { useState } from "react";
import { Info } from "lucide-react";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/stores/cartStore";
import { useToastStore } from "@/stores/toastStore";
import { useAuth } from "@/auth/AuthProvider";
import { ProductDetailModal } from "./ProductDetailModal";

export function ProductCard({ product }: { product: Product }) {
  const { profile } = useAuth();
  const addProduct = useCartStore((state) => state.addProduct);
  const showToast = useToastStore((state) => state.showToast);
  const [detailOpen, setDetailOpen] = useState(false);

  const isStaff = profile?.role === "STAFF" || profile?.role === "ADMIN";
  const outOfStock = product.stock !== null && product.stock <= 0;
  const disabled = !product.isAvailable || outOfStock;

  function handleAdd() {
    addProduct(product);
    showToast(`${product.name} agregado al carrito`);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-ink">{product.name}</h3>
          {product.description && <p className="mt-1 text-sm text-muted">{product.description}</p>}
        </div>
        <span className="whitespace-nowrap font-display text-base font-semibold text-primary">
          {formatCurrency(product.price)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        {disabled ? (
          <span className="text-xs font-medium text-status-cancelled">
            {outOfStock ? "Sin stock" : "No disponible"}
          </span>
        ) : (
          <span className="text-xs text-muted">
            {product.stock !== null ? `${product.stock} disponibles` : "Disponible"}
          </span>
        )}
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setDetailOpen(true)} aria-label="Ver detalle">
            <Info size={16} />
          </Button>
          {!isStaff && (
            <Button variant="secondary" disabled={disabled} onClick={handleAdd}>
              Agregar
            </Button>
          )}
        </div>
      </div>

      <ProductDetailModal
        product={product}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        canOrder={!isStaff}
        onAdd={handleAdd}
      />
    </div>
  );
}
