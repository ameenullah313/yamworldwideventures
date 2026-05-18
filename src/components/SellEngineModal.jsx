import React, { useState, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, FileText, Ban, GripHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import SalesReceipt from '@/components/SalesReceipt';

const SellEngineModal = ({ 
  onClose, 
  truckInventory = [], 
  engineInventory = [], 
  machineryInventory = [],
  onSaleComplete,
  defaultCategory = 'All',
  lockCategory = false
}) => {
  const controls = useDragControls();
  const [formData, setFormData] = useState({
    categoryFilter: defaultCategory,
    name: '',
    phone: '',
    address: '',
    selectedItemValue: '',
    quantity: '',
    amountPaid: '',
    paymentMode: 'full',
    remainingBalance: ''
  });
  
  // Use SalesReceipt for consistency
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData(prev => ({ ...prev, categoryFilter: defaultCategory }));
  }, [defaultCategory]);

  const allItems = [
    ...truckInventory.map((item) => ({
      ...item,
      _source: 'trucks',
      _id: `truck-${item.id}`,
      displayName: `[Truck] ${item.truckType} - ${item.model} (${item.color})`,
      category: 'Truck'
    })),
    ...machineryInventory.map((item) => ({
      ...item,
      _source: 'machinery',
      _id: `machinery-${item.id}`,
      displayName: `[Machinery] ${item.name} - ${item.type}`,
      category: 'Machinery'
    })),
    ...engineInventory.map((item) => ({
      ...item,
      _source: 'engines',
      _id: `engine-${item.id}`,
      displayName: `[${item.category || 'Axle'}] ${item.name}`,
    }))
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (name === 'quantity' || name === 'selectedItemValue') setError('');
    if (name === 'categoryFilter') setFormData(prev => ({ ...prev, selectedItemValue: '', categoryFilter: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.selectedItemValue === '') { setError('Please select an item.'); return; }

    const selectedItem = allItems.find(item => item._id === formData.selectedItemValue);
    if (!selectedItem) { setError('Invalid item selected.'); return; }

    const quantityToSell = parseInt(formData.quantity);
    if (quantityToSell <= 0) { setError('Quantity must be at least 1.'); return; }
    if (quantityToSell > parseInt(selectedItem.quantity)) { setError(`Only ${selectedItem.quantity} items available in stock.`); return; }
    if (formData.paymentMode === 'partial' && !formData.remainingBalance) { setError('Please enter the remaining balance for partial payment.'); return; }

    // Prepare details
    let detailsString = '';
    const item = selectedItem;
    if (item._source === 'trucks') {
      detailsString = [
        `Type: ${item.truckType}`,
        `Model: ${item.model}`,
        `Color: ${item.color}`,
        `Engine: ${item.engine || 'N/A'}`
      ].join(', ');
    } else if (item._source === 'machinery') {
      detailsString = [
        `Name: ${item.name}`,
        `Type: ${item.type}`,
        `Details: ${item.details || 'N/A'}`
      ].join(', ');
    } else {
      detailsString = [
        `Name: ${item.name}`,
        `Details: ${item.details || 'N/A'}`
      ].join(', ');
    }

    const receipt = {
      customerName: formData.name,
      customerPhone: formData.phone,
      address: formData.address,
      category: selectedItem.category || 'N/A',
      itemName: selectedItem._source === 'trucks' ? selectedItem.truckType : selectedItem.name,
      details: detailsString,
      quantity: quantityToSell,
      amountPaid: formData.amountPaid,
      paymentMode: formData.paymentMode,
      remainingBalance: formData.paymentMode === 'partial' ? formData.remainingBalance : '0',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      receiptNo: 'SAL' + Date.now(),
      itemData: selectedItem
    };

    try {
      const newQuantity = parseInt(selectedItem.quantity) - quantityToSell;
      const { error: updateError } = await supabase
        .from(selectedItem._source)
        .update({ quantity: newQuantity })
        .eq('id', selectedItem.id);

      if (updateError) throw updateError;

      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert([receipt])
        .select()
        .single();

      if (saleError) throw saleError;

      setReceiptData(saleData || receipt);
      setShowReceipt(true);
      if (onSaleComplete) onSaleComplete();
    } catch (err) {
      console.error(err);
      setError('Transaction failed. Please try again.');
    }
  };

  const filteredItems = allItems.filter(item => {
    if ((parseInt(item.quantity) || 0) <= 0) return false;
    if (formData.categoryFilter === 'All') return true;
    if (formData.categoryFilter === 'Engines/Axles') return item.category === 'Engine' || item.category === 'Axle';
    return item.category === formData.categoryFilter;
  });

  // If receipt is active, render the SalesReceipt component
  if (showReceipt && receiptData) {
      return (
          <SalesReceipt sale={receiptData} onClose={onClose} />
      );
  }

  // Otherwise render the form
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
        <div 
          onPointerDown={(e) => controls.start(e)}
          className="bg-slate-900/50 p-4 cursor-move border-b border-white/10 flex justify-between items-center shrink-0 select-none"
        >
          <div className="flex items-center gap-3 text-white">
            <div className="bg-white/10 p-1.5 rounded">
                <GripHorizontal className="w-4 h-4 text-white/70" />
            </div>
            <h2 className="text-xl font-bold tracking-wide">
              {`Sell ${lockCategory ? defaultCategory : 'Item'}`}
            </h2>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-white/70 hover:text-white rounded-full h-8 w-8 p-0">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {!lockCategory && (
                  <div className="col-span-1 md:col-span-2">
                      <label className="block text-blue-200 mb-1.5 text-sm font-medium">Filter by Category</label>
                      <div className="flex gap-4 flex-wrap">
                          {['All', 'Truck', 'Machinery', 'Engine', 'Axle'].map((cat) => (
                              <label key={cat} className="flex items-center space-x-2 cursor-pointer bg-slate-900/40 px-3 py-1.5 rounded border border-white/10 hover:bg-slate-900/60 transition-colors">
                                  <input 
                                      type="radio" 
                                      name="categoryFilter" 
                                      value={cat}
                                      checked={formData.categoryFilter === cat}
                                      onChange={handleChange}
                                      className="form-radio text-blue-600 focus:ring-blue-500 bg-slate-700 border-white/20"
                                  />
                                  <span className="text-white text-sm">{cat}</span>
                              </label>
                          ))}
                      </div>
                  </div>
                )}

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-blue-200 mb-1.5 text-sm font-medium">Select Item to Sell</label>
                  <select
                    name="selectedItemValue"
                    value={formData.selectedItemValue}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    required
                  >
                    <option value="" className="bg-slate-800 text-gray-400">-- Select {lockCategory ? defaultCategory : 'Item'} --</option>
                    {filteredItems.map((item) => (
                      <option key={item._id} value={item._id} className="bg-slate-800 text-white">
                        {item.displayName} (Qty: {item.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-blue-200 mb-1.5 text-sm font-medium">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-blue-200 mb-1.5 text-sm font-medium">Amount Paid (₦)</label>
                  <input
                    type="number"
                    name="amountPaid"
                    value={formData.amountPaid}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className="block text-blue-200 mb-1.5 text-sm font-medium">Payment Mode</label>
                    <div className="flex gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer bg-slate-900/40 px-4 py-2 rounded border border-white/10 hover:bg-slate-900/60 transition-colors flex-1">
                            <input 
                                type="radio" 
                                name="paymentMode" 
                                value="full"
                                checked={formData.paymentMode === 'full'}
                                onChange={() => setFormData({...formData, paymentMode: 'full', remainingBalance: ''})}
                                className="form-radio text-green-500 focus:ring-green-500 bg-slate-700 border-white/20"
                            />
                            <span className="text-white">Full Payment</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer bg-slate-900/40 px-4 py-2 rounded border border-white/10 hover:bg-slate-900/60 transition-colors flex-1">
                            <input 
                                type="radio" 
                                name="paymentMode" 
                                value="partial"
                                checked={formData.paymentMode === 'partial'}
                                onChange={() => setFormData({...formData, paymentMode: 'partial'})}
                                className="form-radio text-yellow-500 focus:ring-yellow-500 bg-slate-700 border-white/20"
                            />
                            <span className="text-white">Partial Payment</span>
                        </label>
                    </div>
                </div>

                {formData.paymentMode === 'partial' && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                        className="col-span-1 md:col-span-2"
                    >
                        <label className="block text-yellow-200 mb-1.5 text-sm font-medium">Remaining Balance (₦)</label>
                        <input
                            type="number"
                            name="remainingBalance"
                            value={formData.remainingBalance}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-yellow-500/50 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            placeholder="0.00"
                        />
                    </motion.div>
                )}

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-blue-200 mb-1.5 text-sm font-medium">Customer Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter customer name"
                    required
                  />
                </div>

                 <div className="col-span-1 md:col-span-2">
                  <label className="block text-blue-200 mb-1.5 text-sm font-medium">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter customer phone number"
                    required
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-blue-200 mb-1.5 text-sm font-medium">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Enter customer address"
                    rows="2"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-6 mt-4 border-t border-white/10">
                <Button 
                  type="button" 
                  onClick={onClose} 
                  variant="outline" 
                  className="flex-1 h-12 text-base font-semibold border-red-500/30 text-red-300 hover:bg-red-500/10 hover:text-red-200"
                >
                  <Ban className="w-5 h-5 mr-2" />
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-12 text-base font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Confirm and Print Receipt
                </Button>
              </div>
            </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SellEngineModal;