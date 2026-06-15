/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Invoice, BusinessProfile } from '../types';
import { formatCurrency } from '../utils/calculations';
import { Search, Printer, Eye, Trash2, Calendar, FileText, ArrowUpDown, ChevronDown, X, Check, EyeOff } from 'lucide-react';
import { PrintInvoice } from './PrintInvoice';
import { motion, AnimatePresence } from 'motion/react';

interface InvoiceHistoryProps {
  invoices: Invoice[];
  business: BusinessProfile;
  onDeleteInvoice: (id: string) => void;
  onShowToast: (message: string, type: 'success' | 'error') => void;
  onPrintInvoice?: (invoice: Invoice) => void;
}

type SortCriteria = 'date_desc' | 'date_asc' | 'num_desc' | 'num_asc' | 'total_desc' | 'total_asc';

export const InvoiceHistory: React.FC<InvoiceHistoryProps> = ({
  invoices,
  business,
  onDeleteInvoice,
  onShowToast,
  onPrintInvoice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('date_desc');
  
  // Active selected invoice for re-preview & reprint
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // Deletion guard modal state
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  // Filter & Sort Invoices
  const processedInvoices = useMemo(() => {
    const q = searchQuery.toLowerCase();
    
    // Filter
    let result = invoices.filter((inv) => {
      const matchNo = inv.invoiceNo.toLowerCase().includes(q);
      const matchCust = inv.customer.name.toLowerCase().includes(q);
      const matchPhone = inv.customer.phone.includes(q);
      const matchGst = inv.customer.gstNumber.toLowerCase().includes(q);
      
      // also match line item names for advanced auditing
      const matchItems = inv.items.some((i) => i.name.toLowerCase().includes(q));

      return matchNo || matchCust || matchPhone || matchGst || matchItems;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortCriteria) {
        case 'date_desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date_asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'num_desc':
          return b.invoiceNo.localeCompare(a.invoiceNo);
        case 'num_asc':
          return a.invoiceNo.localeCompare(b.invoiceNo);
        case 'total_desc':
          return b.grandTotal - a.grandTotal;
        case 'total_asc':
          return a.grandTotal - b.grandTotal;
        default:
          return 0;
      }
    });

    return result;
  }, [invoices, searchQuery, sortCriteria]);

  const confirmDelete = () => {
    if (invoiceToDelete) {
      onDeleteInvoice(invoiceToDelete.id);
      onShowToast(`Invoice ${invoiceToDelete.invoiceNo} deleted successfully`, 'success');
      setInvoiceToDelete(null);
    }
  };

  const handlePrint = () => {
    if (selectedInvoice && onPrintInvoice) {
      onPrintInvoice(selectedInvoice);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900">Invoice History Logs</h2>
          <p className="text-sm text-slate-500">Track, filter, audit, or reprint issued bills and GST registers.</p>
        </div>
      </div>

      {/* Filter and sorting area bar */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col md:flex-row items-center gap-4 justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            id="input-history-search"
            placeholder="Search by invoice #, buyer name, GSTIN, product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-250 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50/20"
          />
        </div>

        {/* Sort criteria Selection */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <ArrowUpDown size={12} /> Sort Registry:
          </span>
          <select
            value={sortCriteria}
            onChange={(e) => setSortCriteria(e.target.value as SortCriteria)}
            id="select-history-sort"
            className="text-xs font-medium border border-slate-250 rounded-xl px-2 py-2.5 bg-white text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500"
          >
            <option value="date_desc">Date: Newest First</option>
            <option value="date_asc">Date: Oldest First</option>
            <option value="num_desc">Number: Alphabetical (Z-A)</option>
            <option value="num_asc">Number: Alphabetical (A-Z)</option>
            <option value="total_desc">Value: High to Low</option>
            <option value="total_asc">Value: Low to High</option>
          </select>
        </div>
      </div>

      {/* Main invoices records table layout */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {processedInvoices.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mb-4">
              <FileText size={22} />
            </div>
            <h3 className="font-bold text-slate-700 text-sm">No historical invoices matches</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {searchQuery ? 'Double check your filters or search phrases.' : 'Create some bills first, then audit your progress here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-150 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Customer / Buyer</th>
                  <th className="p-4">Issuance Date</th>
                  <th className="p-4 text-right">Tax collected</th>
                  <th className="p-4 text-right">Gross Total</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {processedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/20">
                    
                    {/* Invoice Number */}
                    <td className="p-4 text-xs font-mono font-bold text-slate-900">
                      {inv.invoiceNo}
                    </td>

                    {/* Customer */}
                    <td className="p-4 text-xs">
                      <div className="font-semibold text-slate-900">{inv.customer.name}</div>
                      <div className="flex items-center gap-2 mt-0.5 font-mono text-[10px] text-slate-400">
                        {inv.customer.phone && <span>Ph: {inv.customer.phone}</span>}
                        {inv.customer.gstNumber && <span className="text-blue-600 font-bold">GSTIN: {inv.customer.gstNumber}</span>}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="p-4 font-mono text-slate-500 text-xs text-left">
                      {inv.date}
                    </td>

                    {/* Tax Amount */}
                    <td className="p-4 text-right font-mono text-xs text-slate-600">
                      {formatCurrency(inv.totalGST).replace('INR', '')}
                    </td>

                    {/* Grand Value */}
                    <td className="p-4 text-right font-mono font-bold text-slate-950 text-xs">
                      {formatCurrency(inv.grandTotal)}
                    </td>

                    {/* Action buttons */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        
                        {/* Open Preview again */}
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer transition-all"
                          title="View on-screen invoice"
                        >
                          <Eye size={15} />
                        </button>

                        {/* Print Invoice directly */}
                        <button
                          onClick={() => {
                            if (onPrintInvoice) {
                              onPrintInvoice(inv);
                            }
                          }}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer transition-all"
                          title="Print / Save PDF for buyer"
                        >
                          <Printer size={15} />
                        </button>

                        {/* Delete permanently */}
                        <button
                          onClick={() => setInvoiceToDelete(inv)}
                          className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer transition-all"
                          title="Delete registry record"
                        >
                          <Trash2 size={15} />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* On-screen Preview and Print/PDF Modal Overlay */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-start justify-center p-4 md:p-8 z-50 overflow-y-auto print:p-0 print:absolute">
            
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-150 rounded-3xl max-w-4xl w-full p-4 md:p-6 shadow-2xl relative border border-slate-200/50 my-2 print:border-0 print:bg-white print:shadow-none print:my-0 print:p-0"
            >
              
              {/* Overlay Control Bar */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 print:hidden">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm font-display">Tax Invoice Detail Review (# {selectedInvoice.invoiceNo})</h3>
                  <p className="text-xs text-slate-500">Press print to output this document directly to system printer or format PDF physical copies.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 bg-white border border-slate-250 text-slate-700 hover:bg-slate-50 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    <Printer size={14} /> Print / Save PDF
                  </button>
                  
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="p-1.5 border border-slate-200 text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-50 rounded-lg cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Print container Frame */}
              <div className="overflow-x-auto p-1 bg-white rounded-2xl shadow-inner max-h-[80vh] print:max-h-full print:border-0 print:bg-white print:p-0">
                <div className="min-w-[550px] md:min-w-0 print:min-w-0">
                  <PrintInvoice invoice={selectedInvoice} business={business} />
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Guard Delete Confirmation Modal */}
      {invoiceToDelete && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in face-in duration-75">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-100">
            <h3 className="text-sm font-bold text-slate-950 mb-1.5">Are you absolutely sure?</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              You are deleting Invoice <span className="font-bold text-slate-800 font-mono">"{invoiceToDelete.invoiceNo}"</span>.
              This will remove the entry from aggregate revenue counts in your dashboard, calculations, and local logs permanently.
            </p>
            <div className="flex justify-end gap-3.5 border-t border-slate-100 pt-3.5">
              <button
                onClick={() => setInvoiceToDelete(null)}
                className="px-4 py-1.5 text-xs text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
              >
                Keep Record
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 text-xs bg-red-650 hover:bg-red-700 text-white rounded-lg shadow-sm cursor-pointer"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
