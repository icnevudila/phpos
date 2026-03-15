// ============================================
// UNIFIED PAYMENT LOGIC
// Handles split payments, transaction IDs, etc.
// ============================================

/**
 * Generate unique Transaction Reference ID
 * Format: TX-YYYYMMDD-HHMMSS-XXXXX
 */
export function generateTransactionRef() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `TX-${dateStr}-${timeStr}-${random}`;
}

/**
 * Calculate split payment amounts
 */
export function calculateSplitPayment(total, paymentBreakdown) {
  const { cash = 0, gcash = 0, maya = 0, utang = 0 } = paymentBreakdown;
  const sum = cash + gcash + maya + utang;
  
  if (Math.abs(sum - total) > 0.01) {
    throw new Error('Payment breakdown does not match total amount');
  }

  return {
    cashAmount: cash,
    digitalAmount: gcash + maya,
    gcashAmount: gcash,
    mayaAmount: maya,
    utangAmount: utang,
    changeAmount: 0 // Change only applies to cash
  };
}

/**
 * Validate payment method
 */
export function validatePayment(paymentMethod, amount, cashReceived = 0) {
  switch (paymentMethod) {
    case 'cash':
      if (cashReceived < amount) {
        return { valid: false, error: 'Insufficient cash received' };
      }
      return { valid: true, change: cashReceived - amount };
    
    case 'gcash':
    case 'maya':
      return { valid: true, change: 0 };
    
    case 'utang':
      return { valid: true, change: 0 };
    
    case 'mixed':
      if (cashReceived < 0) {
        return { valid: false, error: 'Cash amount cannot be negative' };
      }
      if (cashReceived > amount) {
        return { valid: true, change: cashReceived - amount };
      }
      return { valid: true, change: 0 };
    
    default:
      return { valid: false, error: 'Invalid payment method' };
  }
}

/**
 * Format payment summary for display
 */
export function formatPaymentSummary(payment) {
  const parts = [];
  if (payment.cashAmount > 0) parts.push(`Cash: ₱${payment.cashAmount.toFixed(2)}`);
  if (payment.gcashAmount > 0) parts.push(`GCash: ₱${payment.gcashAmount.toFixed(2)}`);
  if (payment.mayaAmount > 0) parts.push(`Maya: ₱${payment.mayaAmount.toFixed(2)}`);
  if (payment.utangAmount > 0) parts.push(`Utang: ₱${payment.utangAmount.toFixed(2)}`);
  if (payment.changeAmount > 0) parts.push(`Change: ₱${payment.changeAmount.toFixed(2)}`);
  return parts.join(' • ');
}

