import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchProducts } from "./api";
import { ProductCard } from "./ProductCard";
import { OrderTypeSelector } from "./OrderTypeSelector";
import { Spinner } from "@/components/ui/Spinner";

export function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const productsQuery = useQuery({
    queryKey: ["products", activeCategory],
    queryFn: () => fetchProducts(activeCategory ?? undefined),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-2xl font-bold text-ink">Carta</h1>
        <OrderTypeSelector />
      </div>

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

      {productsQuery.data && productsQuery.data.length === 0 && (
        <p className="py-12 text-center text-sm text-muted">Todavía no hay productos en esta categoría.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {productsQuery.data?.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
