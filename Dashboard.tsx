/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Invoice } from '../types';
import { formatCurrency } from '../utils/calculations';
import { Plus, Users, History, FileText, TrendingUp, IndianRupee, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  invoices: Invoice[];
  customerCount: number;
  onNavigate: (tab: 'dashboard' | 'create' | 'history' | 'customers' | 'settings') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ invoices, customerCount, onNavigate }) => {
  const stats = useMemo(() => {
    const totalSales = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const totalGST = invoices.reduce((sum, inv) => sum + inv.totalGST, 0);
    const totalTaxable = invoices.reduce((sum, inv) => sum + inv.subtotal, 0);
    const count = invoices.length;

    return { totalSales, totalGST, totalTaxable, count };
  }, [invoices]);

  // Animation constants for a premium transition
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header section with a premium subtitle and local context */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-slate-900">
            Billing Command Center
          </h2>
          <p className="text-sm text-slate-500">
            Real-time insights and professional GST billing indicators for Vijeta Associates.
          </p>
        </div>
        
        <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-100 flex items-center gap-1.5 self-start shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          System Online
        </div>
      </div>

      {/* Grid KPI metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1: Gross Sales */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs relative overflow-hidden"
        >
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl w-10 h-10 flex items-center justify-center mb-4">
            <IndianRupee size={20} />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Revenue</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {formatCurrency(stats.totalSales)}
          </h3>
          <div className="absolute right-4 top-4 text-slate-100 font-bold text-6xl pointer-events-none select-none font-sans">
            ₹
          </div>
        </motion.div>

        {/* KPI 2: CGST/SGST Taxes */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs relative overflow-hidden"
        >
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl w-10 h-10 flex items-center justify-center mb-4">
            <ShieldCheck size={20} />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">GST Collected</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {formatCurrency(stats.totalGST)}
          </h3>
          <p className="text-[10px] text-slate-450 mt-1">
            CGST: {formatCurrency(stats.totalGST / 2)} | SGST: {formatCurrency(stats.totalGST / 2)}
          </p>
        </motion.div>

        {/* KPI 3: Invoices Count */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs relative overflow-hidden"
        >
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl w-10 h-10 flex items-center justify-center mb-4">
            <FileText size={20} />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invoices Issued</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {stats.count}
          </h3>
          <p className="text-[10px] text-slate-450 mt-1">
            Average: {stats.count > 0 ? formatCurrency(stats.totalSales / stats.count) : '₹0.00'} / bill
          </p>
        </motion.div>

        {/* KPI 4: Customers directory */}
        <motion.div
          variants={itemVariants}
          className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs relative overflow-hidden"
        >
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl w-10 h-10 flex items-center justify-center mb-4">
            <Users size={20} />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Client Directory</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {customerCount}
          </h3>
          <p className="text-[10px] text-emerald-650 mt-1 font-medium">Synced in local vault</p>
        </motion.div>
      </div>

      {/* Quick Launchpad & Flow Shortcuts */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono">Launchpad Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <button
            onClick={() => onNavigate('create')}
            id="btn-shortcut-create-invoice"
            className="flex items-center justify-between p-5 bg-blue-650 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-md hover:shadow-lg shadow-blue-100 group cursor-pointer text-left"
          >
            <div className="space-y-1">
              <span className="font-bold text-sm">Create New GST Invoice</span>
              <p className="text-xs text-blue-100 font-normal">Super-fast item calculation formulas</p>
            </div>
            <ArrowRight size={22} className="text-blue-100 group-hover:translate-x-1.5 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('customers')}
            id="btn-shortcut-customers"
            className="flex items-center justify-between p-5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl transition-all group cursor-pointer text-left"
          >
            <div className="space-y-1">
              <span className="font-semibold text-sm text-slate-900">Manage Customers</span>
              <p className="text-xs text-slate-400 font-normal">Add, update, or remove customer logs</p>
            </div>
            <Users size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
          </button>

          <button
            onClick={() => onNavigate('history')}
            id="btn-shortcut-history"
            className="flex items-center justify-between p-5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl transition-all group cursor-pointer text-left"
          >
            <div className="space-y-1">
              <span className="font-semibold text-sm text-slate-900">View Invoice History</span>
              <p className="text-xs text-slate-400 font-normal">Sort, search and reprint A4 summaries</p>
            </div>
            <History size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
          </button>
        </div>
      </motion.div>

      {/* Recent Activity Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800 font-display flex items-center gap-2">
            <span className="h-4 w-1.5 bg-blue-600 rounded-sm"></span>
            Recent Tax Invoices
          </h3>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
          >
            See All Invoices <ArrowRight size={14} />
          </button>
        </div>

        {invoices.length === 0 ? (
          <div className="p-16 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <FileText size={22} />
            </div>
            <h4 className="font-bold text-slate-700 text-sm">No billing records yet</h4>
            <p className="text-xs text-slate-400 mt-1">Get started by creating your very first tax invoice above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Buyer/Customer</th>
                  <th className="p-4">Date Issued</th>
                  <th className="p-4 text-right">Taxable</th>
                  <th className="p-4 text-right">Grand Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {invoices.slice(0, 5).map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/20">
                    <td className="p-4 font-mono font-bold text-slate-900">{inv.invoiceNo}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{inv.customer.name}</div>
                      {inv.customer.gstNumber && (
                        <div className="text-[10px] text-blue-605 font-mono font-medium">{inv.customer.gstNumber}</div>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 font-mono">{inv.date}</td>
                    <td className="p-4 text-right font-mono text-slate-600">
                      {formatCurrency(inv.subtotal).replace('INR', '')}
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(inv.grandTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
