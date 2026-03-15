// ============================================
// INVENTORY MANAGEMENT - Products, Prices, Quick-Tap Setup
// ============================================

import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n/i18n-context.jsx';
import { db } from '../db/dexie-schema.js';

export default function Inventory({ tenantId }) {
  const { t } = useI18n();
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filterLowStock, setFilterLowStock] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [tenantId, filterLowStock]);

  async function loadProducts() {
    try {
      if (!tenantId) {
        console.warn('loadProducts called without tenantId');
        return;
      }
      
      console.log(`Loading products for tenant: ${tenantId}...`);
      
      // Safe query without reliance on compound index
      const allProducts = await db.products
        .where('tenantId')
        .equals(tenantId)
        .filter(p => p.isActive === true)
        .toArray();

      console.log(`Found ${allProducts.length} active products.`);

      let filtered = allProducts;
      if (filterLowStock) {
        filtered = allProducts.filter(p =>
          parseFloat(p.stockQuantity || 0) <= parseFloat(p.lowStockThreshold || 5)
        );
      }

      // Sort: Quick-tap items first, then by name
      filtered.sort((a, b) => {
        if (a.isQuickTap && !b.isQuickTap) return -1;
        if (!a.isQuickTap && b.isQuickTap) return 1;
        if (a.isQuickTap && b.isQuickTap) {
          return (a.quickTapOrder || 0) - (b.quickTapOrder || 0);
        }
        return (a.name || '').localeCompare(b.name || '');
      });

      setProducts(filtered);
    } catch (error) {
      console.error('CRITICAL ERROR in Inventory.loadProducts:', error);
      // We don't alert here to avoid spamming the user if it's a transient issue
    }
  }

  async function saveProduct(productData) {
    try {
      if (!tenantId) throw new Error('Cannot save product: Missing tenant context');
      if (!productData.name) throw new Error('Product name is required');

      const localId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Saving product data:', productData);

      if (editingProduct) {
        await db.products.update(editingProduct.id, {
          ...productData,
          updatedAt: new Date()
        });
      } else {
        await db.products.add({
          id: localId,
          tenantId,
          ...productData,
          isActive: true,
          createdAt: new Date(),
          localId
        });
      }

      setShowAddModal(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      console.error('CRITICAL ERROR in Inventory.saveProduct:', error);
      alert('Failed to save product: ' + error.message);
    }
  }

  async function toggleQuickTap(productId, isQuickTap) {
    try {
      if (isQuickTap) {
        // Safe query for quick-tap products
        const quickTapProducts = await db.products
          .where('tenantId')
          .equals(tenantId)
          .filter(p => p.isQuickTap === true)
          .toArray();
        const maxOrder = quickTapProducts.reduce((max, p) => Math.max(max, p.quickTapOrder || 0), 0);

        await db.products.update(productId, {
          isQuickTap: true,
          quickTapOrder: maxOrder + 1
        });
      } else {
        await db.products.update(productId, {
          isQuickTap: false,
          quickTapOrder: 0
        });
      }
      loadProducts();
    } catch (error) {
      console.error('Error toggling quick-tap:', error);
    }
  }

  async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await db.products.update(productId, { isActive: false });
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filterLowStock}
              onChange={(e) => setFilterLowStock(e.target.checked)}
              className="w-4 h-4"
            />
            <span>{t('manager.lowStock')}</span>
          </label>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowAddModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
        >
          {t('manager.addProduct')}
        </button>
      </div>

      {/* Products List */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="space-y-2">
          {products.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No products found</div>
          ) : (
            products.map(product => {
              const isLowStock = parseFloat(product.stockQuantity || 0) <= parseFloat(product.lowStockThreshold || 5);
              
              return (
                <div
                  key={product.id}
                  className={`bg-gray-700 p-4 rounded flex justify-between items-center ${
                    isLowStock ? 'border-l-4 border-red-500' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{product.name}</span>
                      {product.isQuickTap && (
                        <span className="bg-green-600 px-2 py-1 rounded text-xs">Quick-Tap</span>
                      )}
                      {isLowStock && (
                        <span className="bg-red-600 px-2 py-1 rounded text-xs">Low Stock</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Price: ₱{parseFloat(product.price || 0).toFixed(2)} | 
                      Stock: {parseFloat(product.stockQuantity || 0)} {product.unit || 'pcs'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleQuickTap(product.id, !product.isQuickTap)}
                      className={`px-3 py-1 rounded text-sm ${
                        product.isQuickTap
                          ? 'bg-yellow-600 hover:bg-yellow-700'
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                    >
                      {product.isQuickTap ? t('manager.removeQuickTap') : t('manager.setQuickTap')}
                    </button>
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setShowAddModal(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <ProductModal
          product={editingProduct}
          onSave={saveProduct}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}

function ProductModal({ product, onSave, onClose }) {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || 0,
    cost: product?.cost || 0,
    category: product?.category || '',
    stockQuantity: product?.stockQuantity || 0,
    lowStockThreshold: product?.lowStockThreshold || 5,
    unit: product?.unit || 'pcs',
    barcode: product?.barcode || '',
    isQuickTap: product?.isQuickTap || false,
    quickTapColor: product?.quickTapColor || ''
  });

  function handleSubmit(e) {
    e.preventDefault();
    onSave(formData);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-11/12 max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {product ? t('manager.editProduct') : t('manager.addProduct')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">{t('products.name')}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-700 text-white p-2 rounded"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">{t('products.price')}</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full bg-gray-700 text-white p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">{t('products.cost')}</label>
              <input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                className="w-full bg-gray-700 text-white p-2 rounded"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">{t('products.stock')}</label>
              <input
                type="number"
                step="0.01"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: parseFloat(e.target.value) || 0 })}
                className="w-full bg-gray-700 text-white p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">{t('products.lowStockThreshold')}</label>
              <input
                type="number"
                step="0.01"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseFloat(e.target.value) || 5 })}
                className="w-full bg-gray-700 text-white p-2 rounded"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">{t('products.unit')}</label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full bg-gray-700 text-white p-2 rounded"
            />
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isQuickTap}
                onChange={(e) => setFormData({ ...formData, isQuickTap: e.target.checked })}
                className="w-4 h-4"
              />
              <span>{t('products.quickTap')}</span>
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold"
            >
              {t('common.save')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-500 py-2 rounded font-semibold"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

