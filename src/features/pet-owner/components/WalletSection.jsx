import React, { useState } from "react";
import { Wallet, Plus } from "lucide-react";
import toast from "react-hot-toast";
import StripeCheckoutModal from "./StripeCheckoutModal";
import { useAuthStore } from "../../auth/store/authStore";

export default function WalletSection({ wallet, fetchWallet }) {
  const { user } = useAuthStore();
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);

  const handlePaymentSuccess = async (amountStr) => {
    if (!user?.id) return;

    // Ensure amount is a number
    const amount = parseFloat(amountStr);

    toast.success(`Successfully added ₹${amount} to your wallet!`);
    setIsStripeModalOpen(false);

    // Fetch wallet after a short delay to allow webhook to process
    setTimeout(() => {
      if (fetchWallet) fetchWallet();
    }, 2000);
  };

  const handleTopUp = () => {
    setIsStripeModalOpen(true);
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 text-slate-500 font-semibold">
            <Wallet size={18} className="text-emerald-500" /> Wallet Balance
          </div>
          <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
            Active
          </span>
        </div>
        <div>
          <div className="text-4xl font-black text-slate-900 tracking-tight">
            <span className="text-slate-400 font-medium text-2xl">₹</span>
            {Number(wallet?.balance || 0).toFixed(2)}
          </div>
          <div className="flex gap-2 mt-6">
            <button
              onClick={handleTopUp}
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Recharge Wallet
            </button>
          </div>
        </div>
      </div>
      <StripeCheckoutModal
        isOpen={isStripeModalOpen}
        onClose={() => setIsStripeModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}
