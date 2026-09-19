import { ProductModel } from "./product.model";
import { CategoryModel } from "../categories/category.model";
import { NotFoundError } from "../../shared/errors/AppError";

interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: string;
  stock?: number | null;
}

interface UpdateProductInput extends Partial<CreateProductInput> {
  isActive?: boolean;
}

async function ensureCategoryExists(categoryId: string) {
  const category = await CategoryModel.findById(categoryId);
  if (!category) throw new NotFoundError("Categoría no encontrada.");
}

export async function listProducts(filters: { category?: string }) {
  const query: Record<string, unknown> = { isActive: true };
  if (filters.category) query.category = filters.category;
  return ProductModel.find(query).populate("category").sort({ name: 1 });
}

export async function getProductById(id: string) {
  const product = await ProductModel.findById(id).populate("category");
  if (!product) throw new NotFoundError("Producto no encontrado.");
  return product;
}

export async function createProduct(input: CreateProductInput) {
  await ensureCategoryExists(input.category);
  return ProductModel.create({
    name: input.name,
    description: input.description ?? "",
    price: input.price,
    imageUrl: input.imageUrl ?? "",
    category: input.category,
    stock: input.stock ?? null,
  });
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  const product = await ProductModel.findById(id);
  if (!product) throw new NotFoundError("Producto no encontrado.");

  if (input.category) {
    await ensureCategoryExists(input.category);
    product.set("category", input.category);
  }
  if (input.name !== undefined) product.name = input.name;
  if (input.description !== undefined) product.description = input.description;
  if (input.price !== undefined) product.price = input.price;
  if (input.imageUrl !== undefined) product.imageUrl = input.imageUrl;
  if (input.stock !== undefined) product.stock = input.stock;
  if (input.isActive !== undefined) product.isActive = input.isActive;

  await product.save();
  return product;
}

export async function deleteProduct(id: string) {
  const product = await ProductModel.findById(id);
  if (!product) throw new NotFoundError("Producto no encontrado.");
  product.isActive = false;
  await product.save();
  return product;
}

export async function setAvailability(id: string, isAvailable: boolean) {
  const product = await ProductModel.findById(id);
  if (!product) throw new NotFoundError("Producto no encontrado.");
  product.isAvailable = isAvailable;
  await product.save();
  return product;
}
