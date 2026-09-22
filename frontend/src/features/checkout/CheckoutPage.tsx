import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { useCartStore, cartSubtotal } from "@/stores/cartStore";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api, apiErrorMessage, type ApiSuccess } from "@/lib/api";
import type { Table } from "@/types";
import { createOrder } from "./api";
import { fetchWaitEstimate } from "@/features/orders/api";
import { Clock } from "lucide-react";
import { useToastStore } from "@/stores/toastStore";

export function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const mesa = searchParams.get("mesa");
  const navigate = useNavigate();
  const { session } = useAuth();

  const lines = useCartStore((state) => state.lines);
  const clearCart = useCartStore((state) => state.clear);
  const subtotal = cartSubtotal(lines);

  const showToast = useToastStore((state) => state.showToast);

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notes, setNotes] = useState("");

  const tableQuery = useQuery({
    queryKey: ["table", mesa],
    queryFn: async () => {
      const { data } = await api.get<ApiSuccess<Table>>(`/tables/${mesa}`);
      return data.data;
    },
    enabled: !!mesa,
  });

  const waitEstimateQuery = useQuery({
    queryKey: ["wait-estimate"],
    queryFn: fetchWaitEstimate,
    refetchInterval: 20_000,
  });

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      clearCart();
      navigate(`/pedido/${order._id}`);
    },
    onError: (error) => showToast(apiErrorMessage(error), "error"),
  });

  function handleSubmit() {
    if (lines.length === 0) return;
    if (!session && guestName.trim().length === 0) {
      showToast("Ingresa tu nombre para continuar.", "error");
      return;
    }
    mutation.mutate({
      type: mesa ? "DINE_IN" : "TAKEAWAY",
      table: mesa ?? undefined,
      items: lines.map((line) => ({ product: line.productId, quantity: line.quantity })),
      notes: notes || undefined,
      guestName: session ? undefined : guestName,
      guestPhone: session ? undefined : guestPhone || undefined,
    });
  }

  if (lines.length === 0) {
    return <p className="py-24 text-center text-sm text-muted">Tu carrito está vacío.</p>;
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h1 className="font-display text-2xl font-bold text-ink">Confirmar pedido</h1>

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-sm font-medium text-ink">
          {mesa ? `Para la Mesa ${tableQuery.data?.number ?? ""}` : "Para recoger"}
        </p>
        <div className="mt-3 flex flex-col gap-1">
          {lines.map((line) => (
            <div key={line.productId} className="flex justify-between text-sm text-muted">
              <span>
                {line.quantity}× {line.name}
              </span>
              <span>{formatCurrency(line.price * line.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3 font-semibold text-ink">
          <span>Total</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
      </div>

      {!session && (
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Nombre</label>
            <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Tu nombre" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Teléfono (opcional)</label>
            <Input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="999 999 999" />
          </div>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Notas (opcional)</label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej. sin azúcar" />
      </div>

      {waitEstimateQuery.data && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm text-ink">
          <Clock size={16} className="text-primary" />
          {waitEstimateQuery.data.activeOrders > 0 ? (
            <span>
              Tiempo estimado de espera: <b>~{waitEstimateQuery.data.estimatedMinutes} min</b> ({waitEstimateQuery.data.activeOrders}{" "}
              pedido{waitEstimateQuery.data.activeOrders === 1 ? "" : "s"} en preparación)
            </span>
          ) : (
            <span>No hay pedidos en preparación en este momento, tu pedido debería salir pronto.</span>
          )}
        </div>
      )}

      <Button onClick={handleSubmit} disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? "Enviando..." : "Confirmar pedido"}
      </Button>
    </div>
  );
}
