// ============================================
// GLOBAL SAAS STORE - Multi-Tenant State Management
// Handles: Tenant, Language, Theme, Business Rules
// ============================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../db/dexie-schema.js';

const GlobalStoreContext = createContext(null);

export function GlobalStoreProvider({ children }) {
  // Core State
  const [currentTenant, setCurrentTenant] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('dark'); // 'dark' | 'light'
  const [businessRules, setBusinessRules] = useState({
    shopType: 'retail', // 'retail' | 'service'
    currency: 'PHP',
    taxEnabled: false,
    taxRate: 0,
    allowUtang: true,
    allowSplitPayment: true,
    minUtangAmount: 0,
    maxUtangAmount: 10000
  });

  // Initialize from localStorage and DB
  useEffect(() => {
    initializeStore();
  }, []);

  async function initializeStore() {
    try {
      // Load from localStorage
      const savedLanguage = localStorage.getItem('language') || 'en';
      const savedTheme = localStorage.getItem('theme') || 'dark';
      setLanguage(savedLanguage);
      setTheme(savedTheme);

      // Load current user from DB
      const userData = await db.settings.get('currentUser');
      if (userData?.value) {
        setCurrentUser(userData.value);
        
        // Load tenant
        if (userData.value.tenantId) {
          const tenant = await db.tenants.get(userData.value.tenantId);
          if (tenant) {
            setCurrentTenant(tenant);
            
            // Load business rules from tenant
            if (tenant.businessRules) {
              setBusinessRules({ ...businessRules, ...tenant.businessRules });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error initializing store:', error);
    }
  }

  // Tenant Isolation Helper
  const withTenant = useCallback((fn) => {
    return (...args) => {
      if (!currentTenant?.id) {
        throw new Error('No tenant context available');
      }
      return fn(currentTenant.id, ...args);
    };
  }, [currentTenant]);

  // Language Management
  const changeLanguage = useCallback((lang) => {
    if (['en', 'tl', 'tr'].includes(lang)) {
      setLanguage(lang);
      localStorage.setItem('language', lang);
    }
  }, []);

  // Theme Management
  const changeTheme = useCallback((newTheme) => {
    if (['dark', 'light'].includes(newTheme)) {
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('light', newTheme === 'light');
    }
  }, []);

  // Business Rules Helpers
  const canPerformAction = useCallback((action, params = {}) => {
    switch (action) {
      case 'createUtang':
        return businessRules.allowUtang && 
               params.amount >= businessRules.minUtangAmount &&
               params.amount <= businessRules.maxUtangAmount;
      case 'splitPayment':
        return businessRules.allowSplitPayment;
      default:
        return true;
    }
  }, [businessRules]);

  const value = {
    // State
    currentTenant,
    currentUser,
    language,
    theme,
    businessRules,
    
    // Actions
    setCurrentTenant,
    setCurrentUser,
    changeLanguage,
    changeTheme,
    setBusinessRules,
    
    // Helpers
    withTenant,
    canPerformAction,
    
    // Computed
    tenantId: currentTenant?.id,
    userId: currentUser?.id,
    isRetail: businessRules.shopType === 'retail',
    isService: businessRules.shopType === 'service'
  };

  return (
    <GlobalStoreContext.Provider value={value}>
      {children}
    </GlobalStoreContext.Provider>
  );
}

export function useGlobalStore() {
  const context = useContext(GlobalStoreContext);
  if (!context) {
    throw new Error('useGlobalStore must be used within GlobalStoreProvider');
  }
  return context;
}

