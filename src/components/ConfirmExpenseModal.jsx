import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ConfirmExpenseModal = ({ expense, onClose, onConfirm }) => {
  const [formData, setFormData] = useState({
    receiverName: '',
    receiverPhone: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.receiverName.trim() || !formData.receiverPhone.trim()) {
      toast({
        title: "Required Fields Missing",
        description: "Please enter the receiver's name and phone number to confirm payment.",
        variant: "destructive"
      });
      return;
    }
    onConfirm(expense.id, formData);
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
            <CheckCircle className="w-5 h-5 text-green-400" />
            <h2 className="font-bold">Confirm Payment Receipt</h2>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
            <p className="text-blue-200 text-sm mb-1">Confirming payment for:</p>
            <p className="text-white font-medium">{expense.purpose}</p>
            <p className="text-2xl font-bold text-white mt-2">₦{parseFloat(expense.amount).toLocaleString()}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1.5">Receiver Name <span className="text-red-400">*</span></label>
            <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                <input
                type="text"
                value={formData.receiverName}
                onChange={(e) => setFormData({...formData, receiverName: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Who received the money?"
                required
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1.5">Receiver Phone Number <span className="text-red-400">*</span></label>
             <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                <input
                type="tel"
                value={formData.receiverPhone}
                onChange={(e) => setFormData({...formData, receiverPhone: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Receiver's phone number"
                required
                />
            </div>
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
              className="flex-1 bg-green-600 hover:bg-green-500 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm & Print
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ConfirmExpenseModal;