// ============================================
// COMPACT HIGH-DENSITY CASHIER MODE
// Professional POS - Maximum Information, Minimum Scrolling
// 75/25 Layout - 4-5 Column Grid - Quick-Access Tiles
// ============================================

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useI18n } from '../i18n/i18n-context.jsx';
import { useGlobalStore } from '../store/GlobalStore.jsx';
import { createTenantQuery } from '../utils/tenantIsolation.js';
import { generateTransactionRef } from '../utils/paymentLogic.js';
import { db, getDeviceId } from '../db/dexie-schema.js';
import BarcodeScanner from './BarcodeScanner.jsx';
import ManagerDashboard from './ManagerDashboard.jsx';
import { getProductIcon } from '../utils/productIcons.jsx';

// Get product color for visual identification
function getProductColor(productName) {
  const lower = productName.toLowerCase();
  if (lower.includes('coca cola') || lower.includes('sprite') || lower.includes('royal')) return '#DC2626'; // Red
  if (lower.includes('red horse') || lower.includes('tanduay') || lower.includes('san miguel')) return '#F59E0B'; // Amber
  if (lower.includes('pancit') || lower.includes('lucky me')) return '#75594aff'; // Orange
  if (lower.includes('marlboro')) return '#1F2937'; // Dark gray/black
  if (lower.includes('rice')) return '#059669'; // Green
  if (lower.includes('nescafe')) return '#92400E'; // Brown
  if (lower.includes('skyflakes') || lower.includes('cream o') || lower.includes('rebisco')) return '#EAB308'; // Yellow
  if (lower.includes('c2')) return '#10B981'; // Green tea
  return '#6366F1'; // Default indigo
}

// Seed Products with Real Product Images
const SEED_PRODUCTS = [
  { name: 'Coca Cola', price: 40, order: 1, stockQuantity: 100, imageUrl: '/brain/b6c7c7b8-ea63-4e72-b26a-c0f14cf5d3a1/coca_cola_pos_1773559198101.png' },
  { name: 'Red Horse', price: 45, order: 2, stockQuantity: 100, imageUrl: '/brain/b6c7c7b8-ea63-4e72-b26a-c0f14cf5d3a1/red_horse_pos_1773559216667.png' },
  { name: 'Pancit Canton', price: 12, order: 3, stockQuantity: 100, imageUrl: '/brain/b6c7c7b8-ea63-4e72-b26a-c0f14cf5d3a1/pancit_canton_pos_1773559231703.png' },
  { name: 'Marlboro', price: 85, order: 4, stockQuantity: 100, imageUrl: '/brain/b6c7c7b8-ea63-4e72-b26a-c0f14cf5d3a1/marlboro_pos_1773559255805.png' },
  { name: '1kg Rice', price: 50, order: 5, stockQuantity: 100, imageUrl: '/brain/b6c7c7b8-ea63-4e72-b26a-c0f14cf5d3a1/rice_bag_pos_v3_png_1773559955031.png', isVariable: true, unitType: 'weight' },
  { name: 'Nescafe', price: 8, order: 6, stockQuantity: 100, imageUrl: '/brain/b6c7c7b8-ea63-4e72-b26a-c0f14cf5d3a1/nescafe_coffee_pos_v3_png_1773559817647.png' },
  { name: 'Sprite', price: 15, order: 9, stockQuantity: 100, imageUrl: '/brain/b6c7c7b8-ea63-4e72-b26a-c0f14cf5d3a1/sprite_can_pos_v3_png_1773559802863.png' },
  { name: 'Royal', price: 15, order: 10, stockQuantity: 100, imageUrl: '/brain/b6c7c7b8-ea63-4e72-b26a-c0f14cf5d3a1/royal_soda_pos_v3_png_1773559927106.png' },
  { name: 'San Miguel', price: 40, order: 13, stockQuantity: 100, imageUrl: '/brain/b6c7c7b8-ea63-4e72-b26a-c0f14cf5d3a1/san_miguel_beer_pos_v3_png_1773559940293.png' },
  { name: 'Sugar', price: 60, order: 14, stockQuantity: 100, isVariable: true, unitType: 'weight' },
  { name: 'Tomato', price: 5, order: 15, stockQuantity: 100, isVariable: true, unitType: 'piece' },
];

// Compact Icons
const ClearIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckoutIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ScanIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
  </svg>
);

const BackspaceIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
  </svg>
);

const BanknoteIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const SmartphoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const NotebookIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PrinterIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
);

const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);


const InfoIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Audio feedback
function playClickSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    if (navigator.vibrate) navigator.vibrate(20);
  }
}

