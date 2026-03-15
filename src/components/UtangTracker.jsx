// ============================================
// SMART UTANG TRACKER - Premium Debt Management
// Days Overdue, WhatsApp Sharing, Premium UI
// ============================================

import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n/i18n-context.jsx';
import { useGlobalStore } from '../store/GlobalStore.jsx';
import { createTenantQuery } from '../utils/tenantIsolation.js';
import { calculateDaysOverdue, getOverdueStatus, shareToWhatsApp, createPaymentReminder } from '../utils/utangLedger.js';
import { db } from '../db/dexie-schema.js';

export default function UtangTracker({ tenantId }) {
  const { t } = useI18n();
  const { withTenant } = useGlobalStore();
  const [utangList, setUtangList] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [sortBy, setSortBy] = useState('overdue'); // 'overdue' | 'amount' | 'date'

  useEffect(() => {
    if (tenantId) {
      loadData();
    }
  }, [tenantId, filterStatus, selectedCustomer]);

  async function loadData() {
    try {
      const customerQuery = createTenantQuery(tenantId, 'customers');
      const customerList = await customerQuery.whereMultiple({ isActive: true });
      setCustomers(customerList);

      const utangQuery = createTenantQuery(tenantId, 'utangLedger');
      let entries = await utangQuery.getAll();

      // Filter by customer
      if (selectedCustomer) {
        entries = entries.filter(e => e.customerId === selectedCustomer);
      }

      // Filter by status
      if (filterStatus !== 'all') {
        entries = entries.filter(e => e.status === filterStatus);
      }

      // Enrich with customer data and calculate overdue
      const enriched = entries.map(entry => {
        const customer = customerList.find(c => c.id === entry.customerId);
        const daysOverdue = calculateDaysOverdue(entry.dueDate);
        const overdueStatus = getOverdueStatus(daysOverdue);
        
        return {
          ...entry,
          customerName: customer?.name || 'Unknown',
          customerPhone: customer?.phone || '',
          customer: customer,
          daysOverdue,
          overdueStatus
        };
      });

      // Sort
      enriched.sort((a, b) => {
        if (sortBy === 'overdue') {
          const aDays = a.daysOverdue || 0;
          const bDays = b.daysOverdue || 0;
          return bDays - aDays; // Most overdue first
        } else if (sortBy === 'amount') {
          return b.remainingAmount - a.remainingAmount;
        } else {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });

      setUtangList(enriched);
    } catch (error) {
      console.error('Error loading utang data:', error);
    }
  }

  async function markAsPaid(utangId, amount) {
    try {
      const entry = await db.utangLedger.get(utangId);
      if (!entry || entry.tenantId !== tenantId) return;

      const paidAmount = parseFloat(amount) || parseFloat(entry.remainingAmount);
      const newPaidAmount = parseFloat(entry.paidAmount || 0) + paidAmount;
      const newRemaining = parseFloat(entry.remainingAmount) - paidAmount;

      await db.utangLedger.update(utangId, {
        paidAmount: newPaidAmount,
        remainingAmount: Math.max(0, newRemaining),
        status: newRemaining <= 0 ? 'paid' : 'partial',
        paidAt: newRemaining <= 0 ? new Date() : entry.paidAt,
        updatedAt: new Date()
      });

      // Update customer total utang
      const customer = await db.customers.get(entry.customerId);
      if (customer && customer.tenantId === tenantId) {
        await db.customers.update(entry.customerId, {
          totalUtang: Math.max(0, (parseFloat(customer.totalUtang || 0) - paidAmount))
        });
      }

      loadData();
    } catch (error) {
      console.error('Error marking utang as paid:', error);
      alert('Error: ' + error.message);
    }
  }

  function handleWhatsAppShare(utangEntry) {
    if (!utangEntry.customer || !utangEntry.customer.phone) {
      alert('Customer phone number not available');
      return;
    }

    const success = shareToWhatsApp(utangEntry, utangEntry.customer);
    if (!success) {
      alert('Unable to open WhatsApp. Please check customer phone number.');
    }
  }

  function getStatusColor(status, overdueStatus) {
    if (status === 'paid') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (overdueStatus === 'critical') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (overdueStatus === 'overdue') return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    if (overdueStatus === 'warning') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  }

  return (
    <div className="space-y-6">
      {/* Premium Filters */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">{t('manager.customerName')}</label>
            <select
              value={selectedCustomer || ''}
              onChange={(e) => setSelectedCustomer(e.target.value || null)}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">All Customers</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} {customer.phone ? `(${customer.phone})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">{t('manager.status')}</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="all">All Status</option>
              <option value="pending">{t('manager.pending')}</option>
              <option value="partial">{t('manager.partial')}</option>
              <option value="paid">{t('manager.paid')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="overdue">Days Overdue</option>
              <option value="amount">Amount</option>
              <option value="date">Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Utang List - Premium Cards */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-slate-300">{t('manager.utangTracker')}</h2>
        <div className="space-y-4">
          {utangList.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <div className="text-4xl mb-2">📋</div>
              <div>No utang records found</div>
            </div>
          ) : (
            utangList.map(entry => {
              const statusColor = getStatusColor(entry.status, entry.overdueStatus);
              
              return (
                <div
                  key={entry.id}
                  className={`bg-white/5 backdrop-blur-md rounded-2xl p-6 border-2 ${statusColor} transition-all hover:scale-[1.02] shadow-xl`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-bold text-2xl">{entry.customerName}</div>
                        {entry.daysOverdue > 0 && (
                          <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-semibold">
                            {entry.daysOverdue} {entry.daysOverdue === 1 ? 'day' : 'days'} overdue
                          </span>
                        )}
                      </div>
                      {entry.customerPhone && (
                        <div className="text-sm text-slate-400">📱 {entry.customerPhone}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-emerald-400 mb-1 [text-shadow:0_0_20px_rgba(16,185,129,0.5)]">
                        ₱{parseFloat(entry.remainingAmount || 0).toFixed(2)}
                      </div>
                      <div className={`text-sm font-semibold ${statusColor.split(' ')[1]}`}>
                        {entry.status === 'paid' ? t('manager.paid') :
                         entry.status === 'partial' ? t('manager.partial') :
                         entry.overdueStatus === 'critical' ? 'Critical' :
                         entry.overdueStatus === 'overdue' ? t('manager.overdue') :
                         t('manager.pending')}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-slate-400">{t('manager.amount')}: </span>
                      <span className="font-semibold">₱{parseFloat(entry.amount || 0).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">{t('manager.dueDate')}: </span>
                      <span className="font-semibold">
                        {entry.dueDate ? new Date(entry.dueDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    {entry.paidAmount > 0 && (
                      <div>
                        <span className="text-slate-400">Paid: </span>
                        <span className="font-semibold text-emerald-400">
                          ₱{parseFloat(entry.paidAmount || 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {entry.status !== 'paid' && (
                    <div className="flex gap-3">
                      {entry.customerPhone && (
                        <button
                          onClick={() => handleWhatsAppShare(entry)}
                          className="flex-1 bg-green-500/80 hover:bg-green-600/80 backdrop-blur-sm py-3 rounded-xl font-bold transition-all hover:scale-105 flex items-center justify-center gap-2"
                        >
                          <span>📱</span>
                          Share to WhatsApp
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const amount = prompt('Enter payment amount:', entry.remainingAmount);
                          if (amount) markAsPaid(entry.id, amount);
                        }}
                        className="flex-1 bg-emerald-500/80 hover:bg-emerald-600/80 backdrop-blur-sm py-3 rounded-xl font-bold transition-all hover:scale-105"
                      >
                        Mark as Paid
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
