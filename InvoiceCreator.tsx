/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Customer, Invoice, InvoiceItem, BusinessProfile } from '../types';
import { calculateItemTotals} from '../utils/calculations';
import { Plus, Trash2, Eye, Printer, FileDown, CheckCircle, Sparkles, Building, Briefcase, Calendar, PlusCircle, Search, Save, X, Phone, MapPin, Hash } from 'lucide-react';
import { PrintInvoice } from './PrintInvoice';
import { motion, AnimatePresence } from 'motion/react';

interface InvoiceCreatorProps {
  business: BusinessProfile;
  customers: Customer[];
  invoicesCount: number;
  onSaveInvoice: (invoice: Invoice) => void;
  onAddCustomer: (customer: Customer) => void;
  onShowToast: (message: string, type: 'success' | 'error') => void;
  activeAdmin?: string;
  onPrintInvoice?: (invoice: Invoice) => void;
}

export const InvoiceCreator: React.FC<InvoiceCreatorProps> = ({
  business,
  customers,
  invoicesCount,
  onSaveInvoice,
  onAddCustomer,
  onShowToast,
  activeAdmin,
  onPrintInvoice,
}) => {
  // Generate default Invoice No
  const defaultInvoiceNo = useMemo(() => {
    const padded = String(invoicesCount + 1).padStart(4, '0');
    return `VA/${new Date().getFullYear()}/${padded}`;
  }, [invoicesCount]);

  // Main Form fields
  const [invoiceNo, setInvoiceNo] = useState(defaultInvoiceNo);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');

  // Customer selection
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGst, setCustomerGst] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [saveCustomerToDb, setSaveCustomerToDb] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Line items state
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'item-1',
      name: '',
      quantity: 1,
      rate: 0,
      gstPercentage: 18,
      taxableValue: 0,
      cgst: 0,
      sgst: 0,
      total: 0,
    },
  ]);

  // Invoice view / print / download preview
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Auto-fill form values when default invoice number recalculates
  useEffect(() => {
    setInvoiceNo(defaultInvoiceNo);
  }, [defaultInvoiceNo]);

  // Close customer dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter existing customers for autocomplete matching typed string
  const matchedCustomers = useMemo(() => {
    if (!customerName.trim()) return [];
    return customers.filter((c) =>
      c.name.toLowerCase().includes(customerName.toLowerCase())
    );
  }, [customerName, customers]);

  const handleSelectCustomer = (selected: Customer) => {
    setCustomerName(selected.name);
    setCustomerAddress(selected.address);
    setCustomerGst(selected.gstNumber);
    setCustomerPhone(selected.phone);
    setSaveCustomerToDb(false); // Already saved!
    setShowCustomerDropdown(false);
    onShowToast(`Selected buyer ${selected.name}`, 'success');
  };

  // Line item manipulation
  const addItemRow = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        name: '',
        quantity: 1,
        rate: 0,
        gstPercentage: 18,
        taxableValue: 0,
        cgst: 0,
        sgst: 0,
        total: 0,
      },
    ]);
  };

  const removeItemRow = (id: string) => {
    if (items.length <= 1) {
      onShowToast('Invoice must have at least one product row', 'error');
      return;
    }
    setItems(items.filter((itm) => itm.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const updated = items.map((itm) => {
      if (itm.id !== id) return itm;

      const updatedRow = { ...itm, [field]: value };

      // Re-trigger GST Calculations for this product row
      if (field === 'quantity' || field === 'rate' || field === 'gstPercentage') {
        const qty = Number(updatedRow.quantity) || 0;
        const rate = Number(updatedRow.rate) || 0;
        const gstPct = Number(updatedRow.gstPercentage) || 0;

        const calcs = calculateItemTotals(qty, rate, gstPct);
        updatedRow.taxableValue = calcs.taxableValue;
        updatedRow.cgst = calcs.cgst;
        updatedRow.sgst = calcs.sgst;
        updatedRow.total = calcs.total;
      }

      return updatedRow;
    });
    setItems(updated);
  };

  // Real-time aggregates summation
  const aggregates = useMemo(() => {
    let subtotal = 0;
    let totalCGST = 0;
    let totalSGST = 0;

    items.forEach((itm) => {
      subtotal += itm.taxableValue;
      totalCGST += itm.cgst;
      totalSGST += itm.sgst;
    });

    const totalGST = totalCGST + totalSGST;
    const grandTotal = subtotal + totalGST;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      totalCGST: Math.round(totalCGST * 100) / 100,
      totalSGST: Math.round(totalSGST * 100) / 100,
      totalGST: Math.round(totalGST * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
    };
  }, [items]);

  const compileInvoiceObject = (): Invoice | null => {
    if (!invoiceNo.trim()) {
      onShowToast('Please provide an Invoice Number', 'error');
      return null;
    }
    if (!customerName.trim()) {
      onShowToast('Please provide a Customer Name', 'error');
      return null;
    }
    
    // Check key fields on products
    const emptyRow = items.find((itm) => !itm.name.trim() || itm.rate <= 0);
    if (emptyRow) {
      onShowToast('All product rows must have a valid description name and rate', 'error');
      return null;
    }

    const customerObj: Customer = {
      id: Date.now().toString() + '-cust',
      name: customerName.trim(),
      address: customerAddress.trim(),
      gstNumber: customerGst.trim().toUpperCase(),
      phone: customerPhone.trim(),
    };

    return {
      id: Date.now().toString(),
      invoiceNo: invoiceNo.trim().toUpperCase(),
      date,
      dueDate: dueDate || undefined,
      customer: customerObj,
      items,
      subtotal: aggregates.subtotal,
      totalCGST: aggregates.totalCGST,
      totalSGST: aggregates.totalSGST,
      totalGST: aggregates.totalGST,
      grandTotal: aggregates.grandTotal,
      issuedBy: activeAdmin,
    };
  };

  const handleSaveAndPreview = () => {
    const inv = compileInvoiceObject();
    if (inv) {
      setPreviewInvoice(inv);
    }
  };

  const finalizeAndClose = () => {
    if (previewInvoice) {
      // Save customer details for the future if option was ticked
      if (saveCustomerToDb) {
        // Is this customer already registered? Let's check matching GSTIN or name
        const matchExists = customers.some(
          (c) =>
              (previewInvoice.customer.gstNumber && c.gstNumber === previewInvoice.customer.gstNumber) ||
              c.name.toLowerCase() === previewInvoice.customer.name.toLowerCase()
        );
        if (!matchExists) {
          onAddCustomer(previewInvoice.customer);
          onShowToast('Customer saved to global contacts', 'success');
        }
      }

      onSaveInvoice(previewInvoice);
      setPreviewInvoice(null);
      onShowToast(`Invoice ${previewInvoice.invoiceNo} issued!`, 'success');

      // Refresh state fields for clean sheet
      setInvoiceNo('');
      setCustomerName('');
      setCustomerAddress('');
      setCustomerGst('');
      setCustomerPhone('');
      setSaveCustomerToDb(false);
      setItems([{
        id: 'item-1',
        name: '',
        quantity: 1,
        rate: 0,
        gstPercentage: 18,
        taxableValue: 0,
        cgst: 0,
        sgst: 0,
        total: 0,
      }]);
    }
  };

  const handlePrint = () => {
    if (previewInvoice && onPrintInvoice) {
      onPrintInvoice(previewInvoice);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div>
        <h2 className="text-xl font-bold font-display text-slate-900">Issue GST Bill</h2>
        <p className="text-sm text-slate-500">Draft compliant invoices instantly with localized sub-calculations.</p>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Columns: Main input Sheet */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Invoice No and dates card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
              <Calendar size={13} /> Invoice Registry Metadata
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-500 mb-1">Invoice number *</label>
                <input
                  type="text"
                  required
                  id="creator-invoice-no"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  placeholder="e.g. VA/26/013"
                  className="w-full border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-2.5 py-2.5 font-mono uppercase bg-slate-50/40 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1">Invoice Date *</label>
                <input
                  type="date"
                  required
                  id="creator-date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-2.5 py-2.5 font-mono bg-slate-50/40 text-slate-800 animate-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1">Payment Due Date (optional)</label>
                <input
                  type="date"
                  id="creator-due-date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-2.5 py-2.5 font-mono bg-slate-50/40 text-slate-800 animate-none"
                />
              </div>
            </div>
          </div>

          {/* Customer Metadata Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 relative">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
              <Building size={13} /> Consignee Customer Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* Autocomplete Name */}
              <div className="relative" ref={dropdownRef}>
                <label className="block font-semibold text-slate-500 mb-1">Customer Identifier/Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    id="creator-cust-name"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    placeholder="Search existing customer or enter new name"
                    className="w-full border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-8 pr-3 py-2.5 bg-slate-50/40 text-slate-800"
                  />
                  <Search className="absolute left-2.5 top-3 text-slate-400 shrink-0" size={14} />
                </div>

                {/* Autocomplete dropdown suggestions */}
                {showCustomerDropdown && matchedCustomers.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-150 rounded-xl shadow-lg z-20 max-h-52 overflow-y-auto divide-y divide-slate-100 divide-solid">
                    {matchedCustomers.map((cust) => (
                      <button
                        key={cust.id}
                        type="button"
                        onClick={() => handleSelectCustomer(cust)}
                        className="w-full text-left p-3 hover:bg-slate-50 flex flex-col gap-0.5 text-xs transition-colors cursor-pointer"
                      >
                        <span className="font-semibold text-slate-900">{cust.name}</span>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 font-mono">
                          {cust.phone && <span>Phone: {cust.phone}</span>}
                          {cust.gstNumber && <span className="text-blue-600 font-bold">GSTIN: {cust.gstNumber}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone number */}
              <div>
                <label className="block font-semibold text-slate-500 mb-1">Phone Number</label>
                <input
                  type="tel"
                  id="creator-cust-phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  onInput={(e: React.FormEvent<HTMLInputElement>) => setCustomerPhone(e.currentTarget.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2.5 bg-slate-50/40 text-slate-800"
                />
              </div>

              {/* Billing GSTIN */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-500 mb-1">Customer GSTIN (optional)</label>
                <input
                  type="text"
                  id="creator-cust-gst"
                  maxLength={15}
                  value={customerGst}
                  onChange={(e) => setCustomerGst(e.target.value)}
                  placeholder="e.g. 07AAAAA1111A1Z1"
                  className="w-full font-mono border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2.5 bg-slate-50/40 text-slate-800 uppercase"
                />
              </div>

              {/* Billing Address */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-500 mb-1">Detailed Billing Address</label>
                <textarea
                  id="creator-cust-address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Specify Street and State"
                  rows={2}
                  className="w-full border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2.5 bg-slate-50/40 text-slate-800"
                />
              </div>
            </div>

            {/* Checkbox: Save new customer to DB? */}
            {customerName.trim() && !customers.some((c) => c.name.toLowerCase() === customerName.toLowerCase()) && (
              <div className="flex items-center gap-2 mt-4 text-xs select-none">
                <input
                  type="checkbox"
                  id="checkbox-save-consignee"
                  checked={saveCustomerToDb}
                  onChange={(e) => setSaveCustomerToDb(e.target.checked)}
                  className="rounded border-slate-300 text-blue-650 h-4 w-4 bg-slate-50 focus:ring-blue-500/30"
                />
                <label htmlFor="checkbox-save-consignee" className="font-medium text-slate-600 flex items-center gap-1 cursor-pointer">
                  <Sparkles size={13} className="text-amber-500" /> Save customer profile for future fast-billing
                </label>
              </div>
            )}
          </div>

          {/* Line items section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                <Briefcase size={13} /> Product / Supply Items List
              </h3>
              
              <button
                type="button"
                onClick={addItemRow}
                id="btn-creator-add-item-row"
                className="text-xs font-bold text-blue-650 hover:text-blue-750 flex items-center gap-1 cursor-pointer bg-blue-50 border border-blue-100/60 px-2.5 py-1.5 rounded-lg hover:underline transition-all"
              >
                <PlusCircle size={15} /> Add Line Row
              </button>
            </div>

            {/* Dense Items Table layout */}
            <div className="space-y-4">
              
              {/* Table header for desktops */}
              <div className="hidden md:grid md:grid-cols-12 gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                <div className="col-span-4">Product Name/Description</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-center">Rate (₹)</div>
                <div className="col-span-2 text-center">GST (%)</div>
                <div className="col-span-1 text-right">Taxable</div>
                <div className="col-span-1 text-center">Action</div>
              </div>

              {/* Items Rows */}
              <div className="space-y-3 md:space-y-2 divide-y md:divide-y-0 divide-slate-150 divide-dashed">
                {items.map((itm, idx) => (
                  <div
                    key={itm.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-3 md:pt-0"
                  >
                    
                    {/* Item Description */}
                    <div className="md:col-span-4 text-xs">
                      <label className="block md:hidden font-bold text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">Product Name</label>
                      <input
                        type="text"
                        required
                        value={itm.name}
                        onChange={(e) => handleUpdateItem(itm.id, 'name', e.target.value)}
                        placeholder="e.g. Copper Wire Coils"
                        className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-2.5 py-2 text-xs bg-slate-50/20 font-medium"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-2 text-xs">
                      <label className="block md:hidden font-bold text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">Qty</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={itm.quantity || ''}
                        onChange={(e) => handleUpdateItem(itm.id, 'quantity', Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full text-center font-mono border border-slate-200 focus:border-blue-500 rounded-lg px-1.5 py-2 text-xs"
                      />
                    </div>

                    {/* Rate */}
                    <div className="md:col-span-2 text-xs">
                      <label className="block md:hidden font-bold text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">Rate (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={itm.rate || ''}
                        onChange={(e) => handleUpdateItem(itm.id, 'rate', Math.max(0, parseFloat(e.target.value) || 0))}
                        placeholder="0.00"
                        className="w-full text-center font-mono border border-slate-200 focus:border-blue-500 rounded-lg px-1.5 py-2 text-xs"
                      />
                    </div>

                    {/* GST Pct dropdown */}
                    <div className="md:col-span-2 text-xs">
                      <label className="block md:hidden font-bold text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">GST Rate</label>
                      <select
                        value={itm.gstPercentage}
                        onChange={(e) => handleUpdateItem(itm.id, 'gstPercentage', parseInt(e.target.value))}
                        className="w-full border border-slate-200 focus:border-blue-500 rounded-lg px-1 py-1.5 text-xs text-center font-mono bg-white"
                      >
                        <option value="0">0% (Nil)</option>
                        <option value="5">5% (Utility)</option>
                        <option value="12">12% (Standard)</option>
                        <option value="18">18% (Standard II)</option>
                        <option value="28">28% (Luxury)</option>
                      </select>
                    </div>

                    {/* Computed Taxable Value */}
                    <div className="md:col-span-1 text-right text-xs font-mono font-medium text-slate-700">
                      <span className="md:hidden text-[9px] font-sans font-semibold text-slate-400 uppercase mr-1">Taxable:</span>
                      ₹{(itm.taxableValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>

                    {/* Remove row */}
                    <div className="col-span-1 text-center md:flex md:items-center md:justify-center p-1 md:p-0">
                      <button
                        type="button"
                        onClick={() => removeItemRow(itm.id)}
                        className="w-full md:w-auto flex items-center justify-center gap-1 cursor-pointer p-1.5 border md:border-0 border-red-100 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-colors"
                        title="Delete supply Row"
                      >
                        <Trash2 size={15} />
                        <span className="md:hidden text-[10px] font-bold text-red-650">Delete Row</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side summary column */}
        <div className="bg-white border border-slate-250 rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2.5 font-mono">
            Compliant billing Summary
          </h3>

          <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed font-sans">
            <div className="flex justify-between items-center">
              <span>Total Taxable Subtotal</span>
              <span className="font-mono font-bold text-slate-805">
                ₹{aggregates.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-500 font-mono text-[11px]">
              <span>Central CGST Component (50%)</span>
              <span>₹{aggregates.totalCGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center text-slate-500 font-mono text-[11px]">
              <span>State SGST Component (50%)</span>
              <span>₹{aggregates.totalSGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-y border-slate-100 font-medium text-slate-700 bg-slate-50/40 px-1 rounded">
              <span>Aggregate GST Tax Collected</span>
              <span className="font-mono">
                ₹{aggregates.totalGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-2 text-slate-900 border-dashed border-slate-205 border-t">
              <span className="font-bold text-sm text-slate-800">Grand Total</span>
              <span className="font-black text-lg text-blue-850 font-mono">
                ₹{aggregates.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveAndPreview}
              id="btn-creator-trigger-preview"
              className="w-full bg-blue-650 hover:bg-blue-700 text-white font-bold p-3.5 rounded-xl text-sm shadow-md shadow-blue-105 hover:shadow-lg hover:shadow-blue-200 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Eye size={16} /> Draft Invoice & Preview
            </button>
          </div>
        </div>
      </div>

      {/* Invoice On-Screen Preview Modal (Print format template matches closely) */}
      <AnimatePresence>
        {previewInvoice && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center p-4 md:p-8 z-50 overflow-y-auto print:p-0 print:m-0 print:absolute">
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-slate-100 rounded-3xl max-w-4xl w-full p-4 md:p-6 shadow-2xl relative border border-slate-200/80 my-2 print:border-0 print:bg-white print:shadow-none print:my-0 print:p-0"
            >
              
              {/* Modal sticky bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-200/60 print:hidden">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm md:text-base">Tax Invoice Preview Dashboard</h3>
                  <p className="text-xs text-slate-500">Ensure GST percentages are correct. Press print or download.</p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 bg-white border border-slate-250 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    <Printer size={15} /> Print/Save PDF
                  </button>

                  <button
                    onClick={finalizeAndClose}
                    className="flex items-center gap-1.5 bg-blue-650 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-xs font-semibold shadow-md cursor-pointer"
                  >
                    <CheckCircle size={15} /> Save & Issue Invoice
                  </button>

                  <button
                    onClick={() => setPreviewInvoice(null)}
                    className="p-2 border border-slate-200 text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-50 rounded-xl cursor-pointer"
                    title="Close Preview"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Printable frame section container */}
              <div className="overflow-x-auto p-1.5 bg-slate-50 rounded-2xl border border-slate-150 shadow-inner max-h-[80vh] print:max-h-full print:border-0 print:bg-white print:p-0">
                <div className="min-w-[640px] md:min-w-0 print:min-w-0">
                  <PrintInvoice invoice={previewInvoice} business={business} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
