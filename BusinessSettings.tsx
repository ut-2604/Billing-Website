/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BusinessProfile } from '../types';
import { Save, Building2, HelpCircle, Check, CreditCard, Mail, Phone, MapPin, Hash } from 'lucide-react';

interface BusinessSettingsProps {
  business: BusinessProfile;
  onUpdateBusiness: (profile: BusinessProfile) => void;
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export const BusinessSettings: React.FC<BusinessSettingsProps> = ({
  business,
  onUpdateBusiness,
  onShowToast,
}) => {
  const [name, setName] = useState(business.name || 'Vijeta Associates');
  const [address, setAddress] = useState(business.address || '');
  const [gstNumber, setGstNumber] = useState(business.gstNumber || '');
  const [phone, setPhone] = useState(business.phone || '');
  const [email, setEmail] = useState(business.email || '');
  
  // Bank coordinates for full production details
  const [bankName, setBankName] = useState(business.bankName || '');
  const [bankAccountNo, setBankAccountNo] = useState(business.bankAccountNo || '');
  const [bankIfsc, setBankIfsc] = useState(business.bankIfsc || '');

  const validateForm = () => {
    if (!name.trim()) {
      onShowToast('Business Name cannot be empty', 'error');
      return false;
    }
    if (!phone.trim()) {
      onShowToast('Phone number is required for invoice headers', 'error');
      return false;
    }
    const gstTrimmed = gstNumber.trim().toUpperCase();
    if (gstTrimmed && gstTrimmed.length !== 15) {
      onShowToast('GST Number must be exactly 15 characters long', 'error');
      return false;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      onShowToast('Please enter a valid email address', 'error');
      return false;
    }
    return true;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onUpdateBusiness({
      name: name.trim(),
      address: address.trim(),
      gstNumber: gstNumber.trim().toUpperCase(),
      phone: phone.trim(),
      email: email.trim(),
      bankName: bankName.trim(),
      bankAccountNo: bankAccountNo.trim(),
      bankIfsc: bankIfsc.trim().toUpperCase(),
    });
    onShowToast('Business details updated successfully!', 'success');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold font-display text-slate-900">Business Profile</h2>
        <p className="text-sm text-slate-500">Configure your business credentials which dynamically print on tax-inclusive invoices.</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Business Credentials */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="text-blue-600 shrink-0" size={18} />
            <h3 className="font-bold text-sm text-slate-800">GST Registration Credentials</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Business Name *
              </label>
              <input
                type="text"
                required
                id="input-biz-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vijeta Associates"
                className="w-full text-sm border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2.5 bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  GST Number (GSTIN) *
                </label>
                <input
                  type="text"
                  required
                  id="input-biz-gst"
                  maxLength={15}
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="e.g. 07AAAAA1111A1Z1"
                  className="w-full text-sm font-mono border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2.5 bg-slate-50/50 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  id="input-biz-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full text-sm border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2.5 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Email Address (optional)
              </label>
              <input
                type="email"
                id="input-biz-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. contact@vijetaassociates.com"
                className="w-full text-sm border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2.5 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Full Address *
              </label>
              <textarea
                required
                id="input-biz-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                placeholder="e.g. Shop 24-B, Sector 5, Dwarka, New Delhi - 110075"
                className="w-full text-sm border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3 py-2.5 bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Bank Details & Live Preview card */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="text-blue-600 shrink-0" size={18} />
              <h3 className="font-bold text-sm text-slate-800 font-display">Bank Transfer Details</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. State Bank of India"
                  className="w-full text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-2.5 py-2 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={bankAccountNo}
                  onChange={(e) => setBankAccountNo(e.target.value)}
                  placeholder="e.g. 30041285491"
                  className="w-full text-xs font-mono border border-slate-200 focus:border-blue-500 rounded-lg px-2.5 py-2 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value)}
                  placeholder="e.g. SBIN0001234"
                  className="w-full text-xs font-mono border border-slate-200 focus:border-blue-500 rounded-lg px-2.5 py-2 bg-slate-50/50 uppercase"
                />
              </div>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 space-y-3 shadow-md">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono">Invoice Summary Header</h4>
            <div className="space-y-2 text-xs">
              <p className="font-bold text-sm">{name || 'Vijeta Associates'}</p>
              <p className="text-slate-400 font-mono text-[11px]">{gstNumber || '❌ Configure your GSTIN'}</p>
              <div className="w-full border-t border-slate-800 my-2"></div>
              <p className="text-slate-500 italic text-[11px]">This header appears automatically at the top-left of generated invoices.</p>
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="md:col-span-3 flex justify-end border-t border-slate-100 pt-5">
          <button
            type="submit"
            id="btn-save-settings"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-6 py-3 rounded-xl shadow-md cursor-pointer transition-colors"
          >
            <Check size={18} /> Update Business Record
          </button>
        </div>

      </form>
    </div>
  );
};
