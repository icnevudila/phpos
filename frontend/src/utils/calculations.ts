/**
 * Pure functions for basic dental clinic calculations.
 */

export function calculateInvoiceTotal(items: { price: number; qty: number }[], discountRate: number = 0, taxRate: number = 0) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discount = subtotal * discountRate;
  const taxable = subtotal - discount;
  const tax = taxable * taxRate;
  return subtotal - discount + tax;
}

export function calculateRemainingBalance(total: number, paid: number) {
  return Math.max(0, total - paid);
}

export function isLowStock(quantity: number, threshold: number = 10) {
  return quantity <= threshold;
}

export function canTransitionToChair(status: string) {
  return status === "WAITING" || status === "TRIAGE";
}
