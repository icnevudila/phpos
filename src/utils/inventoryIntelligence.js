// ============================================
// SMART INVENTORY INTELLIGENCE
// Low stock alerts, expiration tracking, profit analysis
// ============================================

/**
 * Check if product is low stock
 */
export function isLowStock(product, threshold = null) {
  const stock = parseFloat(product.stockQuantity || 0);
  const lowThreshold = threshold || parseFloat(product.lowStockThreshold || 5);
  return stock <= lowThreshold;
}

/**
 * Get low stock severity level
 */
export function getLowStockSeverity(product) {
  const stock = parseFloat(product.stockQuantity || 0);
  const threshold = parseFloat(product.lowStockThreshold || 5);
  
  if (stock === 0) return 'critical'; // Out of stock
  if (stock <= threshold * 0.3) return 'high'; // Very low
  if (stock <= threshold) return 'medium'; // Low
  return 'normal';
}

/**
 * Check if product is expiring soon
 */
export function isExpiringSoon(product, daysAhead = 7) {
  if (!product.expirationDate) return false;
  
  const expiration = new Date(product.expirationDate);
  const today = new Date();
  const diffTime = expiration - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays >= 0 && diffDays <= daysAhead;
}

/**
 * Get days until expiration
 */
export function getDaysUntilExpiration(product) {
  if (!product.expirationDate) return null;
  
  const expiration = new Date(product.expirationDate);
  const today = new Date();
  const diffTime = expiration - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Calculate profit margin for a product
 */
export function calculateProfitMargin(product) {
  const price = parseFloat(product.price || 0);
  const cost = parseFloat(product.cost || 0);
  
  if (cost === 0) return null;
  
  const profit = price - cost;
  const margin = (profit / cost) * 100;
  
  return {
    profit,
    margin,
    profitPerUnit: profit
  };
}

/**
 * Calculate total profit for a product (considering sales)
 */
export function calculateProductProfit(product, salesData) {
  const margin = calculateProfitMargin(product);
  if (!margin) return null;
  
  const quantitySold = salesData.quantitySold || 0;
  const totalProfit = margin.profit * quantitySold;
  
  return {
    ...margin,
    quantitySold,
    totalProfit,
    revenue: parseFloat(product.price || 0) * quantitySold
  };
}

/**
 * Get products that need attention (low stock or expiring)
 */
export function getProductsNeedingAttention(products) {
  return products.filter(p => 
    isLowStock(p) || isExpiringSoon(p)
  ).map(p => ({
    ...p,
    issue: isLowStock(p) ? 'low_stock' : 'expiring',
    severity: isLowStock(p) ? getLowStockSeverity(p) : 'medium',
    daysUntilExpiration: getDaysUntilExpiration(p)
  }));
}

/**
 * Generate restock recommendation
 */
export function generateRestockRecommendation(product, averageDailySales = 0) {
  const currentStock = parseFloat(product.stockQuantity || 0);
  const threshold = parseFloat(product.lowStockThreshold || 5);
  const recommendedStock = Math.max(threshold * 2, averageDailySales * 7); // 1 week supply
  const restockAmount = Math.max(0, recommendedStock - currentStock);
  
  return {
    currentStock,
    recommendedStock,
    restockAmount,
    urgency: currentStock <= threshold * 0.5 ? 'high' : 'medium'
  };
}

/**
 * Get top profitable products
 */
export function getTopProfitableProducts(products, salesData = {}) {
  return products
    .map(p => {
      const profit = calculateProductProfit(p, salesData[p.id] || {});
      return {
        ...p,
        profitData: profit
      };
    })
    .filter(p => p.profitData && p.profitData.totalProfit > 0)
    .sort((a, b) => (b.profitData.totalProfit || 0) - (a.profitData.totalProfit || 0))
    .slice(0, 10);
}

