import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, QrCode } from "lucide-react";
import {
  createTable,
  deleteTable,
  fetchTableQrObjectUrl,
  fetchTables,
  updateTable,
  type TableInput,
} from "./api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Modal } from "@/components/ui/Modal";
import { apiErrorMessage } from "@/lib/api";
import { useToastStore } from "@/stores/toastStore";
import type { Table } from "@/types";

const EMPTY_FORM: TableInput = { number: 1, capacity: 4 };

export function TablesAdminPage() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);
  const tablesQuery = useQuery({ queryKey: ["admin-tables"], queryFn: fetchTables });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TableInput>(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [qrTable, setQrTable] = useState<Table | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin-tables"] });
  }

  const saveMutation = useMutation({
    mutationFn: (input: TableInput) => (editingId ? updateTable(editingId, input) : createTable(input)),
    onSuccess: () => {
      setModalOpen(false);
      invalidate();
    },
    onError: (error) => setErrorMessage(apiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTable,
    onSuccess: invalidate,
    onError: (error) => showToast(apiErrorMessage(error), "error"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Table["status"] }) => updateTable(id, { status }),
    onSuccess: invalidate,
    onError: (error) => showToast(apiErrorMessage(error), "error"),
  });

  function toggleStatus(table: Table) {
    statusMutation.mutate({ id: table._id, status: table.status === "FREE" ? "OCCUPIED" : "FREE" });
  }

  function openCreateModal() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrorMessage(null);
    setModalOpen(true);
  }

  function openEditModal(table: Table) {
    setEditingId(table._id);
    setForm({ number: table.number, capacity: table.capacity });
    setErrorMessage(null);
    setModalOpen(true);
  }

  function handleSave() {
    setErrorMessage(null);
    if (!form.number || form.number < 1) {
      setErrorMessage("El campo 'number' es obligatorio.");
      return;
    }
    saveMutation.mutate(form);
  }

  async function openQrModal(table: Table) {
    setQrTable(table);
    setQrLoading(true);
    try {
      const url = await fetchTableQrObjectUrl(table._id);
      setQrUrl(url);
    } catch (error) {
      showToast(apiErrorMessage(error), "error");
      setQrTable(null);
    } finally {
      setQrLoading(false);
    }
  }

  function closeQrModal() {
    if (qrUrl) URL.revokeObjectURL(qrUrl);
    setQrUrl(null);
    setQrTable(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Mesas</h1>
        <Button onClick={openCreateModal}>
          <Plus size={16} />
          Agregar mesa
        </Button>
      </div>

      {tablesQuery.isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {tablesQuery.data && tablesQuery.data.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-background text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Número</th>
                <th className="px-4 py-3 font-medium">Capacidad</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tablesQuery.data.map((table) => (
                <tr key={table._id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-ink">Mesa {table.number}</td>
                  <td className="px-4 py-3 text-muted">{table.capacity}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(table)}
                      disabled={statusMutation.isPending}
                      title="Cambiar estado"
                      className={`rounded-full px-3 py-1 text-xs font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50 ${
                        table.status === "FREE" ? "bg-status-delivered" : "bg-status-preparing"
                      }`}
                    >
                      {table.status === "FREE" ? "Libre" : "Ocupada"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" onClick={() => openQrModal(table)} aria-label="Ver QR">
                        <QrCode size={14} />
                      </Button>
                      <Button variant="secondary" onClick={() => openEditModal(table)}>
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="danger"
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(table._id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Editar mesa" : "Nueva mesa"}>
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Número</label>
            <Input
              type="number"
              value={form.number}
              onChange={(e) => setForm({ ...form, number: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Capacidad</label>
            <Input
              type="number"
              value={form.capacity ?? 4}
              onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
            />
          </div>
          {errorMessage && <p className="text-sm text-status-cancelled">{errorMessage}</p>}
          <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full">
            {editingId ? "Guardar cambios" : "Crear mesa"}
          </Button>
        </div>
      </Modal>

      <Modal open={!!qrTable} onClose={closeQrModal} title={qrTable ? `QR de la Mesa ${qrTable.number}` : "QR"}>
        <div className="flex flex-col items-center gap-4">
          {qrLoading && <Spinner />}
          {qrUrl && (
            <>
              <img src={qrUrl} alt="Código QR de la mesa" className="h-56 w-56" />
              <a href={qrUrl} download={`mesa-${qrTable?.number}.png`}>
                <Button variant="secondary">Descargar</Button>
              </a>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
