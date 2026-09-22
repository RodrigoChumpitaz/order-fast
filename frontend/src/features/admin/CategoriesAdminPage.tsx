import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { fetchCategories } from "@/features/catalog/api";
import { createCategory, deleteCategory, updateCategory, type CategoryInput } from "./api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Modal } from "@/components/ui/Modal";
import { apiErrorMessage } from "@/lib/api";
import type { Category } from "@/types";

const EMPTY_FORM: CategoryInput = { name: "", order: 0 };

export function CategoriesAdminPage() {
  const queryClient = useQueryClient();
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryInput>(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  }

  const saveMutation = useMutation({
    mutationFn: (input: CategoryInput) => (editingId ? updateCategory(editingId, input) : createCategory(input)),
    onSuccess: () => {
      setModalOpen(false);
      invalidate();
    },
    onError: (error) => setErrorMessage(apiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: invalidate,
  });

  function openCreateModal() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrorMessage(null);
    setModalOpen(true);
  }

  function openEditModal(category: Category) {
    setEditingId(category._id);
    setForm({ name: category.name, order: category.order });
    setErrorMessage(null);
    setModalOpen(true);
  }

  function handleSave() {
    setErrorMessage(null);
    if (!form.name.trim()) {
      setErrorMessage("El campo 'name' es obligatorio.");
      return;
    }
    saveMutation.mutate(form);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Categorías</h1>
        <Button onClick={openCreateModal}>
          <Plus size={16} />
          Agregar categoría
        </Button>
      </div>

      {categoriesQuery.isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {categoriesQuery.data && categoriesQuery.data.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-background text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Orden</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categoriesQuery.data.map((category) => (
                <tr key={category._id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-ink">{category.name}</td>
                  <td className="px-4 py-3 text-muted">{category.order}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" onClick={() => openEditModal(category)}>
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="danger"
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(category._id)}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Editar categoría" : "Nueva categoría"}>
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Nombre</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Orden</label>
            <Input
              type="number"
              value={form.order ?? 0}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
            />
          </div>
          {errorMessage && <p className="text-sm text-status-cancelled">{errorMessage}</p>}
          <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full">
            {editingId ? "Guardar cambios" : "Crear categoría"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
