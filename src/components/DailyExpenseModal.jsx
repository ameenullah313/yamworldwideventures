import React, { useState } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, Save, Ban, GripHorizontal, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DailyExpenseModal = ({ onClose, onAdd }) => {
  const controls = useDragControls();
  const [formData, setFormData] = useState({
    purpose: '',
    amount: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-hidden">
      <motion.div
        drag
        dragListener={false}
        dragControls={controls}
        dragMomentum={false}
        initial={{ opacity: 0, scale: 0.9, y: 0 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-800 rounded-xl shadow-2xl max-w-md w-full border border-white/20 flex flex-col"
      >
        {/* Draggable Header */}
        <div 
          onPointerDown={(e) => controls.start(e)}
          className="bg-slate-900/50 p-4 cursor-move border-b border-white/10 flex justify-between items-center shrink-0 select-none"
        >
          <div className="flex items-center gap-3 text-white">
            <div className="bg-white/10 p-1.5 rounded">
                <GripHorizontal className="w-4 h-4 text-white/70" />
            </div>
            <h2 className="text-xl font-bold tracking-wide">Daily Spent Request</h2>
          </div>
          <Button 
            onClick={onClose} 
            variant="ghost" 
            size="sm" 
            className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-blue-200 mb-1.5 text-sm font-medium">Purpose of Payment</label>
                <input
                    type="text"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="e.g. Fuel for generator, Lunch, Transport..."
                    required
                />
            </div>

            <div>
                <label className="block text-blue-200 mb-1.5 text-sm font-medium">Amount (₦)</label>
                <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="0.00"
                    required
                    min="1"
                />
            </div>

            <div className="flex gap-4 pt-4 mt-2 border-t border-white/10">
              <Button 
                type="button" 
                onClick={onClose} 
                variant="outline" 
                className="flex-1 h-12 text-base font-semibold border-red-500/30 text-red-300 hover:bg-red-500/10 hover:text-red-200 hover:border-red-500/50 transition-all"
              >
                <Ban className="w-5 h-5 mr-2" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-12 text-base font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 transition-all"
              >
                <DollarSign className="w-5 h-5 mr-2" />
                Request Payment
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default DailyExpenseModal;