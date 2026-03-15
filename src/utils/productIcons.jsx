// ============================================
// PRODUCT ICONS - Colorful Placeholder Icons
// Heroicons-style SVG icons for products
// ============================================

// Drink Icon (Professional Bottle)
export const DrinkIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2v6m0 0l-2 2h4l-2-2zm-3 4h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6a2 2 0 012-2z" />
  </svg>
);

// Food Icon (Professional Package)
export const FoodIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14v4m0 0l8 4m-8-4L4 11m8 4v10l8-4m-8 4l-8-4V11" />
  </svg>
);

// Smoke Icon (Professional Cigarette)
export const SmokeIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 12h3m-3 4h3m-3-8h3M3 13h12a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2a1 1 0 011-1zM3 17h12M3 13h12" />
  </svg>
);

// Coffee Icon (Professional Cup)
export const CoffeeIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" />
  </svg>
);

// Snack Icon (Professional Tag/Bag)
export const SnackIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h10M7 11h10M7 15h10M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
  </svg>
);

// Get product icon based on name
export function getProductIcon(productName) {
  const name = productName.toLowerCase();
  
  if (name.includes('cola') || name.includes('sprite') || name.includes('royal') || name.includes('zesto') || name.includes('c2')) {
    return { Icon: DrinkIcon, color: '#DC2626' }; // Red
  }
  if (name.includes('horse') || name.includes('miguel') || name.includes('tanduay') || name.includes('beer')) {
    return { Icon: DrinkIcon, color: '#D97706' }; // Amber
  }
  if (name.includes('canton') || name.includes('lucky') || name.includes('pancit')) {
    return { Icon: FoodIcon, color: '#EA580C' }; // Orange
  }
  if (name.includes('rice')) {
    return { Icon: FoodIcon, color: '#059669' }; // Green
  }
  if (name.includes('marlboro') || name.includes('cigarette') || name.includes('smoke')) {
    return { Icon: SmokeIcon, color: '#374151' }; // Gray
  }
  if (name.includes('nescafe') || name.includes('coffee')) {
    return { Icon: CoffeeIcon, color: '#92400E' }; // Brown
  }
  if (name.includes('cream') || name.includes('rebisco') || name.includes('skyflakes')) {
    return { Icon: SnackIcon, color: '#CA8A04' }; // Yellow
  }
  
  // Default
  return { Icon: FoodIcon, color: '#4F46E5' }; // Indigo
}

