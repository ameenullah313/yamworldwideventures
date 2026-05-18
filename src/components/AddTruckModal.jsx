import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AddTruckModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    truckType: '',
    model: '',
    color: '',
    chassisNo: '',
    engine: '',
    horsePower: '',
    // price field removed as requested
    condition: 'used',
    quantity: '1'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-white/10 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Fixed Header */}
        <div className="flex-none p-6 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600/20 p-2 rounded-lg">
                <Truck className="w-6 h-6 text-blue-400" />
             </div>
             <h2 className="text-xl font-bold text-white">Add New Truck Inventory</h2>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm" className="hover:bg-white/10 text-white/70 hover:text-white rounded-full h-8 w-8 p-0">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="add-truck-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200">Truck Type</label>
                <input
                  type="text"
                  name="truckType"
                  value={formData.truckType}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Tipper, Head, Trailer"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200">Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Mercedes Actros 2040"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Red"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200">Chassis No.</label>
                <input
                  type="text"
                  name="chassisNo"
                  value={formData.chassisNo}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Chassis Number"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200">Engine Type</label>
                <input
                  type="text"
                  name="engine"
                  value={formData.engine}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. V6, V8"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200">Horse Power</label>
                <input
                  type="text"
                  name="horsePower"
                  value={formData.horsePower}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 480HP"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>

               <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200">Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="used">Used / Tokunbo</option>
                  <option value="new">Brand New</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex-none p-6 border-t border-white/10 bg-slate-800/50 flex justify-end gap-3">
          <Button type="button" onClick={onClose} variant="ghost" className="text-white hover:bg-white/10">
            Cancel
          </Button>
          <Button type="submit" form="add-truck-form" className="bg-blue-600 hover:bg-blue-500 text-white">
            <Save className="w-4 h-4 mr-2" />
            Save Truck
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AddTruckModal;