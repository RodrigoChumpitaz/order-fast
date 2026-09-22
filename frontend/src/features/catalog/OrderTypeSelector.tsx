import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchTableByNumber } from "./api";
import { api, apiErrorMessage, type ApiSuccess } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Table } from "@/types";

export function OrderTypeSelector() {
  const [searchParams] = useSearchParams();
  const mesa = searchParams.get("mesa");
  const navigate = useNavigate();

  const [showTableInput, setShowTableInput] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const tableQuery = useQuery({
    queryKey: ["table", mesa],
    queryFn: async () => {
      const { data } = await api.get<ApiSuccess<Table>>(`/tables/${mesa}`);
      return data.data;
    },
    enabled: !!mesa,
  });

  const lookupMutation = useMutation({
    mutationFn: fetchTableByNumber,
    onSuccess: (table) => navigate(`/carta?mesa=${table._id}`),
    onError: (error) => setErrorMessage(apiErrorMessage(error)),
  });

  function handleConfirmTable() {
    setErrorMessage(null);
    const parsed = Number(tableNumber);
    if (!tableNumber.trim() || Number.isNaN(parsed) || parsed < 1) {
      setErrorMessage("Ingresa un número de mesa válido.");
      return;
    }
    lookupMutation.mutate(parsed);
  }

  if (mesa) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <span>Pedido para la {tableQuery.data ? `Mesa ${tableQuery.data.number}` : "mesa"}</span>
        <button onClick={() => navigate("/carta")} className="font-medium text-primary underline">
          Cambiar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={() => setShowTableInput(false)}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
            !showTableInput
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-surface text-ink"
          }`}
        >
          Para llevar / recoger
        </button>
        <button
          onClick={() => setShowTableInput(true)}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
            showTableInput
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-surface text-ink"
          }`}
        >
          Comer aquí
        </button>
      </div>
      {showTableInput && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">¿Cuál es el número de tu mesa?</span>
          <Input
            className="w-24"
            type="number"
            placeholder="N°"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />
          <Button variant="secondary" disabled={lookupMutation.isPending} onClick={handleConfirmTable}>
            Confirmar
          </Button>
        </div>
      )}
      {errorMessage && <p className="text-sm text-status-cancelled">{errorMessage}</p>}
    </div>
  );
}
