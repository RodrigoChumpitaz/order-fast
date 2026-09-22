import { Link, useSearchParams } from "react-router-dom";
import { useCartStore, cartSubtotal } from "@/stores/cartStore";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/Button";

export function CartPage() {
  const [searchParams] = useSearchParams();
  const mesa = searchParams.get("mesa");
  const lines = useCartStore((state) => state.lines);
  const incrementLine = useCartStore((state) => state.incrementLine);
  const decrementLine = useCartStore((state) => state.decrementLine);
  const removeLine = useCartStore((state) => state.removeLine);
  const subtotal = cartSubtotal(lines);

  if (lines.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-semibold text-ink">Tu carrito está vacío</p>
        <Link to={mesa ? `/carta?mesa=${mesa}` : "/carta"} className="mt-4 inline-block">
          <Button>Ver la carta</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold text-ink">Tu carrito</h1>
      <div className="flex flex-col gap-3">
        {lines.map((line) => (
          <div
            key={line.productId}
            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4"
          >
            <div>
              <p className="font-medium text-ink">{line.name}</p>
              <p className="text-sm text-muted">{formatCurrency(line.price)} c/u</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => decrementLine(line.productId)}
                className="h-7 w-7 rounded-full border border-border text-ink"
              >
                −
              </button>
              <span className="w-6 text-center font-medium text-ink">{line.quantity}</span>
              <button
                onClick={() => incrementLine(line.productId)}
                className="h-7 w-7 rounded-full border border-border text-ink"
              >
                +
              </button>
              <button
                onClick={() => removeLine(line.productId)}
                className="ml-2 text-xs font-medium text-status-cancelled"
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-border pt-4">
        <span className="font-display text-lg font-semibold text-ink">Subtotal</span>
        <span className="font-display text-lg font-semibold text-ink">{formatCurrency(subtotal)}</span>
      </div>
      <Link to={mesa ? `/checkout?mesa=${mesa}` : "/checkout"}>
        <Button className="w-full">Continuar</Button>
      </Link>
    </div>
  );
}
