/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BusinessProfile, Customer, Invoice } from './types';
import { Dashboard } from './components/Dashboard';
import { InvoiceCreator } from './components/InvoiceCreator';
import { InvoiceHistory } from './components/InvoiceHistory';
import { CustomerManager } from './components/CustomerManager';
import { BusinessSettings } from './components/BusinessSettings';
import { PrintInvoice } from './components/PrintInvoice';
import { 
  Plus, Users, History, Settings, LayoutDashboard, 
  Menu, X, Sparkles, Receipt, Bell, ShieldAlert, BadgeCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'history' | 'customers' | 'settings'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // 4. Central Print Setup states
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);

  // 5. Administrators state for "Who's using the website"
  const [currentAdmin, setCurrentAdmin] = useState<string>(() => {
    const saved = localStorage.getItem('vj_current_admin');
    return saved || 'Ankit Mishra';
  });

  const [adminOptions, setAdminOptions] = useState<string[]>(() => {
    const saved = localStorage.getItem('vj_admin_options');
    return saved ? JSON.parse(saved) : ['Ankit Mishra', 'Vijeta Singh', 'Pradeep Gupta', 'Amit Kumar'];
  });

  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');

  // Persists active operating operator
  useEffect(() => {
    localStorage.setItem('vj_current_admin', currentAdmin);
  }, [currentAdmin]);

  useEffect(() => {
    localStorage.setItem('vj_admin_options', JSON.stringify(adminOptions));
  }, [adminOptions]);

  const handleAddAdminOption = () => {
    const name = newAdminName.trim();
    if (!name) {
      showToast('Administrator name cannot be empty', 'error');
      return;
    }
    if (adminOptions.includes(name)) {
      showToast('This administrator is already registered', 'error');
      return;
    }
    const updated = [...adminOptions, name];
    setAdminOptions(updated);
    setCurrentAdmin(name);
    setNewAdminName('');
    setIsAddingAdmin(false);
    showToast(`Added and switched to administrator: ${name}`, 'success');
  };

  const handlePrintInvoice = (inv: Invoice) => {
    setPrintInvoice(inv);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // 1. Core Profile state with realistic business coordinates for Vijeta Associates
  const [business, setBusiness] = useState<BusinessProfile>(() => {
    const saved = localStorage.getItem('vj_business');
    return saved ? JSON.parse(saved) : {
      name: 'Vijeta Associates',
      address: 'Shop No. 12, Block-C, Main Market Area,\nDwarka Sector 7, New Delhi - 110075',
      gstNumber: '07AAACV7859R1ZX',
      phone: '9812345678',
      email: 'contact@vijetaassociates.com',
      bankName: 'State Bank of India',
      bankAccountNo: '30491285741',
      bankIfsc: 'SBIN0001234'
    };
  });

  // 2. Customers state with initial helpful demo directory records for swift trial
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('vj_customers');
    return saved ? JSON.parse(saved) : [
      {
        id: 'c-1',
        name: 'Ramesh Electricals Private Limited',
        address: 'B-45, Phase-II, Noida Industrial Area,\nNoida, Uttar Pradesh - 201301',
        gstNumber: '09AABCR5612R1Z3',
        phone: '9811122334'
      },
      {
        id: 'c-2',
        name: 'Global Metal Traders & Co.',
        address: '241, Katra Neel, Chandni Chowk,\nDelhi - 110006',
        gstNumber: '07ACDFT1245P1Z2',
        phone: '9122334455'
      }
    ];
  });

  // 3. Invoices history log state
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('vj_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  // Keep state synced to browser LocalStorage automatically
  useEffect(() => {
    localStorage.setItem('vj_business', JSON.stringify(business));
  }, [business]);

  useEffect(() => {
    localStorage.setItem('vj_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('vj_invoices', JSON.stringify(invoices));
  }, [invoices]);

  // Feed/Show Toasts notification banner helper
  const showToast = (message: string, type: 'success' | 'error') => {
    const fresh: Toast = { id: Date.now().toString(), message, type };
    setToasts((prev) => [...prev, fresh]);
    
    // Automatically fade out after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== fresh.id));
    }, 3500);
  };

  const handleAddCustomer = (c: Customer) => {
    setCustomers((prev) => [c, ...prev]);
  };

  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSaveInvoice = (inv: Invoice) => {
    setInvoices((prev) => [inv, ...prev]);
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  };

  const handleNavClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased font-sans text-slate-800 print:hidden print-hide-all">
      
      {/* 1. TOAST NOTIFICATION CONTAINER (Overlay) */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none print-hide">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`p-3.5 rounded-xl border shadow-lg flex items-start gap-2.5 pointer-events-auto bg-white ${
                toast.type === 'success'
                  ? 'border-emerald-100 text-emerald-800 shadow-emerald-50'
                  : 'border-red-100 text-red-800 shadow-red-50'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' ? (
                  <BadgeCheck size={18} className="text-emerald-500" />
                ) : (
                  <ShieldAlert size={18} className="text-red-500" />
                )}
              </div>
              <div className="text-xs font-semibold leading-relaxed">
                {toast.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 2. MOBILE RESPONSIVE NAVIGATION BAR HEADER */}
      <header className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-850 shadow-sm print-hide">
        <div className="flex items-center gap-2">
          <Receipt size={20} className="text-blue-450" />
          <div>
            <h1 className="text-sm font-bold tracking-tight">Vijeta Associates</h1>
            <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider font-semibold">GST Ledger System</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 px-2 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
          aria-label="Toggle Navigation Control Panel"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* 3. RESPONSIVE SIDEBAR (COLLAPSIBLE ON MOBILE) */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 p-5 flex flex-col justify-between transform transition-transform duration-255 md:translate-x-0 md:relative md:flex shrink-0 print-hide ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Brand header from Professional Polish Theme */}
          <div className="flex items-center gap-3 py-3 border-b border-slate-800 mb-4 px-1">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shrink-0 font-display">VA</div>
            <div>
              <h1 className="text-base font-bold font-display text-slate-100 tracking-tight leading-tight">Vijeta Associates</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">GST Billing Engine v4.2</p>
            </div>
          </div>

          {/* Action buttons list */}
          <div className="space-y-1 text-xs font-semibold">
            <span className="block text-[9px] text-slate-500 uppercase tracking-widest px-3 mb-2 font-mono">Main Operations</span>
            
            <button
              onClick={() => handleNavClick('dashboard')}
              id="sidebar-nav-btn-dashboard"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
              }`}
            >
              <LayoutDashboard size={16} /> Dashboard Center
            </button>

            <button
              onClick={() => handleNavClick('create')}
              id="sidebar-nav-btn-create"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
              }`}
            >
              <Plus size={16} /> Issue GST Bill
            </button>

            <button
              onClick={() => handleNavClick('history')}
              id="sidebar-nav-btn-history"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
              }`}
            >
              <History size={16} /> Invoice Register
            </button>

            <button
              onClick={() => handleNavClick('customers')}
              id="sidebar-nav-btn-customers"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                activeTab === 'customers'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
              }`}
            >
              <Users size={16} /> Customer Ledger
            </button>

            <button
              onClick={() => handleNavClick('settings')}
              id="sidebar-nav-btn-settings"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
              }`}
            >
              <Settings size={16} /> Business Settings
            </button>
          </div>
        </div>

        {/* Sync Status Footer & Administrator Badge */}
        <div className="pt-4 border-t border-slate-800 space-y-4 text-xs">
          <div 
            onClick={() => setAdminModalOpen(true)}
            className="bg-slate-800/40 hover:bg-slate-800/80 rounded-lg p-3 cursor-pointer transition-colors border border-transparent hover:border-slate-700/50 group select-none"
            title="Click to switch or manage administrators"
          >
            <div className="flex justify-between items-center bg-transparent">
              <p className="text-slate-500 text-[10px] uppercase font-bold mb-1 tracking-wider font-mono">Account Profile</p>
              <span className="text-[9px] text-blue-400 font-bold group-hover:underline">Switch</span>
            </div>
            <p className="text-slate-200 text-sm font-semibold truncate group-hover:text-blue-400 transition-colors">{currentAdmin}</p>
            <p className="text-slate-500 text-xs mt-0.5">Administrator</p>
          </div>
          <div className="space-y-1.5 text-[10px] text-slate-500 font-mono px-1">
            <div className="flex items-center gap-1.5 justify-between">
              <span>Local DB Status</span>
              <span className="flex items-center gap-1 text-emerald-500 font-bold">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Synchronized
              </span>
            </div>
            <p className="italic text-slate-600 text-right">v4.2 PRO</p>
          </div>
        </div>
      </aside>

      {/* OVERLAY BACKGROUND WHEN MOBILE DRAWER PANEL IS OPEN */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-20 md:hidden"
        ></div>
      )}

      {/* 4. MAIN CENTRAL CONTENT CHASSIS */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto print:p-0 print:m-0 print:bg-white">
        
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="print-hide"
            >
              <Dashboard
                invoices={invoices}
                customerCount={customers.length}
                onNavigate={(tab) => handleNavClick(tab)}
              />
            </motion.div>
          )}

          {activeTab === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="print-hide"
            >
              <InvoiceCreator
                business={business}
                customers={customers}
                invoicesCount={invoices.length}
                onSaveInvoice={handleSaveInvoice}
                onAddCustomer={handleAddCustomer}
                onShowToast={showToast}
                activeAdmin={currentAdmin}
                onPrintInvoice={handlePrintInvoice}
              />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="print-hide"
            >
              <InvoiceHistory
                invoices={invoices}
                business={business}
                onDeleteInvoice={handleDeleteInvoice}
                onShowToast={showToast}
                onPrintInvoice={handlePrintInvoice}
              />
            </motion.div>
          )}

          {activeTab === 'customers' && (
            <motion.div
              key="customers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="print-hide"
            >
              <CustomerManager
                customers={customers}
                onAddCustomer={handleAddCustomer}
                onUpdateCustomer={handleUpdateCustomer}
                onDeleteCustomer={handleDeleteCustomer}
                onShowToast={showToast}
              />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="print-hide"
            >
              <BusinessSettings
                business={business}
                onUpdateBusiness={setBusiness}
                onShowToast={showToast}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>

    {/* 5. ADMINISTRATOR SELECTOR MODAL */}
    <AnimatePresence>
      {adminModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 print:hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200"
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-display">Switch Active Operator</h3>
                <p className="text-xs text-slate-500">Pick the active operator whose name is printed on generated bills.</p>
              </div>
              <button
                onClick={() => {
                  setAdminModalOpen(false);
                  setNewAdminName('');
                  setIsAddingAdmin(false);
                }}
                className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* List of admins */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {adminOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setCurrentAdmin(opt);
                    showToast(`Switched active administrator to ${opt}`, 'success');
                    setAdminModalOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                    currentAdmin === opt
                      ? 'border-blue-500 bg-blue-50/50 text-blue-950 font-bold'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${currentAdmin === opt ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                    <span>{opt}</span>
                  </div>
                  {currentAdmin === opt && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] uppercase font-bold rounded-md">
                      Active Now
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Add Custom operator input */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              {!isAddingAdmin ? (
                <button
                  onClick={() => setIsAddingAdmin(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1.5 cursor-pointer bg-transparent border-0"
                >
                  + Add and register new administrator name
                </button>
              ) : (
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold uppercase text-slate-400">Operator/Admin Full Name</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Vijeta Singh"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddAdminOption();
                        }
                      }}
                      className="flex-1 text-xs border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 bg-slate-50/30"
                    />
                    <button
                      onClick={handleAddAdminOption}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer shadow-sm shadow-blue-100 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Bulletproof print-only direct sibling under root */}
    <div className="hidden print:block print-show-only print-container">
      {printInvoice && (
        <PrintInvoice invoice={printInvoice} business={business} />
      )}
    </div>
    </>
  );
}
