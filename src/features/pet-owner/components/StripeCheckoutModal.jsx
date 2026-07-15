import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CreditCard, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Load Stripe outside of component to avoid recreating the object on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ amount, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // We handle redirect manually or don't redirect for a modal flow
      },
      redirect: 'if_required' // Important for modal flow so it doesn't navigate away unless required (like 3D secure)
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      toast.success("Payment successful!");
      setIsProcessing(false);
      onSuccess(amount);
    } else {
      setErrorMessage("Something went wrong.");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <PaymentElement />
      </div>
      
      {errorMessage && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
          {errorMessage}
        </div>
      )}
      
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <CreditCard size={18} /> Pay ₹{amount}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default function StripeCheckoutModal({ isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState(500);
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('AMOUNT_SELECTION'); // AMOUNT_SELECTION or PAYMENT

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('AMOUNT_SELECTION');
      setClientSecret('');
      setAmount(500);
    }
  }, [isOpen]);

  const handleContinueToPayment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });
      
      const data = await response.json();
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setStep('PAYMENT');
      } else {
        toast.error("Could not initialize payment.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect to payment server. Make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-y-auto max-h-[95vh] animate-fade-in-up">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">
            {step === 'AMOUNT_SELECTION' ? 'Recharge Wallet' : 'Complete Payment'}
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'AMOUNT_SELECTION' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Select Amount to Add</label>
                <div className="grid grid-cols-2 gap-3">
                  {[100, 200, 500, 1000].map(val => (
                    <button
                      key={val}
                      onClick={() => setAmount(val)}
                      className={`py-3 px-4 rounded-xl border-2 font-bold text-lg transition-all ${
                        amount === val 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={handleContinueToPayment}
                disabled={isLoading}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Continue to Payment'}
              </button>
            </div>
          ) : (
            <div>
              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                  <CheckoutForm 
                    amount={amount} 
                    onSuccess={onSuccess} 
                    onClose={onClose}
                  />
                </Elements>
              ) : (
                <div className="flex justify-center items-center py-10">
                  <Loader2 size={24} className="animate-spin text-blue-600" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
