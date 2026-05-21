import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BulkConfirmExpenseModal = ({ selectedCount, totalAmount, onClose, onConfirm }) => {
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate receiver name
    if (!receiverName.trim()) {
      setError('Please enter the receiver name');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm({ receiverName: receiverName.trim(), receiverPhone: receiverPhone.trim() });
      // Reset form on success
      setReceiverName('');
      setReceiverPhone('');
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 rounded-xl border border-white/20 shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="bg-slate-800/50 p-6 border-b border-white/10 flex justify-between items-start">
          <div>
            <h2 
              id="modal-title"
              className="text-xl font-bold text-white flex items-center gap-2"
            >
              <Users className="w-5 h-5 text-green-400" aria-hidden="true" />
              Confirm Bulk Receipt
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              You are confirming payment receipt for <span className="text-white font-bold">{selectedCount}</span> items.
            </p>
          </div>
          <Button 
            onClick={onClose} 
            variant="ghost" 
            size="sm" 
            className="text-white/50 hover:text-white -mt-2 -mr-2"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="p-6">
          <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 mb-6 flex justify-between items-center">
            <span className="text-blue-200 text-sm">Total Amount Received:</span>
            <span className="text-2xl font-bold text-white">₦{totalAmount.toLocaleString()}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3 flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-xs text-red-200">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="receiver-name" className="block text-sm font-medium text-slate-300 mb-1">
                Receiver Name
              </label>
              <input 
                id="receiver-name"
                type="text" 
                required
                disabled={isSubmitting}
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-green-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Who collected the money?"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="receiver-phone" className="block text-sm font-medium text-slate-300 mb-1">
                Receiver Phone (Optional)
              </label>
              <input 
                id="receiver-phone"
                type="tel" 
                disabled={isSubmitting}
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-green-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Phone number"
              />
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3 flex gap-3 items-start">
              <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-yellow-200/80">
                By confirming, you acknowledge that the total amount has been released to the receiver mentioned above for all selected items.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                onClick={onClose}
                disabled={isSubmitting}
                variant="ghost" 
                className="flex-1 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                {isSubmitting ? 'Confirming...' : 'Confirm All'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default BulkConfirmExpenseModal;
