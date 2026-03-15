import React, { useState } from 'react';
import { useI18n } from '../i18n/i18n-context.jsx';
import { db } from '../db/dexie-schema.js';

// Premium Icons for Onboarding
const ZapIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const UserGroupIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export default function Login({ onLogin }) {
  const { t, changeLanguage, language } = useI18n();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      let user = await db.users.where('username').equals(username).first();

      if (!user && (username === 'cashier' || username === 'manager')) {
        let tenant = await db.tenants.where('id').equals('demo-tenant-001').first();
        if (!tenant) {
          tenant = {
            id: 'demo-tenant-001',
            name: 'Elite Store',
            businessName: 'Filipin Elite Retail',
            isActive: true,
            createdAt: new Date()
          };
          await db.tenants.add(tenant);
        }

        const role = username === 'cashier' ? 'cashier' : 'manager';
        user = {
          id: `demo-user-${username}`,
          tenantId: 'demo-tenant-001',
          username: username,
          passwordHash: 'demo',
          fullName: role === 'cashier' ? 'Demo Cashier' : 'Demo Manager',
          role: role,
          isActive: true,
          createdAt: new Date()
        };
        await db.users.add(user);
        
        // Ensure defaults exist...
      }

      if (user) {
        onLogin({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          tenantId: user.tenantId
        });
      } else {
        setError('Invalid username. Use "cashier" or "manager".');
      }
    } catch (e) {
      console.error('Login error:', e);
      setError('System unavailable. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 font-inter">
      <div className="w-full max-w-5xl flex bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 min-h-[600px] animate-scale-in">
        
        {/* Left Side: Elite Branding (Hidden on mobile) */}
        <div className="hidden lg:flex flex-[1.2] flex-col bg-slate-900 p-12 text-white justify-between relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl -ml-32 -mb-32" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
               </div>
               <span className="text-2xl font-black tracking-tighter uppercase italic">Filipin POS</span>
            </div>
            
            <h1 className="text-5xl font-black mb-6 tracking-tight leading-[0.9]">
              The <span className="text-indigo-400">Elite</span> Choice <br />
              for Modern Retail.
            </h1>
            <p className="text-lg text-slate-400 max-w-sm mb-12">
              Join thousands of Filipino business owners who simplified their operations today.
            </p>
            
            <div className="space-y-8">
               <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 shrink-0 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                     <ZapIcon />
                  </div>
                  <div>
                     <h3 className="font-bold text-lg">Instant Checkout</h3>
                     <p className="text-sm text-slate-500">Zero lag, even on older devices. Handle queues with ease.</p>
                  </div>
               </div>
               
               <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 shrink-0 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                     <ShieldCheckIcon />
                  </div>
                  <div>
                     <h3 className="font-bold text-lg">Cloud-Safe Backup</h3>
                     <p className="text-sm text-slate-500">Your data is synced securely. Access reports from anywhere.</p>
                  </div>
               </div>

               <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 shrink-0 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/30">
                     <UserGroupIcon />
                  </div>
                  <div>
                     <h3 className="font-bold text-lg">Smart Debt Management</h3>
                     <p className="text-sm text-slate-500">Track Utang & Loyalty points automatically within the POS.</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="relative z-10 pt-10 border-t border-white/5 flex items-center justify-between text-slate-500 text-[10px] font-black uppercase tracking-widest">
            <span>© 2026 FILIPIN SOLUTIONS</span>
            <span>V2.4 ELITE</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-sm mx-auto w-full">
            <div className="lg:hidden flex flex-col items-center mb-10">
               <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center shadow-xl mb-4">
                  <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
               </div>
               <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">Filipin POS</h1>
            </div>

            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-2xl font-black text-slate-900 mb-2">Welcome Back.</h2>
              <p className="text-slate-400 font-medium">Please sign in to your terminal.</p>
            </div>

            {/* Language Selection */}
            <div className="flex items-center gap-1 mb-8 bg-slate-100 p-1 rounded-xl w-fit mx-auto lg:mx-0">
               {['en', 'tl', 'tr'].map(lang => (
                 <button
                   key={lang}
                   onClick={() => changeLanguage(lang)}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all
                     ${language === lang ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   {lang}
                 </button>
               ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 font-medium"
                  required
                />
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                    <button type="button" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Forgot?</button>
                 </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 font-medium"
                />
                <p className="text-[9px] text-slate-400 mt-1 pl-1 italic">* demo accounts use anytime password.</p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100 animate-shake">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                Sign In to POS
                <TrendingUpIcon className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-center gap-4">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">All Systems Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

