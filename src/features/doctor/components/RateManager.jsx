import React from 'react';
import { X } from 'lucide-react';

export default function RateManager({
  isRateModalOpen,
  setIsRateModalOpen,
  rateInput,
  setRateInput,
  submitRateLoading,
  handleSubmitRate,
  profileData
}) {
  if (!isRateModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-900">Set Consultation Rate</h3>
          <button 
            onClick={() => setIsRateModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Rate per minute (₹)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-400 font-bold">₹</span>
              </div>
              <input
                type="number"
                min="0"
                placeholder="e.g. 50"
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Current Approved Rate: <strong className="text-slate-700">₹{profileData?.per_minute_rate || 0}/min</strong>
            </p>
            {profileData?.rate_status === 'Pending Approval' && (
              <p className="text-xs text-amber-600 mt-1 font-semibold">
                You have a pending request for ₹{profileData?.pending_rate_request}/min.
              </p>
            )}
            <p className="text-xs text-indigo-600 mt-3 font-semibold bg-indigo-50 p-2 rounded-lg border border-indigo-100">
              Note: All rate changes require Admin approval before taking effect. Platform fee is 30%.
            </p>
          </div>
          <button 
            onClick={handleSubmitRate}
            disabled={submitRateLoading || !rateInput}
            className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitRateLoading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
