// ============================================
// SMART UTANG LEDGER
// Debt tracking with Days Overdue, WhatsApp sharing
// ============================================

/**
 * Calculate days overdue
 */
export function calculateDaysOverdue(dueDate) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffTime = today - due;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Get overdue status
 */
export function getOverdueStatus(daysOverdue) {
  if (daysOverdue === null || daysOverdue === 0) return 'current';
  if (daysOverdue <= 7) return 'warning';
  if (daysOverdue <= 30) return 'overdue';
  return 'critical';
}

/**
 * Format overdue message
 */
export function formatOverdueMessage(daysOverdue, amount, customerName) {
  if (daysOverdue === 0) return null;
  
  const days = daysOverdue === 1 ? 'day' : 'days';
  return `${customerName}, your balance of ₱${amount.toFixed(2)} is ${daysOverdue} ${days} overdue. Please settle at your earliest convenience. Thank you!`;
}

/**
 * Generate WhatsApp share URL
 */
export function generateWhatsAppUrl(phone, message) {
  if (!phone) return null;
  // Remove any non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  // Add country code if not present (assume Philippines +63)
  const formattedPhone = cleanPhone.startsWith('63') ? cleanPhone : `63${cleanPhone}`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

/**
 * Create payment reminder message
 */
export function createPaymentReminder(utangEntry, customer) {
  const daysOverdue = calculateDaysOverdue(utangEntry.dueDate);
  const amount = utangEntry.remainingAmount;
  
  let message = `Hi ${customer.name}! 👋\n\n`;
  
  if (daysOverdue > 0) {
    message += `Your account has an overdue balance:\n`;
    message += `💰 Amount: ₱${amount.toFixed(2)}\n`;
    message += `📅 Days Overdue: ${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'}\n\n`;
  } else {
    message += `Reminder: You have a pending balance:\n`;
    message += `💰 Amount: ₱${amount.toFixed(2)}\n`;
    if (utangEntry.dueDate) {
      const dueDate = new Date(utangEntry.dueDate).toLocaleDateString();
      message += `📅 Due Date: ${dueDate}\n\n`;
    }
  }
  
  message += `Please settle at your earliest convenience. Thank you! 🙏`;
  
  return message;
}

/**
 * Share to WhatsApp
 */
export function shareToWhatsApp(utangEntry, customer) {
  const message = createPaymentReminder(utangEntry, customer);
  const url = generateWhatsAppUrl(customer.phone, message);
  
  if (url) {
    window.open(url, '_blank');
    return true;
  }
  return false;
}

