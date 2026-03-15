// ============================================
// Z-REPORT - Daily Revenue Split by Payment Method
// ============================================

import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n/i18n-context.jsx';
import { db } from '../db/dexie-schema.js';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';

export default function ZReport({ tenantId }) {
  const { t } = useI18n();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateReport(selectedDate);
  }, [selectedDate, tenantId]);

  async function generateReport(date) {
    setLoading(true);
    try {
      const start = startOfDay(date);
      const end = endOfDay(date);

      // Get all transactions for the date
      const transactions = await db.transactions
        .where('tenantId')
        .equals(tenantId)
        .filter(tx => {
          const txDate = new Date(tx.transactionDate);
          return txDate >= start && txDate <= end;
        })
        .toArray();

      // Calculate totals
      const totalTransactions = transactions.length;
      let totalCash = 0;
      let totalDigital = 0;
      let totalUtang = 0;
      let totalRevenue = 0;
      let totalItemsSold = 0;

      for (const tx of transactions) {
        totalCash += parseFloat(tx.cashAmount || 0);
        totalDigital += parseFloat(tx.digitalAmount || 0);
        totalUtang += parseFloat(tx.utangAmount || 0);
        totalRevenue += parseFloat(tx.totalAmount || 0);

        // Count items
        const items = await db.transactionItems
          .where('transactionId')
          .equals(tx.id)
          .toArray();
        totalItemsSold += items.reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0);
      }

      setReport({
        date: format(date, 'yyyy-MM-dd'),
        totalTransactions,
        totalCash,
        totalDigital,
        totalUtang,
        totalRevenue,
        totalItemsSold,
        transactions
      });
    } catch (error) {
      console.error('Error generating Z-Report:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleDateChange(daysOffset) {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + daysOffset);
    setSelectedDate(newDate);
  }

  if (loading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Date Selector */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => handleDateChange(-1)}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
          >
            ← {t('common.previous')}
          </button>
          <div className="text-center">
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="bg-gray-700 text-white p-2 rounded"
            />
          </div>
          <button
            onClick={() => handleDateChange(1)}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
          >
            {t('common.next')} →
          </button>
        </div>
        <button
          onClick={() => setSelectedDate(new Date())}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded"
        >
          {t('manager.todaySales')}
        </button>
      </div>

      {/* Report Summary */}
      {report && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Z-Report - {format(selectedDate, 'MMMM dd, yyyy')}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-gray-400 text-sm">{t('manager.totalTransactions')}</div>
              <div className="text-3xl font-bold">{report.totalTransactions}</div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-gray-400 text-sm">{t('manager.totalItemsSold')}</div>
              <div className="text-3xl font-bold">{report.totalItemsSold}</div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center bg-green-600 p-4 rounded">
              <span className="text-lg font-semibold">{t('manager.cashSales')}</span>
              <span className="text-2xl font-bold">₱{report.totalCash.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center bg-blue-600 p-4 rounded">
              <span className="text-lg font-semibold">{t('manager.digitalSales')}</span>
              <span className="text-2xl font-bold">₱{report.totalDigital.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center bg-yellow-600 p-4 rounded">
              <span className="text-lg font-semibold">{t('manager.utangTotal')}</span>
              <span className="text-2xl font-bold">₱{report.totalUtang.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center bg-purple-600 p-4 rounded mt-4">
              <span className="text-xl font-bold">{t('manager.totalRevenue')}</span>
              <span className="text-3xl font-bold">₱{report.totalRevenue.toFixed(2)}</span>
            </div>
          </div>

          {/* Transaction List */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Transaction Details</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {report.transactions.map(tx => (
                <div key={tx.id} className="bg-gray-700 p-3 rounded flex justify-between">
                  <div>
                    <div className="font-semibold">{tx.transactionNumber}</div>
                    <div className="text-sm text-gray-400">
                      {new Date(tx.transactionDate).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₱{parseFloat(tx.totalAmount || 0).toFixed(2)}</div>
                    <div className="text-sm text-gray-400">{tx.paymentMethod}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

