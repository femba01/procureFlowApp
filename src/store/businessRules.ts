import type { StockStatus } from "../types/types";
export const approvalRoute = (total: number) =>
  total > 1_000_000
    ? ["Department Manager", "Finance Officer", "Procurement"]
    : ["Department Manager", "Procurement"];
export const stockStatus = (
  quantity: number,
  reorderLevel: number,
): StockStatus =>
  quantity === 0
    ? "Out of stock"
    : quantity <= reorderLevel
      ? "Low stock"
      : "In stock";
export function validateReceiptQuantity(
  receiveNow: number,
  ordered: number,
  alreadyReceived: number,
) {
  if (receiveNow < 0)
    return { valid: false, message: "Received quantity cannot be negative" };
  if (receiveNow > ordered - alreadyReceived)
    return {
      valid: false,
      message: "Received quantity exceeds the outstanding quantity",
    };
  return { valid: true, message: "" };
}
