import React, { useState } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, Save, Ban, GripHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AddEngineModal = ({ onClose, onAdd }) => {
  const controls = useDragControls();
  const [formData, setFormData] = useState({
    category: 'Engine', // Default selection
    name: '',
    details: '',
    quantity: ''
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
      category: 'Engine',
      name: '',
      details: '',
      quantity: ''
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
        className="bg-slate-800 rounded-xl shadow-2xl max-w-md w-full border border-white/20 flex flex-col max-h-[90vh]"
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
            <h2 className="text-xl font-bold tracking-wide">Add New Item</h2>
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
                
                {/* Category Selection */}
                <div>
                  <label className="block text-blue-200 mb-1.5 text-sm font-medium">Category Type</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="Engine" className="bg-slate-800 text-white">Engine</option>
                    <option value="Axle" className="bg-slate-800 text-white">Axle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-blue-200 mb-1.5 text-sm font-medium">{formData.category} Name</label>
                  <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder={`e.g. ${formData.category === 'Engine' ? 'V8 Diesel' : 'Brake Pads'}`}
                      required
                  />
                </div>

                <div>
                  <label className="block text-blue-200 mb-1.5 text-sm font-medium">Details/Description</label>
                  <textarea
                      name="details"
                      value={formData.details}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[100px]"
                      placeholder="e.g. Serial #12345, slight wear..."
                      required
                  />
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
                        min="1"
                    />
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

export default AddEngineModal;