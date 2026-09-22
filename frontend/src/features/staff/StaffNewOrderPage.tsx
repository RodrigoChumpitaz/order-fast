import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchCategories, fetchProducts } from "@/features/catalog/api";
import { fetchTables } from "@/features/admin/api";
import { createOrder } from "@/features/checkout/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { apiErrorMessage } from "@/lib/api";
import { useToastStore } from "@/stores/toastStore";
import { formatCurrency } from "@/lib/format";
import type { OrderType, Product } from "@/types";

interface Line {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export function StaffNewOrderPage() {
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);

  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const productsQuery = useQuery({
    queryKey: ["products", activeCategory],
    queryFn: () => fetchProducts(activeCategory ?? undefined),
  });
  const tablesQuery = useQuery({ queryKey: ["admin-tables"], queryFn: fetchTables });

  const [orderType, setOrderType] = useState<OrderType>("TAKEAWAY");
  const [tableId, setTableId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [lines, setLines] = useState<Line[]>([]);

  function addLine(product: Product) {
    setLines((current) => {
      const existing = current.find((line) => line.productId === product._id);
      if (existing) {
        return current.map((line) =>
          line.productId === product._id ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [...current, { productId: product._id, name: product.name, price: product.price, quantity: 1 }];
    });
  }

  function changeQuantity(productId: string, delta: number) {
    setLines((current) =>
      current
        .map((line) => (line.productId === productId ? { ...line, quantity: line.quantity + delta } : line))
        .filter((line) => line.quantity > 0),
    );
  }

  const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      showToast("Pedido creado");
      setLines([]);
      setGuestName("");
      navigate("/staff/pedidos");
    },
    onError: (error) => showToast(apiErrorMessage(error), "error"),
  });

  function handleSubmit() {
    if (lines.length === 0) {
      showToast("Agrega al menos un producto.", "error");
      return;
    }
    if (orderType === "DINE_IN" && !tableId) {
      showToast("Selecciona una mesa.", "error");
      return;
    }
    const selectedTable = tablesQuery.data?.find((table) => table._id === tableId);
    const fallbackName = orderType === "DINE_IN" ? `Mesa ${selectedTable?.number ?? ""}` : "Cliente en mostrador";

    mutation.mutate({
      type: orderType,
      table: orderType === "DINE_IN" ? tableId : undefined,
      items: lines.map((line) => ({ product: line.productId, quantity: line.quantity })),
      guestName: guestName.trim() || fallbackName,
    });
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex flex-1 flex-col gap-4">
        <h1 className="font-display text-2xl font-bold text-ink">Nuevo pedido</h1>

        {categoriesQuery.data && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                activeCategory === null
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-ink"
              }`}
            >
              Todas
            </button>
            {categoriesQuery.data.map((category) => (
              <button
                key={category._id}
                onClick={() => setActiveCategory(category._id)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                  activeCategory === category._id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-ink"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {productsQuery.isLoading && (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        )}

        <div className="flex flex-col gap-2">
          {productsQuery.data?.map((product) => {
            const outOfStock = product.stock !== null && product.stock <= 0;
            const disabled = !product.isAvailable || outOfStock;
            return (
              <div
                key={product._id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
              >
                <div>
                  <p className="font-medium text-ink">{product.name}</p>
                  <p className="text-sm text-muted">{formatCurrency(product.price)}</p>
                </div>
                <Button variant="secondary" disabled={disabled} onClick={() => addLine(product)}>
                  Agregar
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex w-full flex-col gap-4 lg:w-80">
        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-3 font-display text-base font-semibold text-ink">Detalles</h2>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setOrderType("TAKEAWAY")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                  orderType === "TAKEAWAY"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-ink"
                }`}
              >
                Para llevar
              </button>
              <button
                onClick={() => setOrderType("DINE_IN")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                  orderType === "DINE_IN"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-ink"
                }`}
              >
                Mesa
              </button>
            </div>

            {orderType === "DINE_IN" && (
              <select
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary"
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
              >
                <option value="">Selecciona una mesa</option>
                {tablesQuery.data?.map((table) => (
                  <option key={table._id} value={table._id}>
                    Mesa {table.number} ({table.status === "FREE" ? "libre" : "ocupada"})
                  </option>
                ))}
              </select>
            )}

            <Input
              placeholder="Nombre del cliente (opcional)"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-3 font-display text-base font-semibold text-ink">Pedido</h2>
          {lines.length === 0 ? (
            <p className="text-sm text-muted">Todavía no agregaste productos.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {lines.map((line) => (
                <div key={line.productId} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-ink">{line.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changeQuantity(line.productId, -1)}
                      className="h-6 w-6 rounded-full border border-border text-ink"
                    >
                      −
                    </button>
                    <span className="w-4 text-center text-ink">{line.quantity}</span>
                    <button
                      onClick={() => changeQuantity(line.productId, 1)}
                      className="h-6 w-6 rounded-full border border-border text-ink"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between border-t border-border pt-2 font-semibold text-ink">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          )}
        </div>

        <Button onClick={handleSubmit} disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? "Creando..." : "Crear pedido"}
        </Button>
      </div>
    </div>
  );
}
