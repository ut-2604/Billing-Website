/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Invoice, BusinessProfile } from '../types';
import { formatCurrency, numberToWords } from '../utils/calculations';

interface PrintInvoiceProps {
  invoice: Invoice;
  business: BusinessProfile;
}

export const PrintInvoice: React.FC<PrintInvoiceProps> = ({ invoice, business }) => {
  return (
    <div className="bg-white text-slate-800 p-8 border border-slate-200 shadow-lg rounded-xl max-w-[210mm] mx-auto print-container" id="printable-invoice">
      {/* Invoice Banner & Supplier Header */}
      <div className="flex justify-between items-start border-b border-slate-300 pb-5 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-6 w-2 bg-blue-600 rounded-sm"></span>
            <h1 className="text-2xl font-bold font-display uppercase tracking-tight text-slate-900">
              {business.name || 'Vijeta Associates'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed max-w-sm">
            {business.address || 'Specify Business Address in Profile Settings'}
          </p>
          <div className="text-xs text-slate-700 pt-1 space-y-0.5">
            <p><span className="font-semibold text-slate-500">GSTIN:</span> <span className="font-mono text-slate-950 font-bold">{business.gstNumber || 'N/A'}</span></p>
            <p><span className="font-semibold text-slate-500">Phone:</span> {business.phone || 'N/A'}</p>
            {business.email && <p><span className="font-semibold text-slate-500">Email:</span> {business.email}</p>}
          </div>
        </div>

        <div className="text-right space-y-1">
          <span className="inline-block bg-slate-100 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider font-mono">
            Tax Invoice
          </span>
          <div className="pt-3 text-xs text-slate-600 space-y-1">
            <p>
              <span className="font-medium text-slate-400">Invoice No:</span>{' '}
              <span className="font-mono text-slate-900 font-bold text-sm bg-slate-50 px-1 py-0.5 border border-slate-100 rounded">
                {invoice.invoiceNo}
              </span>
            </p>
            <p>
              <span className="font-medium text-slate-400">Invoice Date:</span>{' '}
              <span className="text-slate-900 font-medium">{invoice.date}</span>
            </p>
            {invoice.dueDate && (
              <p>
                <span className="font-medium text-slate-400">Due Date:</span>{' '}
                <span className="text-slate-900 font-medium">{invoice.dueDate}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bill To Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs border-b border-slate-100 pb-5">
        <div>
          <h3 className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider mb-2">
            Billed To (Customer Details)
          </h3>
          <p className="text-sm font-bold text-slate-950">{invoice.customer.name}</p>
          <p className="text-slate-600 mt-1 whitespace-pre-line leading-relaxed">
            {invoice.customer.address || 'No address provided'}
          </p>
        </div>
        <div className="md:text-right flex flex-col md:items-end justify-center pt-2 md:pt-0">
          <div className="space-y-1 text-slate-700 bg-slate-50/50 p-2.5 border border-slate-100 rounded-lg max-w-sm">
            <p>
              <span className="font-medium text-slate-400">Customer GSTIN:</span>{' '}
              <span className="font-mono text-slate-950 font-bold">
                {invoice.customer.gstNumber || 'URD (Unregistered)'}
              </span>
            </p>
            <p>
              <span className="font-medium text-slate-400">Contact:</span>{' '}
              <span className="text-slate-950">{invoice.customer.phone || 'N/A'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-6 overflow-hidden border border-slate-200 rounded-lg">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-2 px-3">#</th>
              <th className="py-2 px-3">Product Description</th>
              <th className="py-2 px-3 text-center">Qty</th>
              <th className="py-2 px-3 text-right">Rate</th>
              <th className="py-2 px-3 text-center">Taxable Val</th>
              <th className="py-2 px-3 text-center">GST %</th>
              <th className="py-2 px-3 text-center">CGST</th>
              <th className="py-2 px-3 text-center">SGST</th>
              <th className="py-2 px-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {invoice.items.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-slate-50/30">
                <td className="py-2.5 px-3 text-slate-400 font-mono">{index + 1}</td>
                <td className="py-2.5 px-3 font-medium text-slate-900 break-words max-w-[200px]">
                  {item.name}
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-slate-600">{item.quantity}</td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                  {formatCurrency(item.rate).replace('INR', '')}
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                  {formatCurrency(item.taxableValue).replace('INR', '')}
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-slate-600 bg-slate-50/40">
                  {item.gstPercentage}%
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                  {formatCurrency(item.cgst).replace('INR', '')}
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                  {formatCurrency(item.sgst).replace('INR', '')}
                </td>
                <td className="py-2.5 px-3 text-right font-semibold font-mono text-slate-900">
                  {formatCurrency(item.total).replace('INR', '')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Totals Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-xs">
        {/* Left column: payment info or declarations */}
        <div className="space-y-4">
          {/* Bank Details */}
          {(business.bankName || business.bankAccountNo || business.bankIfsc) && (
            <div className="p-3 border border-slate-150 rounded-lg bg-slate-50/40 text-[11px] leading-relaxed">
              <h4 className="font-bold text-slate-700 mb-1 uppercase tracking-wider text-[9px]">
                Bank Details for Transfer:
              </h4>
              <p><span className="text-slate-400">Bank:</span> <span className="font-semibold">{business.bankName}</span></p>
              <p><span className="text-slate-400">Account No:</span> <span className="font-mono font-semibold text-slate-900">{business.bankAccountNo}</span></p>
              <p><span className="text-slate-400">IFSC Code:</span> <span className="font-mono font-semibold text-slate-900">{business.bankIfsc}</span></p>
            </div>
          )}

          <div className="text-[10px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-500 uppercase tracking-wider">Declarations & Terms:</p>
            <ol className="list-decimal pl-3 space-y-0.5">
              <li>Detailed GST breakdown splits the Interstate Supply or Intra-state Central and State components.</li>
              <li>Goods once sold will not be taken back or exchanged.</li>
              <li>Interest at 18% p.a. will be charged if payment is not received within due dates.</li>
            </ol>
          </div>
        </div>

        {/* Right column: calculated amounts */}
        <div className="space-y-2 border-t md:border-t-0 border-slate-200 pt-3 md:pt-0">
          <div className="space-y-2 text-slate-600">
            <div className="flex justify-between">
              <span>Total Taxable Value (Subtotal):</span>
              <span className="font-mono font-medium">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total CGST:</span>
              <span className="font-mono">{formatCurrency(invoice.totalCGST)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total SGST:</span>
              <span className="font-mono">{formatCurrency(invoice.totalSGST)}</span>
            </div>
            <div className="flex justify-between text-slate-700 bg-slate-50 p-1 rounded font-medium">
              <span>Total GST Amount (CGST+SGST):</span>
              <span className="font-mono">{formatCurrency(invoice.totalGST)}</span>
            </div>
            <div className="border-t border-slate-300 pt-2 flex justify-between text-base font-bold text-blue-800">
              <span>Grand Total:</span>
              <span className="font-mono font-black">{formatCurrency(invoice.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Words summary */}
      <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
        <p className="text-slate-400 italic">
          <span className="font-semibold text-slate-500 not-italic uppercase tracking-normal">Amount in Words:</span>{' '}
          {numberToWords(invoice.grandTotal)}
        </p>
      </div>

      {/* Signatory Area */}
      <div className="mt-12 flex justify-between items-end text-xs">
        <div className="text-[10px] text-slate-400">
          <p>Thank you for choosing Vijeta Associates!</p>
          <p className="text-[9px] font-mono mt-1">Ref ID: {invoice.id}</p>
        </div>
        <div className="text-center pt-2 w-56 flex flex-col items-center">
          <div className="h-10 w-full flex items-center justify-center italic text-[11px] text-slate-300">
            {/* Seal placeholder */}
            [ Authorized Signatory Seal ]
          </div>
          <div className="w-full border-t border-slate-400 mt-1"></div>
          <p className="font-semibold text-slate-800 mt-1 uppercase max-w-[200px] truncate text-[10px]">
            For {business.name || 'Vijeta Associates'}
          </p>
          <p className="text-[9px] text-slate-400">Authorized Signatory</p>
          {invoice.issuedBy && (
            <p className="text-[9px] text-slate-500 font-medium mt-1 select-all font-mono">
              Billed by: {invoice.issuedBy}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
