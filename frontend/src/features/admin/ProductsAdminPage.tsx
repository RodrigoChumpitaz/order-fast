import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { fetchCategories, fetchProducts } from "@/features/catalog/api";
import { createProduct, deleteProduct, updateProduct, type ProductInput } from "./api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Modal } from "@/components/ui/Modal";
import { apiErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { Category, Product } from "@/types";

const EMPTY_FORM: ProductInput = { name: "", description: "", price: 0, imageUrl: "", category: "", stock: null };

export function ProductsAdminPage() {
  const queryClient = useQueryClient();
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const productsQuery = useQuery({ queryKey: ["products", undefined], queryFn: () => fetchProducts() });
  const categoryNameById = new Map(categoriesQuery.data?.map((category) => [category._id, category.name]));

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductInput>(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  const saveMutation = useMutation({
    mutationFn: (input: ProductInput) => (editingId ? updateProduct(editingId, input) : createProduct(input)),
    onSuccess: () => {
      setModalOpen(false);
      invalidate();
    },
    onError: (error) => setErrorMessage(apiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: invalidate,
  });

  function openCreateModal() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrorMessage(null);
    setModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingId(product._id);
    const categoryId = typeof product.category === "object" ? product.category._id : product.category;
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      category: categoryId,
      stock: product.stock,
    });
    setErrorMessage(null);
    setModalOpen(true);
  }

  function handleSave() {
    setErrorMessage(null);
    if (!form.name.trim()) {
      setErrorMessage("El campo 'name' es obligatorio.");
      return;
    }
    if (!form.category) {
      setErrorMessage("El campo 'category' es obligatorio.");
      return;
    }
    saveMutation.mutate(form);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Productos</h1>
        <Button onClick={openCreateModal}>
          <Plus size={16} />
          Agregar producto
        </Button>
      </div>

      {productsQuery.isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {productsQuery.data && productsQuery.data.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-background text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Precio</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productsQuery.data.map((product) => {
                const categoryId = typeof product.category === "object" ? product.category._id : product.category;
                const categoryName =
                  typeof product.category === "object" ? product.category.name : categoryNameById.get(categoryId);
                return (
                  <tr key={product._id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-ink">{product.name}</td>
                    <td className="px-4 py-3 text-muted">{categoryName ?? "—"}</td>
                    <td className="px-4 py-3 text-muted">{formatCurrency(product.price)}</td>
                    <td className="px-4 py-3 text-muted">{product.stock ?? "Ilimitado"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => openEditModal(product)}>
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="danger"
                          disabled={deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate(product._id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Editar producto" : "Nuevo producto"}>
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Nombre</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Categoría</label>
            <select
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Selecciona una categoría</option>
              {categoriesQuery.data?.map((category: Category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Precio</label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Stock</label>
              <Input
                type="number"
                placeholder="Vacío = ilimitado"
                value={form.stock ?? ""}
                onChange={(e) => setForm({ ...form, stock: e.target.value === "" ? null : Number(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">URL de imagen (opcional)</label>
            <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Descripción (opcional)</label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          {errorMessage && <p className="text-sm text-status-cancelled">{errorMessage}</p>}
          <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full">
            {editingId ? "Guardar cambios" : "Crear producto"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
