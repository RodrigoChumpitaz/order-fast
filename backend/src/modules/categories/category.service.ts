import { CategoryModel } from "./category.model";
import { AppError, NotFoundError } from "../../shared/errors/AppError";
import { isDuplicateKeyError, duplicateKeyField } from "../../shared/utils/mongoErrors";
import { slugify } from "../../shared/utils/slugify";

interface CreateCategoryInput {
  name: string;
  order?: number;
}

interface UpdateCategoryInput {
  name?: string;
  order?: number;
  isActive?: boolean;
}

export async function listCategories() {
  return CategoryModel.find({ isActive: true }).sort({ order: 1, name: 1 });
}

export async function getCategoryById(id: string) {
  const category = await CategoryModel.findById(id);
  if (!category) throw new NotFoundError("Categoría no encontrada.");
  return category;
}

export async function createCategory(input: CreateCategoryInput) {
  try {
    return await CategoryModel.create({
      name: input.name,
      slug: slugify(input.name),
      order: input.order ?? 0,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AppError(`El campo '${duplicateKeyField(error)}' ya está en uso.`, 409);
    }
    throw error;
  }
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  const category = await getCategoryById(id);

  if (input.name !== undefined) {
    category.name = input.name;
    category.slug = slugify(input.name);
  }
  if (input.order !== undefined) category.order = input.order;
  if (input.isActive !== undefined) category.isActive = input.isActive;

  try {
    await category.save();
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AppError(`El campo '${duplicateKeyField(error)}' ya está en uso.`, 409);
    }
    throw error;
  }
  return category;
}

export async function deleteCategory(id: string) {
  const category = await getCategoryById(id);
  category.isActive = false;
  await category.save();
  return category;
}
