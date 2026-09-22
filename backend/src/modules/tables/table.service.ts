import QRCode from "qrcode";
import { TableModel, type TableDoc, type TableStatus } from "./table.model";
import { AppError, NotFoundError } from "../../shared/errors/AppError";
import { isDuplicateKeyError, duplicateKeyField } from "../../shared/utils/mongoErrors";
import { env } from "../../config/env";

interface CreateTableInput {
  number: number;
  capacity?: number;
}

interface UpdateTableInput {
  number?: number;
  capacity?: number;
  status?: TableStatus;
  isActive?: boolean;
}

export async function listTables() {
  return TableModel.find({ isActive: true }).sort({ number: 1 });
}

export async function getTableById(id: string) {
  const table = await TableModel.findById(id);
  if (!table) throw new NotFoundError("Mesa no encontrada.");
  return table;
}

export async function getTableByNumber(number: number) {
  const table = await TableModel.findOne({ number, isActive: true });
  if (!table) throw new NotFoundError("Mesa no encontrada.");
  return table;
}

export async function createTable(input: CreateTableInput) {
  try {
    return await TableModel.create({
      number: input.number,
      capacity: input.capacity ?? 4,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AppError(`El campo '${duplicateKeyField(error)}' ya está en uso.`, 409);
    }
    throw error;
  }
}

export async function updateTable(id: string, input: UpdateTableInput) {
  const table = await getTableById(id);

  if (input.number !== undefined) table.number = input.number;
  if (input.capacity !== undefined) table.capacity = input.capacity;
  if (input.status !== undefined) table.status = input.status;
  if (input.isActive !== undefined) table.isActive = input.isActive;

  try {
    await table.save();
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AppError(`El campo '${duplicateKeyField(error)}' ya está en uso.`, 409);
    }
    throw error;
  }
  return table;
}

export async function deleteTable(id: string) {
  const table = await getTableById(id);
  table.isActive = false;
  await table.save();
  return table;
}

export async function generateTableQrPng(table: TableDoc): Promise<Buffer> {
  const url = `${env.FRONTEND_URL}/carta?mesa=${table._id}`;
  return QRCode.toBuffer(url, { type: "png", width: 300, margin: 2 });
}