export default function CashierMode({ userId, tenantId }) {
  const { t, changeLanguage, language } = useI18n();
  const { businessRules, currentTenant } = useGlobalStore();
  const [cart, setCart] = useState([]);
  const [quickTapProducts, setQuickTapProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [change, setChange] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showQuantitySelector, setShowQuantitySelector] = useState(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [pendingQuantity, setPendingQuantity] = useState(''); // Numpad-First: Store quantity before product click
  const [discount, setDiscount] = useState(0); // Discount amount
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [showGCashQR, setShowGCashQR] = useState(false);
  const [cartFlash, setCartFlash] = useState(false); // Visual feedback
  const [showNumpad, setShowNumpad] = useState(false); // Numpad modal
  const [showBottomSheet, setShowBottomSheet] = useState(false); // Mobile bottom sheet
  const [showHeldOrders, setShowHeldOrders] = useState(false);
  const [sunlightMode, setSunlightMode] = useState(false);
  const [showDrawerAudit, setShowDrawerAudit] = useState(false);
  const [drawerCounts, setDrawerCounts] = useState({
    1000: 0, 500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, 1: 0
  });
  const [heldOrders, setHeldOrders] = useState([]); // Array of { id, cart, timestamp }
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [showManualQtyModal, setShowManualQtyModal] = useState(null); // { cartIndex, product }
  const [showCashOutModal, setShowCashOutModal] = useState(false);
  const [showVoidConfirm, setShowVoidConfirm] = useState(false);
  const [showELoadModal, setShowELoadModal] = useState(false);
  const [showUtangModal, setShowUtangModal] = useState(false);
  const [showVariableSellingModal, setShowVariableSellingModal] = useState(null); // { product }
  const [toasts, setToasts] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showInvoiceScanner, setShowInvoiceScanner] = useState(false);
  const [scannedInvoiceItems, setScannedInvoiceItems] = useState([]);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [eloadPhone, setEloadPhone] = useState('');
  const [eloadAmount, setEloadAmount] = useState('');
  const [isRefundMode, setIsRefundMode] = useState(false);
  const [isAuditMode, setIsAuditMode] = useState(false);
  const [showVoidReasonModal, setShowVoidReasonModal] = useState(null); // { cartIndex, product }
  const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]); // Past sales for history bar
  const [lastTransaction, setLastTransaction] = useState(null); // Store last checkout for persistent receipt
  const [showReceiptOverlay, setShowReceiptOverlay] = useState(false);
  const [autoCloseReceipt, setAutoCloseReceipt] = useState(false); // User-controlled toggle for persistent receipt preview
  const [cashBreakdown, setCashBreakdown] = useState([]); // Sequence of cash added (e.g. [500, 200])
  const [terminalId, setTerminalId] = useState('....'); // State to fix async getDeviceId() crash
  const [showSalesHistory, setShowSalesHistory] = useState(false); // Full history overlay
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' or 'management'

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);
  const [poppedProductId, setPoppedProductId] = useState(null);
  const [mobileViewMode, setMobileViewMode] = useState('grid'); // 'grid' or 'cart'
  const searchInputRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const quantitySelectorRef = useRef(null);

  useEffect(() => {
    if (tenantId) {
      loadQuickTapProducts();
      loadCustomers();
      loadRecentTransactions();
      // Fix for async getDeviceId in UI
      getDeviceId().then(id => setTerminalId(id?.substring(0, 8)));
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [tenantId]);

  useEffect(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const total = (isRefundMode ? -subtotal : subtotal) - discount - (loyaltyPointsToRedeem * 1); // 1 point = 1 unit discount
    if (cashReceived && total > 0) {
      const cash = parseFloat(cashReceived) || 0;
      setChange(Math.max(0, cash - total));
    } else {
      setChange(0);
    }
  }, [cashReceived, cart, discount, isRefundMode, loyaltyPointsToRedeem]);

  // Smart Search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(quickTapProducts);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = quickTapProducts.filter(p =>
        p.name && p.name.toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, quickTapProducts]);

  // Ensure products are displayed even if quickTapProducts is empty initially
  useEffect(() => {
    if (quickTapProducts.length > 0 && filteredProducts.length === 0 && searchQuery.trim() === '') {
      setFilteredProducts(quickTapProducts);
    }
  }, [quickTapProducts, filteredProducts.length, searchQuery]);

  // Force load products on mount if empty
  useEffect(() => {
    if (tenantId && quickTapProducts.length === 0 && filteredProducts.length === 0) {
      // Retry loading after a short delay
      setTimeout(() => {
        loadQuickTapProducts();
      }, 500);
    }
  }, [tenantId]);

  // Click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (quantitySelectorRef.current && !quantitySelectorRef.current.contains(event.target)) {
        setShowQuantitySelector(null);
      }
      // Close customer dropdown when clicking outside
      if (showCustomerDropdown && !event.target.closest('.customer-dropdown-container')) {
        setShowCustomerDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCustomerDropdown]);

  useEffect(() => {
    // Background Sync Logic
    if (isOnline && !isSyncing) {
      syncPendingTransactions();
    }
  }, [isOnline]);

  async function syncPendingTransactions() {
    try {
      setIsSyncing(true);
      const pendingTxs = await db.transactions.where('syncStatus').equals('pending').toArray();
      if (pendingTxs.length > 0) {
        for (const tx of pendingTxs) {
          // Simulated API latency
          await new Promise(resolve => setTimeout(resolve, 500));
          await db.transactions.update(tx.id, { syncStatus: 'synced' });
        }
      }
    } catch (e) {
      console.error('Sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  }

  async function loadRecentTransactions() {
    try {
      const txs = await db.transactions
        .where('tenantId').equals(tenantId)
        .reverse()
        .limit(10)
        .toArray();
      
      // Fetch items for each transaction to ensure previews work
      const enrichedTxs = await Promise.all(txs.map(async tx => {
        if (tx.items && tx.items.length > 0) return tx;
        const items = await db.transactionItems.where('transactionId').equals(tx.id).toArray();
        return { ...tx, items };
      }));
      
      setRecentTransactions(enrichedTxs);
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }

  function handleShareToWhatsApp(tx) {
    if (!tx || !tx.items) return;
    const storeName = currentTenant?.name || 'Filipin POS';
    let message = `*${storeName.toUpperCase()} - RECEIPT*\n`;
    message += `Ref: ${tx.id.substring(0, 8)}\n`;
    message += `Date: ${new Date(tx.timestamp).toLocaleString()}\n`;
    message += `--------------------------\n`;
    tx.items.forEach(item => {
      message += `${item.productName} x${item.quantity}\n`;
      message += `   ₱${item.subtotal.toFixed(2)}\n`;
    });
    message += `--------------------------\n`;
    message += `*TOTAL: ₱${tx.total.toFixed(2)}*\n`;
    message += `Payment: ${tx.paymentMethod.toUpperCase()}\n`;
    message += `--------------------------\n`;
    message += `Thank you for shopping!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  }

  function handleShareToViber(tx) {
    if (!tx || !tx.items) return;
    const storeName = currentTenant?.name || 'Filipin POS';
    let message = `${storeName.toUpperCase()} - RECEIPT\n`;
    message += `Ref: ${tx.id.substring(0, 8)}\n`;
    message += `Total: ₱${tx.total.toFixed(2)}\n`;
    message += `Visit us again!`;
    const encoded = encodeURIComponent(message);
    window.open(`viber://forward?text=${encoded}`, '_blank');
  }

  async function handleELoadSale(operator, amount, phone) {
    if (!operator || !amount || !phone) {
      alert('Please fill all E-Load details');
      return;
    }
    const eLoadProduct = {
      id: `eload_${Date.now()}`,
      name: `E-Load: ${operator} (${phone})`,
      price: parseFloat(amount),
      isCustom: true,
      category: 'E-Load'
    };
    handleProductClick(eLoadProduct);
    setShowELoadModal(false);
    if (navigator.vibrate) navigator.vibrate(15);
  }

  const loadQuickTapProducts = useCallback(async () => {
    try {
      if (!tenantId) return;

      // Try to get products from database
      let products = [];
      try {
        const query = createTenantQuery(tenantId, 'products');
        const queryResult = await query.whereMultiple({ isQuickTap: true });
        products = await queryResult.toArray();
      } catch (err) {
      }

      // Duplicate Cleanup Logic: Ensure no duplicate names exist in DB
      const uniqueProducts = [];
      const seenNames = new Set();
      const duplicatesToRemove = [];

      for (const p of products) {
        if (seenNames.has(p.name)) {
          duplicatesToRemove.push(p.id);
        } else {
          seenNames.add(p.name);
          uniqueProducts.push(p);
        }
      }

      if (duplicatesToRemove.length > 0) {
        console.log(`Removing ${duplicatesToRemove.length} duplicate products...`);
        await db.products.bulkDelete(duplicatesToRemove);
        products = uniqueProducts;
      }

      if (products.length === 0) {
        // Seed products if none exist
        const seedProducts = SEED_PRODUCTS.map(prod => ({
          id: `seed-${prod.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          tenantId,
          name: prod.name,
          price: prod.price,
          isQuickTap: true,
          quickTapOrder: prod.order,
          stockQuantity: prod.stockQuantity || 100,
          isActive: true,
          imageUrl: prod.imageUrl,
          createdAt: new Date()
        }));

        try {
          await db.products.bulkAdd(seedProducts);
        } catch (bulkError) {
          // If bulk add fails, try individual adds
          console.log('Bulk add failed, trying individual adds:', bulkError);
          for (const prod of seedProducts) {
            try {
              await db.products.add(prod);
            } catch (e) {
              console.log('Failed to add product:', prod.name, e);
            }
          }
        }

        setQuickTapProducts(seedProducts);
        setAllProducts(seedProducts);
        setFilteredProducts(seedProducts);
      } else {
        // Sort and set products
        const sorted = products.sort((a, b) => (a.quickTapOrder || 0) - (b.quickTapOrder || 0));
        setQuickTapProducts(sorted);
        setAllProducts(sorted);
        setFilteredProducts(sorted);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // Fallback to seed products for display
      const fallback = SEED_PRODUCTS.map(p => ({
        ...p,
        id: `seed-${p.name.toLowerCase().replace(/\s+/g, '-')}`,
        imageUrl: p.imageUrl
      }));
      setQuickTapProducts(fallback);
      setAllProducts(fallback);
      setFilteredProducts(fallback);
    }
  }, [tenantId]);

  const loadCustomers = useCallback(async () => {
    try {
      if (!tenantId) {
        setCustomers([]);
        return;
      }

      let custs = [];
      try {
        const query = createTenantQuery(tenantId, 'customers');
        const queryResult = await query.whereMultiple({ isActive: true });
        custs = await queryResult.toArray();
      } catch (err) {
        console.log('Query method failed, trying direct access:', err);
        // Fallback: direct database access
        custs = await db.customers
          .where('tenantId')
          .equals(tenantId)
          .filter(c => c.isActive === true)
          .toArray();
      }

      // If no customers, create a few demo customers
      if (custs.length === 0) {
        const demoCustomers = [
          { name: 'Maria Santos', phone: '+63 912 345 6789' },
          { name: 'Roberto Cruz', phone: '+63 923 456 7890' },
          { name: 'Ana Garcia', phone: '+63 934 567 8901' }
        ];

        const newCustomers = demoCustomers.map((demo, idx) => ({
          id: `customer-${Date.now()}-${idx}`,
          tenantId,
          name: demo.name,
          phone: demo.phone,
          isActive: true,
          creditLimit: 1000,
          totalUtang: 0,
          createdAt: new Date()
        }));

        try {
          await db.customers.bulkAdd(newCustomers);
          custs = newCustomers;
        } catch (bulkError) {
          console.log('Failed to add demo customers:', bulkError);
        }
      }

      setCustomers(custs);
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
    }
  }, [tenantId]);

  const addToCart = useCallback((product, quantity = null) => {
    try {
      if (!product) {
        console.error('Product is null or undefined');
        return;
      }

      if (!product.id) {
        console.error('Product missing id:', product);
        return;
      }

      // Use pendingQuantity if available (Numpad-First), otherwise use provided quantity or default to 1
      const qty = quantity !== null ? quantity : (pendingQuantity ? parseInt(pendingQuantity) || 1 : 1);

      // Ensure qty is a valid number
      if (isNaN(qty) || qty <= 0) {
        console.error('Invalid quantity:', qty);
        return;
      }

      const productPrice = product.price || product.unitPrice || 0;
      if (!productPrice || productPrice <= 0 || isNaN(productPrice)) {
        console.error('Invalid product price:', productPrice, product);
        return;
      }

      // Use functional update to avoid closure issues
      setCart(prevCart => {
        try {
          const existingItem = prevCart.find(item => item && item.productId === product.id);
          if (existingItem) {
            const newQuantity = (existingItem.quantity || 0) + qty;
            const unitPrice = existingItem.unitPrice || productPrice;
            return prevCart.map(item =>
              item && item.productId === product.id
                ? { ...item, quantity: newQuantity, subtotal: newQuantity * unitPrice }
                : item
            );
          } else {
            return [...prevCart, {
              productId: product.id,
              productName: product.name || 'Unknown Product',
              quantity: qty,
              unitPrice: productPrice,
              subtotal: qty * productPrice
            }];
          }
        } catch (error) {
          console.error('Error updating cart:', error);
          return prevCart; // Return previous cart on error
        }
      });

      // Visual feedback - flash animation
      setCartFlash(true);
      setTimeout(() => setCartFlash(false), 300);

      // Clear pending quantity after adding
      setPendingQuantity('');
      playClickSound();
    } catch (error) {
      console.error('Error in addToCart:', error, product);
      // Don't crash the app, just log the error
    }
  }, [pendingQuantity]);

  function handleProductPress(product, event) {
    longPressTimerRef.current = setTimeout(() => {
      setShowQuantitySelector(product.id);
      playClickSound();
    }, 500);
  }

  function handleProductRelease() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  }

  const handleProductClick = useCallback((product) => {
    if (isAuditMode) {
      setShowQuantitySelector({ product, type: 'audit' });
      return;
    }

    if (pendingQuantity) {
      addToCart(product, parseFloat(pendingQuantity));
      setPendingQuantity('');
      if (navigator.vibrate) navigator.vibrate(15);
      setPoppedProductId(product.id);
      setTimeout(() => setPoppedProductId(null), 300);
      return;
    }

    if (product.isVariable) {
      setShowVariableSellingModal({ product });
    } else {
      addToCart(product, 1);
      if (navigator.vibrate) navigator.vibrate(10);
      setPoppedProductId(product.id);
      setTimeout(() => setPoppedProductId(null), 300);
    }
  }, [isAuditMode, pendingQuantity, addToCart]);

  function handleELoadSale(operator, amount, phone) {
    if (!operator || !amount || !phone) {
      showToast('Please enter all details', 'error');
      return;
    }
    const eloadProduct = {
      id: `eload_${Date.now()}`,
      name: `${operator} Load (${phone})`,
      price: parseFloat(amount),
      isELoad: true
    };
    addToCart(eloadProduct, 1);
    setShowELoadModal(false);
    showToast(`${operator} Load added to cart`);
  }

  function selectQuantity(product, quantity) {
    addToCart(product, quantity);
    setShowQuantitySelector(null);
  }

  function removeFromCart(index) {
    setCart(prevCart => prevCart.filter((_, i) => i !== index));
    playClickSound();
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]); // Double buzz for void/remove
  }

  function updateQuantity(index, newQuantity) {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart(prevCart => prevCart.map((item, i) =>
      i === index
        ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.unitPrice }
        : item
    ));
    playClickSound();
    if (navigator.vibrate) navigator.vibrate(20); // Light tap for increment
  }

  function clearCart() {
    setCart([]);
    setCashReceived('');
    setChange(0);
    setCashBreakdown([]); // Clear cash breakdown on cart clear
    playClickSound();
  }

  function handleHoldOrder() {
    if (cart.length === 0) return;
    if (navigator.vibrate) navigator.vibrate(20);

    const newHold = {
      id: `hold_${Date.now()}`,
      cart: [...cart],
      total,
      timestamp: new Date()
    };

    setHeldOrders(prev => [newHold, ...prev].slice(0, 10)); // Keep last 10
    clearCart();
    showToast('Order held successfully');
  }

  function handleResumeOrder(holdId) {
    const hold = heldOrders.find(h => h.id === holdId);
    if (hold) {
      if (cart.length > 0) {
        if (!confirm('Current cart is not empty. Replace with held order?')) return;
      }
      setCart(hold.cart);
      setHeldOrders(prev => prev.filter(h => h.id !== holdId));
      if (navigator.vibrate) navigator.vibrate(10);
    }
  }

  function handleShareToWhatsApp() {
    const divider = "--------------------------------";
    const header = `*${currentTenant?.businessName?.toUpperCase() || 'FILIPIN POS'}*\n` +
      `_Official Digital Receipt_\n` +
      `${divider}\n` +
      `Ref: ${generateTransactionRef()}\n` +
      `Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n` +
      `${divider}\n`;

    const items = cart.map(item =>
      `${item.productName.padEnd(20)}\n${item.quantity}x ₱${item.unitPrice.toFixed(2).padStart(8)} = ₱${item.subtotal.toFixed(2).padStart(8)}`
    ).join('\n\n');

    const footer = `\n${divider}\n` +
      `*SUBTOTAL: ₱${subtotal.toFixed(2)}*\n` +
      (discount > 0 ? `DISCOUNT: -₱${discount.toFixed(2)}\n` : '') +
      `*TOTAL: ₱${total.toFixed(2)}*\n` +
      `${divider}\n` +
      `Payment: ${paymentMethod.toUpperCase()}\n` +
      (selectedCustomer ? `Customer: ${selectedCustomer.name}\n` : '') +
      `Change: ₱${change.toFixed(2)}\n\n` +
      `*Thank you for shopping!* 🇵🇭`;

    const fullText = header + items + footer;
    const encoded = encodeURIComponent(fullText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
  }

  function handleAddCustomItem(name, price) {
    const customProduct = {
      id: `custom_${Date.now()}`,
      name: name || 'Custom Item',
      price: parseFloat(price) || 0,
      isCustom: true
    };
    handleProductClick(customProduct);
    setShowCustomItemModal(false);
    if (navigator.vibrate) navigator.vibrate(15);
  }

  function handleManualQtyUpdate(cartIndex, qty) {
    const newQty = parseInt(qty);
    if (!isNaN(newQty) && newQty >= 0) {
      updateQuantity(cartIndex, newQty);
      if (navigator.vibrate) navigator.vibrate(10);
    }
    setShowManualQtyModal(null);
  }

  async function handleCashActivity(type, amount, reason) {
    try {
      if (!tenantId) return;
      const activity = {
        id: `cash_${Date.now()}`,
        tenantId,
        type, // 'in' | 'out'
        amount: parseFloat(amount) || 0,
        reason,
        timestamp: new Date(),
        userId
      };
      await db.cashActivity.add(activity);
      if (navigator.vibrate) navigator.vibrate(20);
      setShowCashOutModal(false);
      showToast(`Cash ${type} recorded: ₱${amount}`);
    } catch (error) {
      console.error('Error recording cash activity:', error);
    }
  }

  function handleVoidSale() {
    if (cart.length === 0) return;
    if (confirm('Are you sure you want to VOID this entire sale? This cannot be undone.')) {
      clearCart();
      if (navigator.vibrate) navigator.vibrate(40);
      alert('Sale Voided');
    }
  }

  async function handleCheckout() {
    if (cart.length === 0) return;

    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const total = subtotal - discount;

    // VALIDATION: Ensure payment is sufficient
    if (paymentMethod === 'cash') {
      const received = parseFloat(cashReceived || 0);
      if (received < total) {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        showToast(`Insufficient cash: ₱${received.toFixed(2)} (Total: ₱${total.toFixed(2)})`, 'error');
        return;
      }
    } else if (paymentMethod === 'utang') {
      if (!selectedCustomer) {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        showToast('Please select a customer for Utang (Credit)', 'error');
        return;
      }
    }
    const deviceId = await getDeviceId();
    const transactionRef = generateTransactionRef();
    const localId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let cashAmount = 0;
    let digitalAmount = 0;
    let utangAmount = 0;

    if (paymentMethod === 'cash') {
      cashAmount = total;
    } else if (paymentMethod === 'gcash') {
      digitalAmount = total;
    } else if (paymentMethod === 'utang' && selectedCustomer) {
      utangAmount = total;
    }

    const transactionItems = cart.map(item => ({
      id: `ti_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      transactionId: localId,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
      localId: `ti_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    }));

    const transaction = {
      id: localId,
      tenantId,
      userId,
      customerId: selectedCustomer?.id || null,
      transactionNumber: transactionRef,
      totalAmount: total,
      total: total, // Compatibility for UI
      subtotalAmount: subtotal,
      subtotal: subtotal, // Compatibility for UI
      discountAmount: discount,
      discount: discount, // Compatibility for UI
      cashAmount,
      digitalAmount,
      utangAmount,
      changeAmount: change,
      change: change, // Compatibility for UI
      paymentMethod: selectedCustomer ? 'utang' : paymentMethod,
      status: 'completed',
      transactionDate: new Date(),
      timestamp: new Date(), // Compatibility for UI
      syncStatus: 'pending',
      localId,
      deviceId,
      items: transactionItems,
      createdAt: new Date()
    };

    try {
      await db.transactions.add(transaction);
      await db.transactionItems.bulkAdd(transactionItems);

      if (selectedCustomer && utangAmount > 0) {
        const utangEntry = {
          id: `utang_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          tenantId,
          customerId: selectedCustomer.id,
          transactionId: localId,
          amount: utangAmount,
          remainingAmount: utangAmount,
          status: 'pending',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          localId: `utang_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        await db.utangLedger.add(utangEntry);
      }

      // STOCK REDUCTION: Decrement stockQuantity for each item
      for (const item of cart) {
        if (!item.isCustom) {
          const product = await db.products.get(item.productId);
          if (product) {
            const currentStock = parseFloat(product.stockQuantity || 0);
            const newStock = Math.max(0, currentStock - item.quantity);
            await db.products.update(item.productId, { stockQuantity: newStock });
            console.log(`Updated stock for ${product.name}: ${currentStock} -> ${newStock}`);
          }
        }
      }

      // Store for persistent receipt overlay
      const receiptData = {
        ...transaction,
        items: transactionItems,
        subtotal: subtotal,
        discount: discount,
        paymentMethod: paymentMethod,
        cashAmount: parseFloat(cashReceived || 0),
        change: change,
        timestamp: new Date()
      };
      setLastTransaction(receiptData);
      setShowReceiptOverlay(true);

      // Clear Cart & States (Overlay uses lastTransaction)
      clearCart();
      setSelectedCustomer(null);
      setDiscount(0);
      setPendingQuantity('');
      setCashBreakdown([]);
      setCheckoutSuccess(false);
      
      // Refresh history immediately
      await loadRecentTransactions();

      if (navigator.vibrate) navigator.vibrate([10, 100, 10]);
      showToast('Transaction Completed');

      playClickSound();
    } catch (error) {
      console.error('Error creating transaction:', error);
      showToast('Error: ' + error.message, 'error');
    }
  }

  function handleNumpadInput(value) {
    playClickSound();

    // If cash payment is selected, update cashReceived
    if (paymentMethod === 'cash') {
      if (value === 'clear') {
        setCashReceived('');
        setPendingQuantity('');
        setCashBreakdown([]);
      } else if (value === 'backspace') {
        setCashReceived(prev => prev.slice(0, -1));
        setCashBreakdown(prev => prev.slice(0, -1));
      } else if (value === '.') {
        setCashReceived(prev => prev.includes('.') ? prev : prev + '.');
      } else {
        setCashReceived(prev => prev + value);
      }
    } else {
      // Numpad-First: Store quantity for next product click
      if (value === 'clear') {
        setPendingQuantity('');
      } else if (value === 'backspace') {
        setPendingQuantity(prev => prev.slice(0, -1));
      } else if (value === '.') {
        // Don't allow decimal for quantity
        return;
      } else {
        setPendingQuantity(prev => prev + value);
      }
    }
  }

  async function handleBarcodeScan(barcode) {
    try {
      const query = createTenantQuery(tenantId, 'products');
      const products = await query.getAll();
      const product = products.find(p =>
        p.barcode === barcode || p.barcode?.toLowerCase() === barcode.toLowerCase()
      );

      if (product) {
        addToCart(product, 1);
      } else {
        // Elite Flow: Instead of alert, show a professional "Add New" prompt
        if (confirm(`Product with barcode "${barcode}" not found. Would you like to register it as a new product?`)) {
          setNewProductName('');
          setNewProductPrice('');
          setNewProductCategory('General');
          setNewProductBarcode(barcode); // Pre-fill barcode
          setShowAddProductModal(true);
        }
      }
    } catch (error) {
      console.error('Error searching product:', error);
      alert('Error: ' + error.message);
    }
  }

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.subtotal, 0), [cart]);
  const total = useMemo(() => subtotal - discount, [subtotal, discount]);

  return (
    <div
      className={`h-screen w-screen bg-[#121212] md:bg-zinc-100 text-white md:text-zinc-900 overflow-hidden flex flex-col ${sunlightMode ? 'sunlight-mode' : ''}`}
      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
      onKeyDown={(e) => {
        // Don't intercept if an input is already focused or any modal is open
        const isInputFocused = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        const isModalOpen = showCustomItemModal || showELoadModal || showManualQtyModal || showCashOutModal || showBarcodeScanner || showVariableSellingModal;

        if (isInputFocused || isModalOpen) return;

        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
            // Let the browser handle the character insertion into the focused input
          }
        }
      }}
    >
      {/* MOBILE & TABLET: Premium POS Architecture */}
      <div className="lg:hidden h-[100dvh] w-screen flex flex-col overflow-hidden bg-[#f8f9fa] selection:bg-indigo-100">
        {/* Mobile Header: Elite v2.5 Symmetric Perfection */}
        <div className="bg-white fixed top-0 inset-x-0 z-50 px-4 pt-3 pb-2 flex flex-col shadow-md border-b border-slate-200/60 backdrop-blur-md bg-white/95 transition-all">
          <div className="px-4 pt-3 pb-2 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              {/* Left: Branding & Total */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSalesHistory(true)}
                  className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md active:scale-110 relative group"
                >
                  <img src="/logo.png" className="w-5 h-5 object-contain brightness-0 invert" alt="Logo" />
                </button>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <div className={`w-1 h-1 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
                    <span className="text-[8px] font-black text-slate-400 tracking-[0.2em] leading-none uppercase">Filipin POS</span>
                  </div>
                  <div
                    className={`text-lg font-black text-slate-900 tracking-tighter tabular-nums leading-none mt-1 ${cartFlash ? 'animate-pop' : ''}`}
                    onClick={() => {
                      if (activeTab === 'pos') setMobileViewMode('cart');
                    }}
                  >
                    ₱{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Premium Segmented Tab Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  <button
                    onClick={() => { setActiveTab('pos'); if (navigator.vibrate) navigator.vibrate(10); }}
                    className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all flex flex-col items-center gap-0.5 min-w-[64px]
                          ${activeTab === 'pos' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400'}`}
                  >
                    <ScanIcon className="w-3 h-3" />
                    Kasa
                  </button>

                  <button
                    onClick={() => { setActiveTab('management'); if (navigator.vibrate) navigator.vibrate(10); }}
                    className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all flex flex-col items-center gap-0.5 min-w-[64px]
                          ${activeTab === 'management' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400'}`}
                  >
                    <ClearIcon className="w-3 h-3" />
                    Yönetim
                  </button>
              </div>
            </div>

            {/* Search Row */}
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1 group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <SearchIcon className="w-4 h-4" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Ürün ara veya tara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-9 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all outline-none"
                />
                <button
                  onClick={() => setShowBarcodeScanner(true)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 active:scale-125"
                >
                  <ScanIcon className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setShowInvoiceScanner(true)}
                className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 active:scale-90 transition-all shadow-sm"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Integrated Sales History Bar */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 mt-1 border-t border-slate-50">
              <span className="text-[7px] font-black text-slate-300 uppercase shrink-0">SON:</span>
              {recentTransactions.length === 0 ? (
                <span className="text-[7px] font-bold text-slate-200 uppercase italic">Henüz yok</span>
              ) : (
                recentTransactions.map(tx => (
                  <button
                    key={tx.id}
                    onClick={() => {
                      setLastTransaction(tx);
                      setShowReceiptOverlay(true);
                    }}
                    className="shrink-0 bg-white border border-slate-100 rounded-full px-2 py-0.5 flex items-center gap-1 active:scale-95 transition-all shadow-sm"
                  >
                    <div className="w-1 h-1 bg-emerald-400 rounded-full" />
                    <span className="text-[8px] font-black text-slate-600 tabular-nums">₱{(tx.total || 0).toFixed(0)}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Resumable Orders Strip - Integrated below header */}
          {heldOrders.length > 0 && (
            <div className="bg-amber-50/80 backdrop-blur flex gap-2 px-4 py-1.5 overflow-x-auto no-scrollbar border-t border-amber-200 animate-slide-down">
              <span className="text-[8px] font-black text-amber-600 uppercase flex-shrink-0 flex items-center">BEKLEYEN:</span>
              {heldOrders.map((hold) => (
                <button
                  key={hold.id}
                  onClick={() => handleResumeOrder(hold.id)}
                  className="bg-white px-2 py-0.5 rounded-full border border-amber-300 text-[8px] font-bold text-amber-700 whitespace-nowrap active:bg-amber-100"
                >
                  ₱{hold.total.toFixed(0)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Area: Conditional Rendering (Grid vs Hub) */}
        <div className={`flex-1 pt-[125px] ${heldOrders.length > 0 ? 'pt-[155px]' : ''} pb-1 overflow-hidden bg-white/50 relative`}>
          {activeTab === 'pos' ? (
             /* POS View */
             <div className="h-full overflow-y-auto px-4 pb-4 overscroll-contain no-scrollbar">
              {mobileViewMode === 'grid' ? (
                <div className="grid grid-cols-3 gap-3">
                  {/* Feature Buttons - Subdued Elite v2.1 */}
                  <button
                    onClick={() => { setShowCustomItemModal(true); if (navigator.vibrate) navigator.vibrate(10); }}
                    className="bg-orange-50/50 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-2 border border-orange-100 ring-1 ring-orange-200/50 active:scale-95 transition-all aspect-[4/5]"
                  >
                    <div className="text-orange-500">
                      <ScanIcon className="w-7 h-7" />
                    </div>
                    <div className="text-[10px] font-black uppercase text-orange-900 leading-tight text-center tracking-tighter">Custom Price</div>
                  </button>

                  <button
                    onClick={() => { setShowELoadModal(true); if (navigator.vibrate) navigator.vibrate(10); }}
                    className="bg-sky-50/50 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-2 border border-sky-100 ring-1 ring-sky-200/50 active:scale-95 transition-all aspect-[4/5]"
                  >
                    <div className="text-sky-500">
                      <SmartphoneIcon className="w-7 h-7" />
                    </div>
                    <div className="text-[10px] font-black uppercase text-sky-900 leading-tight text-center tracking-tighter">E-Load</div>
                  </button>

                  {filteredProducts.map((product) => {
                    const cartItemIndex = cart.findIndex(it => it.productId === product.id);
                    const cartItem = cartItemIndex > -1 ? cart[cartItemIndex] : null;
                    const { Icon, color: productColor } = getProductIcon(product.name);

                    return (
                      <div key={product.id} className="relative aspect-[4/5]">
                        <button
                          onClick={() => handleProductClick(product)}
                          className={`group bg-white rounded-2xl p-2.5 flex flex-col items-center justify-between border border-slate-200/60 active:scale-95 transition-all h-full w-full relative
                            ${poppedProductId === product.id ? 'animate-scale-pop' : ''}`}
                        >
                          <div className="flex-1 flex items-center justify-center w-full p-1 overflow-hidden">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-contain group-active:scale-110 transition-transform duration-500 ease-out"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              className="flex items-center justify-center"
                              style={{
                                color: productColor,
                                display: product.imageUrl ? 'none' : 'flex'
                              }}
                            >
                              {Icon && <Icon className="w-12 h-12 opacity-80" />}
                            </div>

                            {(product.stockQuantity || 0) < 5 && (
                              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" title="Low Stock" />
                            )}
                          </div>

                          <div className="w-full pt-1 flex flex-col items-center">
                            <div className="text-[10px] font-black text-slate-900 w-full text-center leading-tight tracking-tight px-1 truncate">
                              {product.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                               <div className="text-[11px] font-black text-indigo-600 tabular-nums">
                                ₱{Math.round(product.price)}
                               </div>
                               {product.barcode && (
                                 <div className="text-[8px] font-black text-slate-300 font-mono tracking-tighter uppercase tabular-nums">
                                   ..{product.barcode.slice(-4)}
                                 </div>
                               )}
                            </div>
                          </div>
                        </button>
                        {cartItem && (
                          <div className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            {cartItem.quantity}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Mobile Cart View */
                <div className="space-y-3 animate-scale-in">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Sepet ({cart.length})</h3>
                    <button
                      onClick={clearCart}
                      className="text-[10px] font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 active:bg-red-500 active:text-white transition-all"
                    >
                      {t('cashier.clearAll')}
                    </button>
                  </div>

                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                      <ScanIcon className="w-12 h-12 mb-3 opacity-20" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{t('cashier.noItems')}</span>
                      <button onClick={() => setMobileViewMode('grid')} className="mt-4 text-[10px] font-black text-indigo-600 uppercase border border-indigo-100 px-4 py-2 rounded-xl">Ürünlere Dön</button>
                    </div>
                  ) : (
                    cart.map((item, index) => (
                      <div key={`${item.productId}-${index}`} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-900 truncate max-w-[140px] leading-tight">{item.productName}</span>
                          <span className="text-[11px] font-bold text-indigo-600 tabular-nums">₱{item.unitPrice.toFixed(2)} / ea</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-slate-50 rounded-2xl p-1 gap-1">
                            <button
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center bg-white rounded-xl text-slate-600 shadow-sm border border-slate-100 active:bg-red-50 active:text-red-500 transition-all font-black"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-xs font-black text-slate-900 tabular-nums">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center bg-white rounded-xl text-slate-600 shadow-sm border border-slate-100 active:bg-green-50 active:text-green-500 transition-all font-black"
                            >
                              +
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(index)} className="p-2 text-slate-300 active:text-red-500"><XIcon className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
             </div>
           ) : (
              /* Management Hub View */
              <div className="h-full animate-scale-in">
                <ManagerDashboard 
                  userId={userId} 
                  tenantId={tenantId} 
                  isEmbedded={true} 
                />
              </div>
           )}
        </div>

        {/* Control Console: Optimized Thumb Zone */}
        {activeTab === 'pos' && (
          <div className="flex-shrink-0 min-h-[260px] bg-white border-t border-slate-200 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] relative z-10 p-4 flex flex-col gap-3">
            <div className="flex gap-6 flex-1 overflow-hidden">
              {/* Numpad Section: Large Accessible Buttons */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center justify-between px-2 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">{t('cashier.enterAmount')}</span>
                  <input
                    readOnly
                    type="text"
                    placeholder="0"
                    className="bg-transparent text-right text-2xl font-black text-slate-900 outline-none w-full tabular-nums pr-2"
                    value={cashReceived}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 flex-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '⌫'].map((btn) => {
                    const isAction = btn === 'C' || btn === '⌫';
                    return (
                      <button
                        key={btn}
                        onClick={() => {
                          if (navigator.vibrate) navigator.vibrate(10);
                          if (btn === 'C') handleNumpadInput('clear');
                          else if (btn === '⌫') handleNumpadInput('backspace');
                          else handleNumpadInput(btn.toString());
                        }}
                        className={`flex items-center justify-center rounded-[1.25rem] text-xl font-black transition-all shadow-sm active:scale-90
                          ${isAction
                            ? 'bg-slate-100 text-slate-400 active:bg-slate-200'
                            : 'bg-slate-50 text-slate-800 active:bg-indigo-600 active:text-white border border-slate-100'
                          }`}
                        style={{ height: '54px' }}
                      >
                        {btn}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-6 gap-2 mt-2">
                  {[20, 50, 100, 200, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => {
                        if (navigator.vibrate) navigator.vibrate(10);
                        setCashReceived(prev => {
                          const current = parseFloat(prev || 0);
                          return (current + amt).toString();
                        });
                        setPaymentMethod('cash');
                      }}
                      className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-black py-3 rounded-2xl active:bg-emerald-600 active:text-white transition-all shadow-sm"
                    >
                      ₱{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Controls - Massive Buttons */}
              <div className="w-1/3 flex flex-col gap-3">
                <button
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(20);
                    if (total > 0) {
                      setCashReceived(total.toFixed(0));
                      setPaymentMethod('cash');
                    }
                  }}
                  className={`flex-1 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 transition-all shadow-sm active:scale-90
                    ${(cashReceived && parseFloat(cashReceived) === total)
                      ? 'bg-indigo-600 text-white ring-8 ring-indigo-50'
                      : 'bg-slate-50 text-slate-400 border border-slate-200'
                    }`}
                >
                  <BanknoteIcon className="w-8 h-8" />
                  <span className="text-[11px] font-black uppercase tracking-tighter text-center">EXACT</span>
                </button>

                <button
                  onClick={() => {
                    setPaymentMethod('gcash');
                    setShowGCashQR(true);
                    if (navigator.vibrate) navigator.vibrate(10);
                  }}
                  className={`flex-1 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 transition-all shadow-sm active:scale-90
                    ${paymentMethod === 'gcash'
                      ? 'bg-blue-600 text-white ring-8 ring-blue-50'
                      : 'bg-slate-50 text-slate-400 border border-slate-200'
                    }`}
                >
                  <SmartphoneIcon className="w-8 h-8" />
                  <span className="text-[11px] font-black uppercase tracking-widest">GCash</span>
                </button>

                <button
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(30);
                    handleCheckout();
                  }}
                  className={`flex-[1.5] rounded-[2.5rem] flex flex-col items-center justify-center gap-2 transition-all shadow-2xl active:scale-95
                    ${cart.length === 0
                      ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                      : 'bg-slate-900 text-white'
                    }`}
                >
                  <CheckoutIcon className="w-10 h-10" />
                  <span className="text-[13px] font-black uppercase tracking-[0.2em] animate-pulse">DONE</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* End Mobile Shell */}

      {/* DESKTOP: Original Layout */}
      <div className="hidden lg:flex flex-col h-full w-full">
        {/* Compact Header - Sticky on Mobile */}
        <div className="bg-white border-b border-zinc-200 px-6 py-4 flex-shrink-0 sticky top-0 z-30 shadow-md backdrop-blur-md bg-white/90">
          <div className="flex items-center justify-between gap-8 max-w-[1800px] mx-auto">
            {/* Segment 1: Branding */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 transition-transform hover:scale-110">
                <img src="/logo.png" className="w-6 h-6 object-contain brightness-0 invert" alt="POS Logo" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Filipin POS</span>
                <span className="text-xs font-black text-slate-900 tracking-tight">Elite Edition</span>
              </div>
            </div>
            {/* Segment 2: Search Engine */}
            <div className="relative flex-1 max-w-xl group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <SearchIcon className="w-4 h-4" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search product code or name..."
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all outline-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button onClick={() => setShowBarcodeScanner(true)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all hover:scale-110">
                  <ScanIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Segment 3: Live Cart Summary & Change */}
            <div className="flex items-center gap-8 px-8 border-x border-zinc-100">
              <div className="flex flex-col items-center justify-center">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Order Total</span>
                <div className="text-3xl font-black text-indigo-600 tabular-nums tracking-tighter leading-none">
                  ₱{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              {change > 0 && (
                <div className="flex flex-col items-end border-l border-zinc-100 pl-8 animate-slide-right">
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Change Due</span>
                  <div className="text-2xl font-black text-emerald-600 tabular-nums leading-none">₱{change.toFixed(2)}</div>
                  {cashBreakdown.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {cashBreakdown.map((val, idx) => (
                        <div key={idx} className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[8px] font-bold border border-emerald-100">₱{val}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Segment 4: Controls & Identity */}
            <div className="flex items-center gap-6">
              {/* Specialized Modes */}
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                <button
                  onClick={() => { setIsAuditMode(!isAuditMode); setIsRefundMode(false); if (navigator.vibrate) navigator.vibrate(10); }}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${isAuditMode ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'text-slate-400 hover:text-slate-600'}
                  `}
                >
                  Audit
                </button>
                <button
                  onClick={() => { setIsRefundMode(!isRefundMode); setIsAuditMode(false); if (navigator.vibrate) navigator.vibrate(10); }}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                    ${isRefundMode ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'text-slate-400 hover:text-slate-600'}
                  `}
                >
                  Refund
                </button>
              </div>

              {/* Status Indicator */}
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-tighter">System Online</span>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tabular-nums">
                  Term-PH-001 • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout - Desktop: 75/25 Split, Tablet: 60/40 Split, Mobile: Stacked */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden pb-20 md:pb-0 bg-slate-50">
          {/* PRODUCT GRID - Full width on mobile, 75% on desktop */}
          <div className="w-full md:w-[75%] p-3 md:p-2 overflow-hidden flex flex-col md:border-r md:border-zinc-200">
            {/* Transactions History Bar */}
            <div className="mb-2 bg-slate-50 border-b border-slate-200 -mx-3 px-3 py-2 flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest shrink-0">Recent:</span>
              {recentTransactions.length === 0 ? (
                <span className="text-[8px] font-bold text-slate-300 uppercase italic">No recent history</span>
              ) : (
                recentTransactions.map(tx => (
                  <button
                    key={tx.id}
                    onClick={() => {
                      setLastTransaction(tx);
                      setShowReceiptOverlay(true);
                    }}
                    className="shrink-0 bg-white border border-slate-200 rounded-full px-3 py-1 flex items-center gap-2 active:scale-95 transition-all shadow-sm"
                  >
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] font-black text-slate-700 tabular-nums">₱{(tx.total || 0).toFixed(0)}</span>
                    <span className="text-[9px] font-bold text-slate-400">{tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </button>
                ))
              )}
            </div>
            {filteredProducts.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-sm md:text-xs text-zinc-500">{t('cashier.readyToScan')}</div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 no-scrollbar">
                {/* Product Grid: Adaptive scaling for Phone (2), Tablet (4), Desktop (5+) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 md:gap-4 p-1">
                  {filteredProducts.filter(p => p && p.id).map((product) => {
                    try {
                      const isSelected = showQuantitySelector === product.id;
                      const productName = product.name || t('cashier.unknown');
                      const productPrice = product.price || product.unitPrice || 0;
                      const { Icon, color } = getProductIcon(productName);
                      const seedProduct = SEED_PRODUCTS.find(p => p.name === productName);
                      const productImage = product.imageUrl || seedProduct?.image || null;
                      const productColor = getProductColor(productName);

                      return (
                        <div key={product.id} className="relative">
                          <button
                            onMouseDown={(e) => handleProductPress(product, e)}
                            onMouseUp={handleProductRelease}
                            onMouseLeave={handleProductRelease}
                            onTouchStart={(e) => handleProductPress(product, e)}
                            onTouchEnd={handleProductRelease}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              try {
                                handleProductClick(product);
                              } catch (error) {
                                console.error('Error clicking product:', error, product);
                              }
                            }}
                            className={`w-full bg-white rounded-xl overflow-hidden border-l-4 border-r border-t border-b border-zinc-200
                            hover:border-indigo-300 hover:shadow-md active:scale-95 transition-all flex flex-col md:flex-row items-center gap-2 p-3 md:p-1.5 relative
                            ${isSelected ? 'ring-2 ring-indigo-600 border-indigo-600 shadow-lg' : ''}`}
                            style={{
                              borderLeftColor: productColor
                            }}
                          >
                            {/* Color Stripe Indicator */}
                            <div
                              className="absolute left-0 top-0 bottom-0 w-1"
                              style={{ backgroundColor: productColor }}
                            />
                            {/* Product Image - Larger on mobile */}
                            <div className="w-16 h-16 md:w-10 md:h-10 bg-zinc-100 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center border border-zinc-200">
                              {productImage ? (
                                <img
                                  src={productImage}
                                  alt={productName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    const fallback = e.target.parentElement.querySelector('.icon-fallback');
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className={`${color} icon-fallback ${productImage ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                                {Icon && <Icon className="w-5 h-5" />}
                              </div>
                            </div>

                            {/* Product Info - Larger text on mobile */}
                            <div className="flex-1 min-w-0 text-center md:text-left mt-1 md:mt-0">
                              <div className="text-[11px] md:text-xs font-semibold text-zinc-900 truncate leading-tight">
                                {productName}
                              </div>
                              <div className="flex items-center justify-center md:justify-start gap-1">
                                <span className="text-[12px] md:text-xs font-mono font-bold text-indigo-600">
                                  ₱{productPrice.toFixed(2)}
                                </span>
                                {product.barcode && (
                                  <span className="hidden md:inline text-[8px] font-black text-slate-400 font-mono tracking-tighter uppercase">
                                    {product.barcode.slice(-4)}
                                  </span>
                                )}
                              </div>
                              {/* Always show SKU on mobile for better ID */}
                              <div className="md:hidden text-[9px] font-black text-slate-300 font-mono tracking-tighter uppercase truncate px-1">
                                SKU: {product.barcode || 'N/A'}
                              </div>
                            </div>
                          </button>

                          {/* Quantity Selector Popup */}
                          {isSelected && (
                            <div
                              ref={quantitySelectorRef}
                              className="absolute top-full left-0 right-0 mt-1 bg-white shadow-lg rounded-lg z-50 overflow-hidden border border-zinc-200"
                            >
                              <div className="p-1 space-y-0.5">
                                {[1, 5, 10, 20].map(qty => (
                                  <button
                                    key={qty}
                                    onClick={() => {
                                      try {
                                        selectQuantity(product, qty);
                                      } catch (error) {
                                        console.error('Error selecting quantity:', error);
                                      }
                                    }}
                                    className="w-full px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-indigo-50 rounded text-left transition-colors"
                                  >
                                    ×{qty}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    } catch (error) {
                      console.error('Error rendering product:', error, product);
                      return null;
                    }
                  }).filter(Boolean)}
                </div>
              </div>
            )}
          </div>

          {/* DESKTOP SIDEBAR (25%) - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:flex w-[25%] bg-white flex-col border-l border-zinc-200">
            {/* Customer Selector - Compact */}
            <div className="p-2 border-b border-zinc-200 customer-dropdown-container">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCustomerDropdown(!showCustomerDropdown);
                  }}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1.5 text-left 
                  hover:border-indigo-300 transition-all text-xs font-medium text-zinc-900 flex items-center justify-between"
                >
                  <span>{selectedCustomer ? selectedCustomer.name : t('cashier.selectCustomer')}</span>
                  <span className="text-zinc-400 text-[10px]">▼</span>
                </button>
                {showCustomerDropdown && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 bg-white shadow-xl rounded-lg z-50 max-h-48 overflow-y-auto border border-zinc-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomer(null);
                        setShowCustomerDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-xs font-medium text-zinc-900 hover:bg-indigo-50 text-left transition-colors rounded-t-lg"
                    >
                      {t('cashier.selectCustomer')}
                    </button>
                    {customers.length > 0 ? (
                      customers.map((customer, idx) => (
                        <button
                          key={customer.id || `customer-${idx}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(customer);
                            setShowCustomerDropdown(false);
                            if (paymentMethod !== 'utang') {
                              setPaymentMethod('utang');
                            }
                          }}
                          className="w-full px-3 py-2 text-xs font-medium text-zinc-900 hover:bg-indigo-50 text-left transition-colors border-t border-zinc-100"
                        >
                          {customer.name || 'Unknown'}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-xs text-zinc-500 border-t border-zinc-100">
                        No customers
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Cart List - Compact */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-500 uppercase font-black tracking-widest">{t('cashier.readyToScan')}</div>
              ) : (
                <>
                  {cart.map((item, index) => (
                    <div
                      key={index}
                      className={`bg-white border border-zinc-200 rounded-lg p-1.5 transition-all ${cartFlash ? 'cart-flash' : ''
                        }`}
                    >
                      {/* Compact Single-Line Layout */}
                      <div className="flex items-center gap-2">
                        {/* Product Name */}
                        <div className="flex-1 min-w-0 text-left">
                          <div className="text-xs font-semibold text-zinc-900 truncate">
                            {item.productName}
                          </div>
                        </div>

                        {/* Quantity Controls - Inline */}
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            className="w-5 h-5 bg-zinc-100 hover:bg-zinc-200 rounded text-[10px] font-bold text-zinc-700 transition-colors flex items-center justify-center"
                          >
                            −
                          </button>
                          <div className="w-6 text-center text-xs font-mono font-semibold text-zinc-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {item.quantity}
                          </div>
                          <button
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            className="w-5 h-5 bg-zinc-100 hover:bg-zinc-200 rounded text-[10px] font-bold text-zinc-700 transition-colors flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>

                        {/* Price - Compact */}
                        <div className="text-xs font-mono font-bold text-indigo-600 w-16 text-right flex-shrink-0" style={{ fontVariantNumeric: 'tabular-nums' }}>
                          ₱{item.subtotal.toFixed(2)}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(index)}
                          className="w-5 h-5 bg-red-50 border border-red-200 hover:bg-red-100 rounded flex items-center justify-center transition-colors flex-shrink-0"
                        >
                          <ClearIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                  {cart.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={clearCart}
                        className="flex-1 px-2 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-xs font-medium text-zinc-700 transition-colors border border-zinc-200"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => setShowDiscountInput(true)}
                        className="px-2 py-1 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-xs font-medium text-yellow-700 transition-colors border border-yellow-200"
                      >
                        {discount > 0 ? `-₱${discount.toFixed(2)}` : 'Discount'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Premium Summary Card - Total & Change */}
            {cart.length > 0 && (
              <div className={`px-4 py-4 border-t border-zinc-200 bg-gradient-to-br from-zinc-50 to-white transition-all ${cartFlash ? 'cart-flash' : ''}`}>
                <div className="space-y-3">
                  {/* Subtotal */}
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-600">Subtotal</span>
                      <span className="font-mono font-semibold text-zinc-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        ₱{subtotal.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Discount */}
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-600">Discount</span>
                      <span className="font-mono font-semibold text-red-600" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        -₱{discount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
                    <span className="text-base font-bold text-zinc-900">Total</span>
                    <span className="text-2xl font-bold font-mono text-indigo-600" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      ₱{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Change Calculator - Large Display for Cash Payment */}
            {paymentMethod === 'cash' && (
              <div className="px-4 py-4 border-t border-zinc-200 bg-white space-y-4">
                <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                  {t('cashier.cashReceived')}
                </div>

                {/* Quick Cash Buttons */}
                <div className="grid grid-cols-3 gap-2 flex-1">
                  {[1000, 500, 200, 100, 50, 20].map((val) => (
                    <button
                      key={val}
                      onClick={() => {
                        const newVal = (parseFloat(cashReceived) || 0) + val;
                        setCashReceived(newVal.toString());
                        setCashBreakdown(prev => [...prev, val]);
                        if (navigator.vibrate) navigator.vibrate(10);
                      }}
                      className="h-12 bg-white border-2 border-slate-100 rounded-xl font-black text-xs text-slate-700 hover:border-indigo-300 hover:text-indigo-600 active:scale-95 transition-all shadow-sm"
                    >
                      ₱{val}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setCashReceived(total.toString());
                      setCashBreakdown([total]);
                      if (navigator.vibrate) navigator.vibrate(10);
                    }}
                    className="col-span-3 h-12 bg-indigo-50 border-2 border-indigo-100 rounded-xl font-black text-xs text-indigo-600 hover:bg-indigo-100 active:scale-95 transition-all animate-glow"
                  >
                    Exact Amount (₱{total.toFixed(0)})
                  </button>
                </div>

                <input
                  type="text"
                  value={cashReceived}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    setCashReceived(val);
                  }}
                  placeholder="0.00"
                  className="w-full text-2xl font-bold text-zinc-900 font-mono bg-zinc-50 border-2 border-zinc-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                  autoFocus={paymentMethod === 'cash' && !cashReceived}
                />

                {/* Change Display - Premium Card */}
                {change > 0 && (
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-xs text-emerald-700 font-medium mb-2 uppercase tracking-wider">
                      {t('cashier.change')}
                    </div>
                    <div className="text-3xl font-bold text-emerald-600 font-mono" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      ₱{change.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Discount Input */}
            {cart.length > 0 && (
              <div className="p-2 border-t border-zinc-200">
                {showDiscountInput ? (
                  <div className="space-y-1">
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder="Discount amount"
                      className="w-full text-xs font-mono bg-white border border-zinc-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        setShowDiscountInput(false);
                        if (discount === 0) setDiscount(0);
                      }}
                      className="w-full bg-zinc-100 hover:bg-zinc-200 rounded-lg p-1 text-xs font-medium text-zinc-700 transition-colors border border-zinc-200"
                    >
                      Done
                    </button>
                  </div>
                ) : discount > 0 ? (
                  <button
                    onClick={() => setShowDiscountInput(true)}
                    className="w-full bg-yellow-50 hover:bg-yellow-100 rounded-lg p-1.5 text-xs font-semibold text-yellow-700 transition-colors border border-yellow-200"
                  >
                    Discount: ₱{discount.toFixed(2)}
                  </button>
                ) : null}
              </div>
            )}

            {/* Numpad Toggle Button */}
            {paymentMethod !== 'cash' && (
              <div className="p-2 border-t border-zinc-200">
                <button
                  onClick={() => setShowNumpad(!showNumpad)}
                  className="w-full bg-zinc-100 hover:bg-zinc-200 rounded-lg p-2 text-xs font-semibold text-zinc-700 transition-colors border border-zinc-200"
                >
                  {showNumpad ? 'Hide' : 'Show'} Numpad
                </button>
              </div>
            )}

            {/* Premium Numpad - Only show when needed */}
            {(showNumpad || paymentMethod === 'cash') && (
              <div className="p-4 border-t border-zinc-200 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'backspace'].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleNumpadInput(num)}
                      className="bg-zinc-100 hover:bg-zinc-200 active:scale-95 rounded-2xl p-4 
                      font-semibold text-base text-zinc-900 transition-all shadow-sm hover:shadow-md
                      active:bg-zinc-200"
                      style={{
                        border: 'none',
                        touchAction: 'manipulation'
                      }}
                    >
                      {num === 'backspace' ? (
                        <div className="flex items-center justify-center">
                          <BackspaceIcon />
                        </div>
                      ) : (
                        num
                      )}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handleNumpadInput('clear')}
                  className="w-full bg-zinc-100 hover:bg-zinc-200 rounded-2xl p-3 text-sm font-semibold text-zinc-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  style={{ border: 'none' }}
                >
                  <XIcon />
                  <span>{t('common.clear')}</span>
                </button>
              </div>
            )}

            {/* Premium Payment Methods - Horizontal Toggle */}
            <div className="p-4 border-t border-zinc-200">
              <div className="text-xs text-zinc-500 font-medium mb-3 uppercase tracking-wider">
                Payment Method
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setPaymentMethod('cash');
                    if (total > 0 && !cashReceived) {
                      setCashReceived(total.toFixed(2));
                    }
                  }}
                  className={`rounded-2xl p-4 transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2
                  ${paymentMethod === 'cash'
                      ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white ring-2 ring-indigo-500 ring-offset-2'
                      : 'bg-white border border-zinc-200 hover:border-indigo-300 text-zinc-900'
                    }`}
                >
                  <BanknoteIcon />
                  <span className="text-sm font-semibold">{t('cashier.cash')}</span>
                </button>
                <button
                  onClick={() => {
                    setPaymentMethod('gcash');
                    setShowGCashQR(true);
                  }}
                  className={`rounded-2xl p-4 transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2
                  ${paymentMethod === 'gcash'
                      ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white ring-2 ring-indigo-500 ring-offset-2'
                      : 'bg-white border border-zinc-200 hover:border-indigo-300 text-zinc-900'
                    }`}
                >
                  <SmartphoneIcon />
                  <span className="text-sm font-semibold">{t('cashier.gcash')}</span>
                </button>
              </div>
              {selectedCustomer && (
                <button
                  onClick={() => setPaymentMethod('utang')}
                  className={`w-full mt-3 rounded-2xl p-4 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2
                  ${paymentMethod === 'utang'
                      ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white ring-2 ring-indigo-500 ring-offset-2'
                      : 'bg-white border border-zinc-200 hover:border-indigo-300 text-zinc-900'
                    }`}
                >
                  <span className="text-sm font-semibold">Utang</span>
                </button>
              )}
            </div>

            {/* Hold Order & Checkout Buttons */}
            <div className="p-4 border-t border-zinc-200 space-y-3">
              {cart.length > 0 && (
                <button
                  onClick={handleHoldOrder}
                  className="w-full h-11 rounded-xl p-2 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-all border border-zinc-200"
                >
                  {t('cashier.parkOrder')}
                </button>
              )}
              {heldOrders.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-zinc-500 font-medium mb-1">Held Orders ({heldOrders.length})</div>
                  {heldOrders.slice(0, 3).map(order => (
                    <button
                      key={order.id}
                      onClick={() => handleResumeOrder(order.id)}
                      className="w-full h-11 rounded-xl p-2 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all border border-blue-200 text-left"
                    >
                      <div className="truncate">₱{order.total.toFixed(2)} • {order.cart.length} items</div>
                    </button>
                  ))}
                </div>
              )}

              {/* One-Tap Payment (Exact Amount) */}
              {paymentMethod === 'cash' && cashReceived && parseFloat(cashReceived) === total && total > 0 && (
                <button
                  onClick={handleCheckout}
                  className="w-full rounded-lg p-2.5 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all border border-emerald-600"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <CheckoutIcon />
                    <span>Exact Amount - {t('cashier.checkout')}</span>
                  </div>
                </button>
              )}

              {/* Premium Checkout Button - Massive & Floating with Pulse */}
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className={`w-full rounded-2xl p-4 text-base font-bold transition-all shadow-lg hover:shadow-xl
                ${cart.length === 0
                    ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                    : paymentMethod === 'cash' && cashReceived && parseFloat(cashReceived) === total
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 animate-pulse'
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700'
                  }`}
                style={{
                  transform: cart.length > 0 ? 'translateY(0)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckoutIcon />
                  <span>{t('cashier.checkout')}</span>
                  {cart.length > 0 && (
                    <span className="font-mono text-sm opacity-90" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      ₱{total.toFixed(2)}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* End Desktop Layout */}

      {/* MODALS SECTION */}

      {/* Open Item (Custom Price) Modal */}
      {showCustomItemModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCustomItemModal(false)} />
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl relative animate-scale-in">
            <h3 className="text-lg font-black text-slate-900 mb-4">{t('cashier.addCustomItem')}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{t('cashier.reason')}</label>
                <input
                  autoFocus
                  type="text"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder={t('cashier.customItem')}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{t('cashier.amount')} (₱)</label>
                <input
                  type="number"
                  value={customItemPrice}
                  onChange={(e) => setCustomItemPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="0.00"
                />
              </div>
              <button
                onClick={() => {
                  handleAddCustomItem(customItemName, customItemPrice);
                  setCustomItemName('');
                  setCustomItemPrice('');
                }}
                className="w-full bg-slate-900 text-white rounded-2xl py-4 font-bold active:scale-95 transition-all shadow-lg"
              >
                {t('cashier.addToCart')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Quantity Modal */}
      {showManualQtyModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowManualQtyModal(null)} />
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl relative animate-scale-in">
            <h3 className="text-sm font-black text-slate-900 mb-4 uppercase">Set Quantity: <span className="text-indigo-600 truncate">{showManualQtyModal.product.name}</span></h3>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[1, 2, 5, 10, 20, 50].map(val => (
                <button
                  key={val}
                  onClick={() => handleManualQtyUpdate(showManualQtyModal.cartIndex, val)}
                  className="bg-slate-50 border border-slate-200 rounded-xl py-3 font-bold text-slate-600 active:bg-indigo-600 active:text-white transition-all"
                >
                  {val}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                id="manualQtyInput"
                autoFocus
                type="number"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 placeholder:text-slate-400 tabular-nums outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={t('cashier.custom')}
              />
              <button
                onClick={() => {
                  const val = document.getElementById('manualQtyInput').value;
                  handleManualQtyUpdate(showManualQtyModal.cartIndex, val);
                }}
                className="bg-slate-900 text-white px-6 rounded-xl font-bold"
              >
                {t('cashier.done')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cash Activity (Pay-Out) Modal */}
      {showCashOutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCashOutModal(false)} />
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl relative animate-scale-in">
            <h3 className="text-lg font-black text-slate-900 mb-4">{t('cashier.cashManagement')}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-emerald-50 text-emerald-700 font-bold py-2 rounded-xl ring-2 ring-emerald-100">{t('cashier.payIn')}</button>
                <button className="bg-slate-50 text-slate-400 font-bold py-2 rounded-xl border border-slate-200">{t('cashier.payOut')}</button>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{t('cashier.reason')}</label>
                <input id="cashReason" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500" placeholder={t('cashier.searchPlaceholder')} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{t('cashier.amount')} (₱)</label>
                <input id="cashAmount" type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
              </div>
              <button
                onClick={() => {
                  const reason = document.getElementById('cashReason').value;
                  const amount = document.getElementById('cashAmount').value;
                  handleCashActivity('out', amount, reason);
                }}
                className="w-full bg-red-500 text-white rounded-2xl py-4 font-bold"
              >
                {t('cashier.recordWithdrawal')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Overlay */}
      {checkoutSuccess && (
        <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-xs w-full shadow-2xl animate-scale-in text-center border border-zinc-100">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-100">
              <CheckCircleIcon className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-zinc-900 mb-2 uppercase">{t('cashier.transactionComplete')}</h3>
            <div className="text-3xl font-black text-indigo-600 font-mono mb-8">₱{total.toFixed(2)}</div>

            <div className="space-y-3">
              <button
                onClick={handleShareToWhatsApp}
                className="w-full bg-emerald-600 text-white rounded-2xl py-4 font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-200"
              >
                <SmartphoneIcon className="w-5 h-5" />
                Share to WhatsApp
              </button>
              <button
                onClick={() => setCheckoutSuccess(false)}
                className="w-full bg-zinc-900 text-white rounded-2xl py-4 font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowBarcodeScanner(false)}
          tenantId={tenantId}
        />
      )}

      {/* GCash QR Code Modal */}
      {showGCashQR && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-zinc-200 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-zinc-900">{t('cashier.gcash')} QR Code</h3>
              <button
                onClick={() => setShowGCashQR(false)}
                className="w-8 h-8 bg-zinc-100 hover:bg-zinc-200 rounded-lg flex items-center justify-center transition-colors"
              >
                <ClearIcon />
              </button>
            </div>
            <div className="bg-white rounded-xl p-4 flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
              <img
                src="/qrph_placeholder_1773558830609.png"
                alt="QRPh Code"
                className="w-48 h-48 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GCash-Payment-Demo';
                }}
              />
            </div>
            <div className="text-center text-sm text-zinc-600 mb-4">
              {t('cashier.scanQrCode')}
            </div>
            <div className="text-center text-xs font-mono text-zinc-500 mb-4">
              {currentTenant?.businessName || t('common.store')} {t('cashier.gcash')}: +63 XXX XXX XXXX
            </div>
            <button
              onClick={() => {
                setShowGCashQR(false);
                handleCheckout();
              }}
              className="w-full bg-indigo-600 text-white rounded-lg p-3 text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              {t('cashier.paymentReceived')}
            </button>
          </div>
        </div>
      )}

      {/* Variable Selling (Tingi-Tingi) Modal */}
      {showVariableSellingModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowVariableSellingModal(null)} />
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl relative animate-scale-in">
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase text-center">{showVariableSellingModal.name}</h3>
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Select Price Point (Tingi)</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[5, 10, 20, 50].map(price => (
                <button
                  key={price}
                  onClick={() => {
                    const customProduct = {
                      ...showVariableSellingModal,
                      id: `${showVariableSellingModal.id}_${price}`,
                      name: `${showVariableSellingModal.name} (₱${price})`,
                      price: price
                    };
                    addToCart(customProduct, 1);
                    setShowVariableSellingModal(null);
                    showToast(`${showVariableSellingModal.name} ₱${price} added`);
                  }}
                  className="bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 font-black text-lg text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all active:scale-95"
                >
                  ₱{price}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div className="relative">
                <input
                  id="customTingiPrice"
                  type="number"
                  autoFocus
                  placeholder="Custom Amount"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-center text-lg font-black focus:border-indigo-500 focus:bg-white transition-all outline-none"
                />
              </div>
              <button
                onClick={() => {
                  const price = parseFloat(document.getElementById('customTingiPrice').value);
                  if (price > 0) {
                    const customProduct = {
                      ...showVariableSellingModal,
                      id: `${showVariableSellingModal.id}_custom_${Date.now()}`,
                      name: `${showVariableSellingModal.name} (₱${price})`,
                      price: price
                    };
                    addToCart(customProduct, 1);
                    setShowVariableSellingModal(null);
                  }
                }}
                className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg"
              >
                {t('common.confirm')}
              </button>
              <button
                onClick={() => setShowVariableSellingModal(null)}
                className="w-full py-2 text-slate-400 text-[10px] font-black uppercase tracking-widest"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
      {showUtangModal && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => setShowUtangModal(false)} />
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900 uppercase">{t('cashier.utangMode')}</h3>
              <button
                onClick={() => setShowUtangModal(false)}
                className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center active:scale-95 transition-all"
              >
                <XIcon />
              </button>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">{t('cashier.customerName')}</label>
                <input
                  autoFocus
                  type="text"
                  placeholder={t('cashier.typeToSearch')}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-base font-bold focus:border-indigo-500 focus:bg-white transition-all outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="max-h-56 overflow-y-auto no-scrollbar space-y-2">
                {customers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                  customers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(customer => (
                    <button
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setPaymentMethod('utang');
                        setShowUtangModal(false);
                        handleCheckout();
                        if (navigator.vibrate) navigator.vibrate(10);
                      }}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl border border-slate-100 transition-all group active:scale-95"
                    >
                      <span className="font-bold text-slate-700">{customer.name}</span>
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-100 px-3 py-1.5 rounded-xl transition-all uppercase tracking-tighter">{t('common.confirm')}</span>
                    </button>
                  ))
                ) : (
                  <div className="space-y-3">
                    {searchQuery.length > 0 ? (
                      <button
                        onClick={async () => {
                          try {
                            const newCustomer = {
                              id: `cust_${Date.now()}`,
                              tenantId,
                              name: searchQuery,
                              isActive: true,
                              createdAt: new Date()
                            };
                            await db.customers.add(newCustomer);
                            setSelectedCustomer(newCustomer);
                            setPaymentMethod('utang');
                            setCustomers(prev => [...prev, newCustomer]);
                            setShowUtangModal(false);
                            handleCheckout();
                            showToast('Customer Created & Debt Recorded');
                            if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
                          } catch (err) {
                            console.error('Failed to create customer:', err);
                            showToast(t('common.error'), 'error');
                          }
                        }}
                        className="w-full p-6 bg-slate-900 text-white rounded-[2rem] flex flex-col items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-slate-200"
                      >
                        <PlusIcon className="w-8 h-8 text-indigo-400" />
                        <div className="text-center">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-slate-400">Register & Record Debt</div>
                          <div className="text-lg font-black">{searchQuery}</div>
                        </div>
                      </button>
                    ) : (
                      <div className="text-center py-12 text-slate-300">
                        <NotebookIcon className="w-12 h-12 mx-auto mb-2 opacity-10" />
                        <div className="text-[10px] font-black uppercase tracking-widest">{t('cashier.typeToSearch')}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">{t('cashier.amountToDebt')}</span>
                  <span className="text-2xl font-black text-slate-900 font-mono">₱{total.toFixed(0)}</span>
                </div>
                <button
                  onClick={() => setShowUtangModal(false)}
                  className="w-full py-2.5 text-slate-400 text-xs font-black uppercase tracking-widest hover:text-slate-600 active:scale-95 transition-all"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Professional Toast Notifications */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none w-full max-w-xs transition-all">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up pointer-events-auto border backdrop-blur-md
              ${toast.type === 'error'
                ? 'bg-red-500/90 text-white border-red-400'
                : 'bg-slate-900/90 text-white border-slate-700'
              }`}
          >
            {toast.type === 'error' ? <XIcon /> : <CheckCircleIcon />}
            <span className="text-xs font-black uppercase tracking-tight">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Drawer Audit (Cash Count) Modal - COMPACT V2 */}
      {showDrawerAudit && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowDrawerAudit(false)} />
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-6 shadow-2xl relative animate-scale-in">
            <h3 className="text-lg font-black text-slate-900 mb-1 uppercase text-center">{t('cashier.drawerAudit')}</h3>
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Cash Reconciliation</p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
              {[1000, 500, 200, 100, 50, 20, 10, 5, 1].map(denom => (
                <div key={denom} className="flex items-center bg-slate-50 border border-slate-100 rounded-xl p-2 gap-2">
                  <div className="w-8 text-[10px] font-black text-slate-400">₱{denom}</div>
                  <div className="flex-1 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setDrawerCounts(prev => ({ ...prev, [denom]: Math.max(0, (prev[denom] || 0) - 1) }))}
                      className="w-5 h-5 bg-white rounded-lg flex items-center justify-center text-slate-400 border border-slate-200"
                    >
                      -
                    </button>
                    <span className="text-xs font-black text-slate-900 w-4 text-center">{drawerCounts[denom] || 0}</span>
                    <button
                      onClick={() => setDrawerCounts(prev => ({ ...prev, [denom]: (prev[denom] || 0) + 1 }))}
                      className="w-5 h-5 bg-white rounded-lg flex items-center justify-center text-slate-400 border border-slate-200"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-indigo-600 rounded-2xl p-4 mb-4 text-white flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Total in Drawer</span>
              <span className="text-xl font-black tabular-nums">
                ₱{Object.entries(drawerCounts).reduce((sum, [denom, count]) => sum + (parseInt(denom) * count), 0).toLocaleString()}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowDrawerAudit(false);
                  showToast('Drawer Reconciled');
                }}
                className="w-full bg-slate-900 text-white rounded-2xl py-3 text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg"
              >
                Save Audit
              </button>
              <button
                onClick={() => setShowDrawerAudit(false)}
                className="w-full py-1 text-slate-400 text-[9px] font-black uppercase tracking-widest"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Invoice Scanner (Stock Inflow) - POLISHED & CLARIFIED */}
      {showInvoiceScanner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-xl" onClick={() => setShowInvoiceScanner(false)} />
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl relative animate-scale-in flex flex-col">
            <div className="text-center mb-4">
              <h3 className="text-lg font-black text-slate-900 uppercase">Supplier Receipt Scanner</h3>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Automatic Inventory Update</p>
            </div>

            {/* Explainer / Onboarding */}
            <div className="bg-indigo-50 rounded-2xl p-4 mb-4 border border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                  <NotebookIcon className="text-white w-5 h-5" />
                </div>
                <div className="text-[10px] font-bold text-slate-600 leading-tight">
                  Point your camera at a <span className="text-indigo-700">Stock Purchase Receipt</span> or <span className="text-indigo-700">Invoice</span> to automatically update your SKU quantities.
                </div>
              </div>
            </div>

            {/* Step 1: Capture Area */}
            <div className="aspect-[4/3] bg-slate-950 rounded-3xl relative overflow-hidden mb-4 border-2 border-slate-200">
              <div className="absolute inset-0 border-[15px] border-slate-950/40 z-10" />
              <div className="relative aspect-video bg-slate-900 rounded-3xl overflow-hidden mb-6 border-4 border-slate-100 shadow-inner group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2 group-hover:scale-110 transition-transform">
                    <ScanIcon className="w-12 h-12 text-white/20 mx-auto" />
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Live Scanner Active</p>
                  </div>
                </div>

                {/* Manual Upload Trigger */}
                <label className="absolute inset-0 cursor-pointer z-30 flex items-center justify-center bg-slate-900/40 opacity-0 hover:opacity-100 backdrop-blur-sm transition-all">
                  <input type="file" className="hidden" onChange={() => showToast('Image uploaded, analyzing...')} />
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white text-indigo-600 rounded-full flex items-center justify-center mb-2 mx-auto shadow-xl">
                      <PlusIcon />
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Upload File Manually</span>
                  </div>
                </label>

                <div className="absolute inset-[30px] border-2 border-dashed border-white/20 rounded-2xl z-10 pointer-events-none flex flex-col items-center justify-center">
                  <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.3em]">Align Receipt Text Here</span>
                </div>
                <div className="absolute inset-x-0 top-0 h-1 bg-indigo-400 shadow-[0_0_20px_indigo] animate-laser-scan z-20 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Detected Line-Items</span>
                <span className="text-[8px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md">Smart-Matched</span>
              </div>

              {/* Example Scanned Item with Manual Match option */}
              <div className="bg-white border border-slate-100 rounded-[2rem] p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                    <div className="text-xs font-black">48x</div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900">Nestle Milo 240ml</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Supplier SKU: N-MIL-240</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-black text-slate-900 tabular-nums">₱600.00</span>
                  <button className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase tracking-widest border border-indigo-100">Re-Match</button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 border-dashed rounded-[1.5rem] flex items-center justify-center">
                <button className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">+ Add Line Item Manually</button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowInvoiceScanner(false);
                  showToast('Inventory Updated Successfully');
                  if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
                }}
                className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-black uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95 transition-all text-sm"
              >
                Confirm & Record Stock
              </button>
              <button
                onClick={() => setShowInvoiceScanner(false)}
                className="w-full py-2 text-slate-400 text-[10px] font-black uppercase tracking-widest text-center"
              >
                Skip / Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* E-Load (Smart/Globe/Palawan) Modal - NEW */}
      {showELoadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowELoadModal(false)} />
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl relative animate-scale-in">
            <h3 className="text-lg font-black text-slate-900 mb-4 uppercase">Direct E-Load</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {['Smart', 'Globe', 'DITO', 'Palawan'].map(op => (
                  <button
                    key={op}
                    onClick={() => setEloadOperator(op)}
                    className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all
                      ${eloadOperator === op ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 border border-slate-200'}
                    `}
                  >
                    {op}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Phone Number</label>
                <input
                  type="tel"
                  value={eloadPhone}
                  onChange={(e) => setEloadPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0917 XXX XXXX"
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Load Amount (₱)</label>
                <input
                  type="number"
                  value={eloadAmount}
                  onChange={(e) => setEloadAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-black outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
              <button
                onClick={() => {
                  handleELoadSale(eloadOperator, eloadAmount, eloadPhone);
                  setEloadPhone('');
                  setEloadAmount('');
                }}
                className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg"
              >
                Add Load to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sales History Overlay - MOBILE FIX */}
      {showSalesHistory && (
        <div className="fixed inset-0 z-[110] flex flex-col bg-slate-50 animate-slide-up">
           <div className="bg-white px-4 pt-12 pb-4 shadow-sm flex items-center justify-between border-b border-slate-200">
              <h2 className="text-xl font-black text-slate-900 uppercase">Sales History</h2>
              <button 
                onClick={() => setShowSalesHistory(false)}
                className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"
              >
                <XIcon />
              </button>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(recentTransactions || []).map(tx => (
                <button
                  key={tx.id}
                  onClick={() => {
                    setLastTransaction(tx);
                    setShowReceiptOverlay(true);
                  }}
                  className="w-full bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black">
                         {tx.paymentMethod === 'utang' ? 'UT' : '₱'}
                      </div>
                      <div className="flex flex-col text-left">
                         <span className="text-sm font-black text-slate-900">₱{(tx.total || tx.totalAmount || 0).toFixed(2)}</span>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                           {tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown'}
                         </span>
                      </div>
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-lg">
                        {tx.paymentMethod?.toUpperCase()}
                      </span>
                   </div>
                </button>
              ))}
           </div>
        </div>
      )}
      {/* Persistent Receipt Overlay - Root Level for Z-Index Reliability */}
      {showReceiptOverlay && lastTransaction && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => !autoCloseReceipt && setShowReceiptOverlay(false)} />
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl relative animate-scale-in flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Receipt Preview</h3>
              <button
                onClick={() => setShowReceiptOverlay(false)}
                className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center active:scale-95 transition-all text-slate-400"
              >
                <XIcon />
              </button>
            </div>

            {/* Thermal Style Receipt Content */}
            <div className="flex-1 overflow-y-auto bg-white rounded-3xl p-6 font-mono text-[10px] text-slate-700 leading-relaxed shadow-inner border border-slate-100 receipt-content">
              <div className="text-center mb-4">
                <div className="text-[12px] font-black text-slate-900 uppercase tracking-tighter">{currentTenant?.name || 'FILIPIN POS'}</div>
                <div className="text-[8px] font-bold opacity-60">Terminal #{terminalId}</div>
                <div className="text-[8px] font-bold opacity-60 mt-0.5">{new Date(lastTransaction.timestamp || lastTransaction.transactionDate).toLocaleString()}</div>
              </div>

              <div className="border-t border-dashed border-slate-300 my-3" />

              <div className="space-y-2">
                {(lastTransaction.items || []).map((item, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="font-bold uppercase">{item.productName}</span>
                      <span className="text-[8px] opacity-60">{item.quantity} x ₱{item.unitPrice.toFixed(2)}</span>
                    </div>
                    <span className="font-bold">₱{item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-slate-300 my-3" />

              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>SUBTOTAL</span>
                  <span>₱{(lastTransaction.subtotal || lastTransaction.subtotalAmount || 0).toFixed(2)}</span>
                </div>
                {(lastTransaction.discount || lastTransaction.discountAmount || 0) > 0 && (
                  <div className="flex justify-between text-indigo-600 font-bold">
                    <span>DISCOUNT</span>
                    <span>-₱{(lastTransaction.discount || lastTransaction.discountAmount || 0).toFixed(2)}</span>
                  </div>
                )}
                {(lastTransaction.loyaltyRedeemed || 0) > 0 && (
                  <div className="flex justify-between text-indigo-600 font-bold">
                    <span>POINTS REDEEMED</span>
                    <span>-₱{(lastTransaction.loyaltyRedeemed || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 pt-2">
                  <span>TOTAL</span>
                  <span>₱{(lastTransaction.total || lastTransaction.totalAmount || 0).toFixed(2)}</span>
                </div>
                {lastTransaction.paymentMethod === 'cash' && (
                  <div className="flex justify-between text-[10px] font-bold text-slate-900 border-t border-dashed border-slate-200 pt-2 mt-2 uppercase">
                    <span>{t('cashier.cashReceived')}</span>
                    <span>₱{(lastTransaction.cashAmount || lastTransaction.cashReceived || 0).toFixed(2)}</span>
                  </div>
                )}
                {lastTransaction.paymentMethod === 'cash' && (
                  <div className="flex justify-between text-[10px] font-black text-emerald-600 mt-1 uppercase">
                    <span>{t('cashier.change')}</span>
                    <span>₱{(lastTransaction.change || lastTransaction.changeAmount || 0).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-dashed border-slate-300 my-3" />
              <div className="text-center text-[8px] font-bold opacity-40 uppercase tracking-[0.2em] py-2">
                *** THANK YOU ***
              </div>
            </div>

            {/* Actions & Done Button */}
            <div className="pt-6 space-y-4">
              <button
                onClick={() => window.print()}
                className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3"
              >
                <PrinterIcon className="w-5 h-5 text-emerald-400 animate-pulse" />
                Print Receipt
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleShareToWhatsApp(lastTransaction)}
                  className="flex items-center justify-center gap-2 bg-emerald-500 text-white rounded-2xl py-3.5 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-md"
                >
                  <SmartphoneIcon className="w-4 h-4" />
                  WhatsApp
                </button>
                <button
                  onClick={() => handleShareToViber(lastTransaction)}
                  className="flex items-center justify-center gap-2 bg-indigo-500 text-white rounded-2xl py-3.5 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-md"
                >
                  <SmartphoneIcon className="w-4 h-4" />
                  Viber
                </button>
              </div>

              <div className="flex items-center justify-between px-2 gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="receiptPersistenceRoot"
                    checked={autoCloseReceipt}
                    onChange={(e) => setAutoCloseReceipt(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="receiptPersistenceRoot" className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Auto-close</label>
                </div>
                <button
                  onClick={() => {
                    setShowReceiptOverlay(false);
                    if (navigator.vibrate) navigator.vibrate(10);
                  }}
                  className="flex-1 bg-slate-100 text-slate-900 rounded-2xl py-4 font-black uppercase tracking-widest active:scale-95 transition-all border border-slate-200 text-center"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
