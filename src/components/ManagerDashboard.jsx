// ============================================
// INDUSTRIAL MATTE MANAGER DASHBOARD
// Swiss Bank Terminal / Professional ERP Style
// No neon, no glows, no eye-candy - Pure Professional
// ============================================

import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n/i18n-context.jsx';
import { useGlobalStore } from '../store/GlobalStore.jsx';
import { createTenantQuery } from '../utils/tenantIsolation.js';
import { 
  isLowStock, 
  getLowStockSeverity, 
  isExpiringSoon, 
  getDaysUntilExpiration,
  getProductsNeedingAttention,
  getTopProfitableProducts
} from '../utils/inventoryIntelligence.js';
import { db } from '../db/dexie-schema.js';
import ZReport from './ZReport.jsx';
import UtangTracker from './UtangTracker.jsx';
import Inventory from './Inventory.jsx';

export default function ManagerDashboard({ userId, tenantId }) {
  const { t, changeLanguage, language } = useI18n();
  const { currentTenant, currentUser } = useGlobalStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState({
    todaySales: 0,
    totalRevenue: 0,
    cashSales: 0,
    digitalSales: 0,
    utangTotal: 0,
    lowStockCount: 0,
    utangList: [],
    lowStockItems: []
  });

  useEffect(() => {
    if (tenantId) {
      loadDashboardStats();
    }
  }, [tenantId]);

  async function loadDashboardStats() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const query = createTenantQuery(tenantId, 'transactions');
      const todayTransactions = await query.getAll().then(txs => 
        txs.filter(tx => new Date(tx.transactionDate) >= today)
      );

      const todaySales = todayTransactions.length;
      const totalRevenue = todayTransactions.reduce((sum, tx) => sum + (parseFloat(tx.totalAmount) || 0), 0);
      const cashSales = todayTransactions.reduce((sum, tx) => sum + (parseFloat(tx.cashAmount) || 0), 0);
      const digitalSales = todayTransactions.reduce((sum, tx) => sum + (parseFloat(tx.digitalAmount) || 0), 0);

      // Utang entries
      const utangQuery = createTenantQuery(tenantId, 'utangLedger');
      const utangEntries = await utangQuery.whereMultiple({ 
        status: 'pending' 
      }).then(entries => entries.filter(e => e.status === 'pending' || e.status === 'partial'));

      const utangTotal = utangEntries.reduce((sum, entry) => sum + (parseFloat(entry.remainingAmount) || 0), 0);

      // Get top utang customers
      const customerQuery = createTenantQuery(tenantId, 'customers');
      const customers = await customerQuery.getAll();
      const utangList = utangEntries.slice(0, 5).map(entry => {
        const customer = customers.find(c => c.id === entry.customerId);
        return {
          ...entry,
          customerName: customer?.name || 'Unknown',
          amount: parseFloat(entry.remainingAmount || 0)
        };
      });

      // Smart Inventory - Low stock & expiring items
      const productQuery = createTenantQuery(tenantId, 'products');
      const products = await productQuery.whereMultiple({ isActive: true });
      
      // Safety check: ensure products is an array
      if (!Array.isArray(products)) {
        console.warn('Products is not an array:', products);
        setDashboardStats(prev => ({ ...prev, lowStockCount: 0, lowStockItems: [] }));
        return;
      }

      // Get products needing attention (low stock or expiring)
      const productsNeedingAttention = getProductsNeedingAttention(products) || [];
      
      // Sort by severity
      const lowStockItems = productsNeedingAttention
        .sort((a, b) => {
          const severityOrder = { critical: 0, high: 1, medium: 2, normal: 3 };
          return (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3);
        })
        .slice(0, 5);

      setDashboardStats({
        todaySales,
        totalRevenue,
        cashSales,
        digitalSales,
        utangTotal,
        lowStockCount: lowStockItems.length,
        utangList,
        lowStockItems
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  }

  return (
    <div className="h-screen w-screen bg-zinc-100 text-zinc-900 overflow-hidden flex flex-col" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-zinc-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wider font-medium">
              {t('manager.dashboard')}
            </div>
            <div className="text-xl font-bold text-zinc-900">
              {currentTenant?.businessName || currentTenant?.name || "JANE'S SARI-SARI"}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="flex gap-1 bg-zinc-100 rounded-full px-1 py-1 shadow-sm">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  language === 'en' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('tl')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  language === 'tl' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
                title="Tagalog"
              >
                TL
              </button>
              <button
                onClick={() => changeLanguage('tr')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  language === 'tr' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
                title="Türkçe"
              >
                TR
              </button>
            </div>
            <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center shadow-sm">
              <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-zinc-200 shadow-sm">
        <div className="flex px-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'dashboard' 
                ? 'text-indigo-600 border-indigo-600' 
                : 'text-zinc-500 border-transparent hover:text-zinc-900'
            }`}
          >
            {t('manager.dashboard')}
          </button>
          <button
            onClick={() => setActiveTab('zreport')}
            className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'zreport' 
                ? 'text-indigo-600 border-indigo-600' 
                : 'text-zinc-500 border-transparent hover:text-zinc-900'
            }`}
          >
            {t('manager.zReport')}
          </button>
          <button
            onClick={() => setActiveTab('utang')}
            className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'utang' 
                ? 'text-indigo-600 border-indigo-600' 
                : 'text-zinc-500 border-transparent hover:text-zinc-900'
            }`}
          >
            {t('manager.utangTracker')}
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'inventory' 
                ? 'text-indigo-600 border-indigo-600' 
                : 'text-zinc-500 border-transparent hover:text-zinc-900'
            }`}
          >
            {t('manager.inventory')}
          </button>
        </div>
      </div>

      {/* Content - Bento Grid Layout */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="p-6 space-y-6">
            {/* Revenue Card - Large, Clean Numbers */}
            <div className="bg-white shadow-lg shadow-indigo-100 rounded-3xl p-8 border border-zinc-200 hover:shadow-indigo-200 transition-all">
              <div className="mb-6">
                <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-3">
                  {t('manager.todaySales')}
                </div>
                <div className="text-5xl font-bold text-zinc-900 tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  ₱{dashboardStats.totalRevenue.toFixed(2)}
                </div>
              </div>
              
              {/* Cash & Digital Split */}
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-zinc-200">
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-2">
                    Cash
                  </div>
                  <div className="text-2xl font-semibold text-zinc-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    ₱{dashboardStats.cashSales.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-2">
                    GCash
                  </div>
                  <div className="text-2xl font-semibold text-zinc-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    ₱{dashboardStats.digitalSales.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Grid - 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Utang Tracker - Clean Ledger Table */}
              <div className="bg-white shadow-lg shadow-indigo-100 rounded-3xl p-6 border border-zinc-200 hover:shadow-indigo-200 transition-all">
                <div className="mb-4">
                  <div className="text-base font-bold text-zinc-900 mb-1">
                    {t('manager.utangTracker')}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {dashboardStats.utangList.length} {t('manager.pending')}
                  </div>
                </div>
                
                {dashboardStats.utangList.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 text-sm">
                    No pending utang
                  </div>
                ) : (
                  <div className="space-y-0">
                    {dashboardStats.utangList.map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-3 border-b border-zinc-200 last:border-0 hover:bg-zinc-50 transition-colors rounded-lg px-2"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-zinc-900 truncate">
                            {entry.customerName}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-base font-semibold text-zinc-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            ₱{entry.amount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Low Stock Alerts - Status Colors */}
              <div className="bg-white shadow-lg shadow-indigo-100 rounded-3xl p-6 border border-zinc-200 hover:shadow-indigo-200 transition-all">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-base font-bold text-zinc-900 mb-1">
                      {t('manager.lowStock')}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {dashboardStats.lowStockCount} items
                    </div>
                  </div>
                  {dashboardStats.lowStockCount > 0 && (
                    <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                  )}
                </div>
                
                {dashboardStats.lowStockItems.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 text-sm">
                    All items in stock
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dashboardStats.lowStockItems.map((item, index) => {
                      const severity = getLowStockSeverity(item);
                      const severityStyles = {
                        critical: 'bg-red-50 text-red-700 border-red-200',
                        high: 'bg-orange-50 text-orange-700 border-orange-200',
                        medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                        normal: 'bg-blue-50 text-blue-700 border-blue-200'
                      };
                      const style = severityStyles[severity] || severityStyles.normal;
                      
                      return (
                        <div
                          key={index}
                          className={`py-3 px-4 rounded-2xl border ${style} shadow-sm`}
                        >
                          <div className="text-sm font-semibold mb-1">
                            {item.name}
                          </div>
                          <div className="text-xs">
                            Stock: {parseFloat(item.stockQuantity || 0)} {item.unit || 'pcs'}
                            {item.issue === 'expiring' && getDaysUntilExpiration(item) !== null && (
                              <span> • {getDaysUntilExpiration(item)}d left</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white shadow-lg shadow-indigo-100 rounded-3xl p-6 border border-zinc-200 hover:shadow-indigo-200 transition-all">
              <div className="mb-4">
                <div className="text-base font-bold text-zinc-900">
                  {t('manager.recentTransactions')}
                </div>
              </div>
              <RecentTransactions tenantId={tenantId} />
            </div>
          </div>
        )}

        {activeTab === 'zreport' && (
          <div className="p-6">
            <ZReport tenantId={tenantId} />
          </div>
        )}
        
        {activeTab === 'utang' && (
          <div className="p-6">
            <UtangTracker tenantId={tenantId} />
          </div>
        )}
        
        {activeTab === 'inventory' && (
          <div className="p-6">
            <Inventory tenantId={tenantId} />
          </div>
        )}
      </div>
    </div>
  );
}

// Recent Transactions - Minimalist Table
function RecentTransactions({ tenantId }) {
  const { t } = useI18n();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadTransactions();
  }, [tenantId]);

  async function loadTransactions() {
    try {
      const query = createTenantQuery(tenantId, 'transactions');
      const txs = await query.getAll();
      setTransactions(txs.slice(-10).reverse());
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 text-sm">
        No transactions yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map(tx => (
        <div 
          key={tx.id} 
          className="flex items-center justify-between py-3 px-4 border border-zinc-200 rounded-2xl hover:bg-zinc-50 hover:border-zinc-300 transition-colors shadow-sm"
        >
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-zinc-900 mb-0.5">
              {tx.transactionNumber}
            </div>
            <div className="text-xs text-zinc-500">
              {new Date(tx.transactionDate).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          <div className="text-right ml-4">
            <div className="text-sm font-semibold text-zinc-900 mb-0.5" style={{ fontVariantNumeric: 'tabular-nums' }}>
              ₱{parseFloat(tx.totalAmount || 0).toFixed(2)}
            </div>
            <div className="text-xs text-zinc-500 uppercase font-medium">
              {tx.paymentMethod}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
