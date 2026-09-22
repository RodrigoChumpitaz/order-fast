import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types";

interface ProductDetailModalProps {
  product: Product;
  open: boolean;
  onClose: () => void;
  canOrder: boolean;
  onAdd: () => void;
}

export function ProductDetailModal({ product, open, onClose, canOrder, onAdd }: ProductDetailModalProps) {
  const outOfStock = product.stock !== null && product.stock <= 0;
  const disabled = !product.isAvailable || outOfStock;

  return (
    <Modal open={open} onClose={onClose} title={product.name}>
      <div className="flex flex-col gap-4">
        {product.imageUrl && (
          <img src={product.imageUrl} alt={product.name} className="h-40 w-full rounded-lg object-cover" />
        )}
        <p className="text-sm text-muted">{product.description || "Sin descripción."}</p>
        <div className="flex items-center justify-between">
          <span className="font-display text-xl font-semibold text-primary">{formatCurrency(product.price)}</span>
          <span className="text-xs text-muted">
            {disabled
              ? outOfStock
                ? "Sin stock"
                : "No disponible"
              : product.stock !== null
                ? `${product.stock} disponibles`
                : "Disponible"}
          </span>
        </div>
        {canOrder && (
          <Button
            disabled={disabled}
            onClick={() => {
              onAdd();
              onClose();
            }}
            className="w-full"
          >
            Agregar al carrito
          </Button>
        )}
      </div>
    </Modal>
  );
}
