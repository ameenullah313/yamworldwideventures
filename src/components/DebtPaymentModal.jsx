import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, Wallet, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const DebtPaymentModal = ({ sale, onClose, onPaymentComplete }) => {
  const [amountToPay, setAmountToPay] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  // Calculate totals
  const totalCost = (parseFloat(sale.amountPaid) || 0) + (parseFloat(sale.remainingBalance) || 0);
  const currentDebt = parseFloat(sale.remainingBalance) || 0;

  useEffect(() => {
    // Default to paying off the full debt
    setAmountToPay(currentDebt.toString());
  }, [currentDebt]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payment = parseFloat(amountToPay);

    if (isNaN(payment) || payment <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    if (payment > currentDebt) {
      setError(`Payment cannot exceed the outstanding debt of ₦${currentDebt.toLocaleString()}`);
      return;
    }

    // Process Update
    const updatedSale = { ...sale };
    updatedSale.amountPaid = (parseFloat(updatedSale.amountPaid) || 0) + payment;
    updatedSale.remainingBalance = (parseFloat(updatedSale.remainingBalance) || 0) - payment;

    // Check if fully paid
    if (updatedSale.remainingBalance <= 0) {
      updatedSale.paymentMode = 'full';
      updatedSale.remainingBalance = 0;
    }

    // Update in Supabase
    const { error: dbError } = await supabase
        .from('sales')
        .update({
            amountPaid: updatedSale.amountPaid,
            remainingBalance: updatedSale.remainingBalance,
            paymentMode: updatedSale.paymentMode
        })
        .eq('id', sale.id);

    if (dbError) {
        setError('System Error: Could not update sales record in database.');
        return;
    }
      
    toast({
        title: "Payment Successful",
        description: `Collected ₦${payment.toLocaleString()}. Receipt updated.`
    });

    onPaymentComplete(updatedSale);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 rounded-xl shadow-2xl max-w-md w-full border border-white/10 overflow-hidden"
      >
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-2 text-white">
            <CreditCard className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold">Process Outstanding Payment</h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white/50 hover:text-white hover:bg-white/10 rounded-full h-8 w-8 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Summary Card */}
          <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 space-y-3">
             <div className="flex justify-between text-sm">
                <span className="text-blue-200">Customer:</span>
                <span className="text-white font-medium">{sale.customerName}</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-blue-200">Item:</span>
                <span className="text-white font-medium">{sale.itemName}</span>
             </div>
             <div className="h-px bg-blue-500/20 my-2"></div>
             <div className="flex justify-between text-sm">
                <span className="text-blue-200">Total Sale Value:</span>
                <span className="text-white">₦{totalCost.toLocaleString()}</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-green-400">Already Paid:</span>
                <span className="text-green-400">₦{parseFloat(sale.amountPaid).toLocaleString()}</span>
             </div>
             <div className="flex justify-between items-center bg-red-500/10 p-2 rounded border border-red-500/20">
                <span className="text-red-300 font-bold text-sm">Outstanding Debt:</span>
                <span className="text-red-300 font-bold text-lg">₦{currentDebt.toLocaleString()}</span>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Amount to Pay Now (₦)</label>
            <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                <input
                    type="number"
                    value={amountToPay}
                    onChange={(e) => {
                        setAmountToPay(e.target.value);
                        setError('');
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg font-bold"
                    placeholder="0.00"
                    min="1"
                    max={currentDebt}
                    required
                />
            </div>
            {error && (
                <p className="text-red-400 text-xs mt-2">{error}</p>
            )}
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-white/10 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Pay & Print Receipt
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default DebtPaymentModal;