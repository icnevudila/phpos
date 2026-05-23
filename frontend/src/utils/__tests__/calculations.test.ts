import { describe, it, expect } from 'vitest';
import { calculateInvoiceTotal, calculateRemainingBalance, isLowStock, canTransitionToChair } from '../calculations';

describe('Invoice Calculations', () => {
  it('calculates total with no discount and no tax', () => {
    const items = [{ price: 1000, qty: 2 }, { price: 500, qty: 1 }];
    expect(calculateInvoiceTotal(items)).toBe(2500);
  });

  it('calculates total with discount and tax', () => {
    const items = [{ price: 1000, qty: 1 }];
    // 1000 - 100 (10%) = 900
    // 900 + 108 (12% tax) = 1008
    expect(calculateInvoiceTotal(items, 0.10, 0.12)).toBe(1008);
  });

  it('calculates remaining balance', () => {
    expect(calculateRemainingBalance(1000, 400)).toBe(600);
    expect(calculateRemainingBalance(1000, 1000)).toBe(0);
    expect(calculateRemainingBalance(1000, 1500)).toBe(0);
  });
});

describe('Inventory Calculations', () => {
  it('identifies low stock correctly', () => {
    expect(isLowStock(5, 10)).toBe(true);
    expect(isLowStock(10, 10)).toBe(true);
    expect(isLowStock(15, 10)).toBe(false);
  });
});

describe('Appointment Transitions', () => {
  it('allows transition to chair from WAITING or TRIAGE', () => {
    expect(canTransitionToChair('WAITING')).toBe(true);
    expect(canTransitionToChair('TRIAGE')).toBe(true);
    expect(canTransitionToChair('COMPLETED')).toBe(false);
  });
});
