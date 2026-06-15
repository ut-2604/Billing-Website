/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Customer } from '../types';
import { Plus, Search, Edit2, Trash2, X, Phone, MapPin, Hash, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomerManagerProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export const CustomerManager: React.FC<CustomerManagerProps> = ({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [phone, setPhone] = useState('');
  
  // For Delete Confirmation Modal
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const resetForm = () => {
    setId('');
    setName('');
    setAddress('');
    setGstNumber('');
    setPhone('');
    setIsEditing(false);
    setIsAdding(false);
  };

  const handleEditClick = (cust: Customer) => {
    setId(cust.id);
    setName(cust.name);
    setAddress(cust.address);
    setGstNumber(cust.gstNumber);
    setPhone(cust.phone);
    setIsEditing(true);
    setIsAdding(false);
  };

  const validateForm = () => {
    if (!name.trim()) {
      onShowToast('Customer Name is required', 'error');
      return false;
    }
    if (phone && !/^\+?[0-9\s\-]{10,15}$/.test(phone.trim())) {
      onShowToast('Please enter a valid Phone Number', 'error');
      return false;
    }
    const gstTrimmed = gstNumber.trim().toUpperCase();
    if (gstTrimmed) {
      if (gstTrimmed.length !== 15) {
        onShowToast('GSTIN must be exactly 15 characters long if provided', 'error');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const targetGst = gstNumber.trim().toUpperCase();

    if (isEditing) {
      onUpdateCustomer({
        id,
        name: name.trim(),
        address: address.trim(),
        gstNumber: targetGst,
        phone: phone.trim(),
      });
      onShowToast('Customer updated successfully', 'success');
    } else {
      onAddCustomer({
        id: Date.now().toString(),
        name: name.trim(),
        address: address.trim(),
        gstNumber: targetGst,
        phone: phone.trim(),
      });
      onShowToast('New customer added successfully', 'success');
    }
    resetForm();
  };

  const triggerDelete = (cust: Customer) => {
    setCustomerToDelete(cust);
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      onDeleteCustomer(customerToDelete.id);
      onShowToast(`Deleted customer "${customerToDelete.name}"`, 'success');
      setCustomerToDelete(null);
    }
  };

  const filteredCustomers = customers.filter((cust) => {
    const q = searchQuery.toLowerCase();
    return (
      cust.name.toLowerCase().includes(q) ||
      cust.phone.includes(q) ||
      cust.gstNumber.toLowerCase().includes(q) ||
      cust.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900">Customer Records</h2>
          <p className="text-sm text-slate-500">Manage saved client directories for instant billing integration.</p>
        </div>
        
        {!isAdding && !isEditing && (
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            id="btn-add-customer-trigger"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-md shadow-blue-200 transition-colors cursor-pointer"
          >
            <Plus size={18} /> Add New Customer
          </button>
        )}
      </div>

      {/* Form Area - Expanding dynamically */}
      <AnimatePresence>
        {(isAdding || isEditing) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 overflow-hidden max-w-3xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                {isEditing ? 'Modify Customer Record' : 'Add New Customer Profile'}
              </h3>
              <button
                onClick={resetForm}
                className="p-1 px-2 rounded-lg hover:bg-slate-150 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    id="input-customer-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full business or personal name"
                    className="w-full text-sm border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2.5 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Phone Number (optional)
                  </label>
                  <input
                    type="tel"
                    id="input-customer-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full text-sm border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2.5 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  GST Number (15-char ID, optional)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  id="input-customer-gstin"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="e.g. 07AAAAA1111A1Z1"
                  className="w-full text-sm font-mono border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2.5 bg-slate-50/50 uppercase"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Required for offering B2B tax credits. Leave blank for unregistered consumers (URD).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Billing Address
                </label>
                <textarea
                  id="input-customer-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Specify registered street and state billing address"
                  rows={2}
                  className="w-full text-sm border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2.5 bg-slate-50/50"
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-customer-submit"
                  className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <Check size={16} />
                  {isEditing ? 'Save Changes' : 'Register Customer'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table & Search List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              id="input-customer-search"
              placeholder="Search by customer name, phone, or GST number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="text-xs text-slate-400 font-medium ml-auto">
            Showing {filteredCustomers.length} of {customers.length} registered profiles
          </div>
        </div>

        {/* List Grid / Desktop Table */}
        {filteredCustomers.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
              <Search size={22} />
            </div>
            <h3 className="font-bold text-slate-700 text-sm">No customers found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {searchQuery ? 'Adjust your search string or clear filters.' : 'Get started by creating your first buyer profile.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">GST Number</th>
                  <th className="p-4">Billing Address</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/30">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{cust.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {cust.id}</div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Phone size={13} className="text-slate-400" />
                        {cust.phone || <em className="text-slate-300">not provided</em>}
                      </span>
                    </td>
                    <td className="p-4">
                      {cust.gstNumber ? (
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded text-[11px]">
                          {cust.gstNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">URD (Consumer)</span>
                      )}
                    </td>
                    <td className="p-4 max-w-xs truncate text-slate-500" title={cust.address}>
                      <span className="flex items-start gap-1">
                        <MapPin size={13} className="text-slate-350 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{cust.address || <em className="text-slate-300">No address recorded</em>}</span>
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(cust)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg cursor-pointer transition-colors"
                          title="Edit Customer"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => triggerDelete(cust)}
                          className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer transition-colors"
                          title="Delete Customer"
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

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-950 mb-2">Delete Customer Record</h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to permanently delete customer <span className="font-bold text-slate-800">"{customerToDelete.name}"</span>?
              This action cannot be undone. Any historical invoices reference will still hold, but the client profile will be removed from autocomplete sheets.
            </p>
            <div className="flex justify-end gap-3 ... border-t border-slate-100 pt-4">
              <button
                onClick={() => setCustomerToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
              >
                No, Keep
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 text-xs font-semibold bg-red-650 hover:bg-red-700 text-white rounded-xl shadow-md cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
