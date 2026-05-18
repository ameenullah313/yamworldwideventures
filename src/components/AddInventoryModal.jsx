import React, { useState } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, Save, Ban, GripHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AddInventoryModal = ({ onClose, onAdd }) => {
  const controls = useDragControls();
  const [formData, setFormData] = useState({
    category: 'Truck',
    truckType: '',
    model: '',
    color: '',
    condition: 'new',
    quantity: '',
    cabin: '',
    engine: '',
    horsePower: ''
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

  const handleCancel = () => {
    setFormData({
      category: 'Truck',
      truckType: '',
      model: '',
      color: '',
      condition: 'new',
      quantity: '',
      cabin: '',
      engine: '',
      horsePower: ''
    });
    onClose();
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
        className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full border border-white/20 flex flex-col max-h-[90vh]"
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
            <h2 className="text-xl font-bold tracking-wide">Add Truck Record</h2>
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

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-blue-200 mb-1.5 text-sm font-medium">Truck Type</label>
                        <input
                            type="text"
                            name="truckType"
                            value={formData.truckType}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="e.g. Heavy Duty Loader"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-blue-200 mb-1.5 text-sm font-medium">Model</label>
                        <input
                            type="text"
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="e.g. Actros 2024"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-blue-200 mb-1.5 text-sm font-medium">Cabin Type</label>
                        <input
                            type="text"
                            name="cabin"
                            value={formData.cabin}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="e.g. Mega Space, Day Cab"
                        />
                    </div>

                    <div>
                        <label className="block text-blue-200 mb-1.5 text-sm font-medium">Engine Spec</label>
                        <input
                            type="text"
                            name="engine"
                            value={formData.engine}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="e.g. V8 Turbo Diesel"
                        />
                    </div>

                    <div>
                        <label className="block text-blue-200 mb-1.5 text-sm font-medium">Horse Power (HP)</label>
                        <input
                            type="text"
                            name="horsePower"
                            value={formData.horsePower}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="e.g. 450 HP"
                        />
                    </div>

                    <div>
                        <label className="block text-blue-200 mb-1.5 text-sm font-medium">Color</label>
                        <input
                            type="text"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="e.g. Yellow"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-blue-200 mb-1.5 text-sm font-medium">Condition</label>
                        <select
                            name="condition"
                            value={formData.condition}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                            required
                        >
                            <option value="new" className="bg-slate-800">New</option>
                            <option value="used" className="bg-slate-800">Used</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-blue-200 mb-1.5 text-sm font-medium">Quantity</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="0"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-6 mt-4 border-t border-white/10">
              <Button 
                type="button" 
                onClick={handleCancel} 
                variant="outline" 
                className="flex-1 h-12 text-base font-semibold border-red-500/30 text-red-300 hover:bg-red-500/10 hover:text-red-200 hover:border-red-500/50 transition-all"
              >
                <Ban className="w-5 h-5 mr-2" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-12 text-base font-bold bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20 transition-all"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Record
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AddInventoryModal;