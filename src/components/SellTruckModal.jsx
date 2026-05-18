import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, Truck, Search, Printer, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import SalesReceipt from '@/components/SalesReceipt';

const SellTruckModal = ({ onClose, inventory, onSaleComplete }) => {
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    address: '',
    amountPaid: '',
    remainingBalance: '',
    paymentMode: 'full'
  });

  // Receipt State
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedSaleData, setCompletedSaleData] = useState(null);

  const filteredInventory = inventory.filter(item => 
    (parseInt(item.quantity) > 0) &&
    (
      (item.model || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.truckType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.chassisNo || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!selectedTruck) return;

    if (formData.paymentMode === 'partial' && (!formData.remainingBalance || parseFloat(formData.remainingBalance) <= 0)) {
        alert("Please enter a valid remaining balance for partial payment.");
        return;
    }

    const detailsString = `Color: ${selectedTruck.color || 'N/A'}\nChassis: ${selectedTruck.chassisNo || 'N/A'}\nEngine: ${selectedTruck.engine || 'N/A'}`;

    const saleData = {
        receiptNo: `YAM${Date.now().toString().slice(-6)}`,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        address: formData.address,
        category: 'Truck',
        itemName: `${selectedTruck.truckType} ${selectedTruck.model}`,
        details: detailsString,
        quantity: 1,
        amountPaid: parseFloat(formData.amountPaid) || 0,
        paymentMode: formData.paymentMode,
        remainingBalance: formData.paymentMode === 'partial' ? (parseFloat(formData.remainingBalance) || 0) : 0,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        staffName: 'Staff',
        itemData: selectedTruck 
    };

    // Update Inventory
    const { error: invError } = await supabase
        .from('trucks')
        .update({ quantity: parseInt(selectedTruck.quantity) - 1 })
        .eq('id', selectedTruck.id);

    if (invError) {
        console.error("Inventory update failed", invError);
        return;
    }

    // Insert Sale and Return Data
    const { data: savedSale, error: saleError } = await supabase
        .from('sales')
        .insert([saleData])
        .select()
        .single();

    if (!saleError) {
        // Instead of closing, show receipt
        setCompletedSaleData(savedSale || saleData); // Fallback to local data if fetch fails but insert worked
        setShowReceipt(true);
        onSaleComplete(); // Notify parent to refresh list in background
    } else {
        console.error("Sale insert failed", saleError);
        alert("Failed to record sale. Please try again.");
    }
  };

  // If receipt mode is active, show the receipt component instead
  if (showReceipt && completedSaleData) {
      return (
          <SalesReceipt 
             sale={completedSaleData} 
             onClose={onClose} 
          />
      );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-white/10 rounded-xl w-full max-w-5xl h-[85vh] flex overflow-hidden shadow-2xl"
      >
        {/* Left Side: Truck Selection */}
        <div className="w-1/3 border-r border-white/10 flex flex-col bg-slate-800/30">
            <div className="p-4 border-b border-white/10">
                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-400" />
                    Select Truck
                </h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <input 
                        type="text" 
                        placeholder="Search model, chassis..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-white/20 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {filteredInventory.map(item => (
                    <div 
                        key={item.id}
                        onClick={() => setSelectedTruck(item)}
                        className={`p-3 rounded-lg cursor-pointer border transition-all ${
                            selectedTruck?.id === item.id 
                            ? 'bg-blue-600/20 border-blue-500' 
                            : 'bg-white/5 border-transparent hover:bg-white/10'
                        }`}
                    >
                        <div className="text-sm font-bold text-white">{item.truckType} {item.model}</div>
                        <div className="text-xs text-white/60 mt-1">Chassis: {item.chassisNo || 'N/A'}</div>
                        <div className="text-xs text-white/60">Color: {item.color}</div>
                        <div className="flex justify-between items-center mt-1">
                             <div className="text-xs text-blue-300">Stock: {item.quantity}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Right Side: Sales Form */}
        <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
                <h2 className="text-xl font-bold text-white">Process Truck Sale</h2>
                <Button onClick={onClose} variant="ghost" size="sm" className="hover:bg-white/10 text-white/70 hover:text-white rounded-full h-8 w-8 p-0">
                    <X className="w-5 h-5" />
                </Button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
                {selectedTruck ? (
                    <form id="truck-sale-form" onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
                        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg mb-6">
                            <span className="text-xs uppercase text-blue-300 font-bold block mb-1">Selected Vehicle</span>
                            <div className="text-lg font-bold text-white">{selectedTruck.truckType} {selectedTruck.model}</div>
                            <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-blue-200/80">
                                <div><span className="text-white/40">Chassis:</span> {selectedTruck.chassisNo || 'N/A'}</div>
                                <div><span className="text-white/40">Color:</span> {selectedTruck.color || 'N/A'}</div>
                                <div><span className="text-white/40">Engine:</span> {selectedTruck.engine || 'N/A'}</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-blue-200">Customer Name</label>
                                    <input required name="customerName" value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Full Name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-blue-200">Phone Number</label>
                                    <input required name="customerPhone" value={formData.customerPhone} onChange={(e) => setFormData({...formData, customerPhone: e.target.value})} className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="080..." />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-200">Address</label>
                                <textarea required name="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows="2" placeholder="Customer Address" />
                            </div>

                            <div className="p-4 bg-slate-800/50 rounded-lg border border-white/10 space-y-4">
                                 <div className="space-y-2">
                                     <label className="text-sm font-medium text-blue-200">Payment Mode</label>
                                     <div className="flex gap-4">
                                         <label className="flex items-center space-x-2 cursor-pointer bg-slate-900/40 px-4 py-2 rounded border border-white/10 hover:bg-slate-900/60 transition-colors flex-1">
                                             <input 
                                                 type="radio" 
                                                 name="paymentMode" 
                                                 value="full"
                                                 checked={formData.paymentMode === 'full'}
                                                 onChange={(e) => setFormData({...formData, paymentMode: e.target.value, remainingBalance: ''})}
                                                 className="form-radio text-green-500 focus:ring-green-500 bg-slate-700 border-white/20"
                                             />
                                             <span className="text-white text-sm">Full Payment</span>
                                         </label>
                                         <label className="flex items-center space-x-2 cursor-pointer bg-slate-900/40 px-4 py-2 rounded border border-white/10 hover:bg-slate-900/60 transition-colors flex-1">
                                             <input 
                                                 type="radio" 
                                                 name="paymentMode" 
                                                 value="partial"
                                                 checked={formData.paymentMode === 'partial'}
                                                 onChange={(e) => setFormData({...formData, paymentMode: e.target.value})}
                                                 className="form-radio text-yellow-500 focus:ring-yellow-500 bg-slate-700 border-white/20"
                                             />
                                             <span className="text-white text-sm">Partial (Debt)</span>
                                         </label>
                                     </div>
                                 </div>

                                 <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                         <label className="text-sm font-medium text-blue-200">
                                            {formData.paymentMode === 'full' ? 'Amount Paid (₦)' : 'Initial Deposit (₦)'}
                                         </label>
                                         <input required type="number" name="amountPaid" value={formData.amountPaid} onChange={(e) => setFormData({...formData, amountPaid: e.target.value})} className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" />
                                     </div>
                                     
                                     {formData.paymentMode === 'partial' && (
                                         <div className="space-y-2">
                                             <label className="text-sm font-medium text-red-300">Remaining Balance (₦)</label>
                                             <input 
                                                required 
                                                type="number" 
                                                name="remainingBalance" 
                                                value={formData.remainingBalance} 
                                                onChange={(e) => setFormData({...formData, remainingBalance: e.target.value})} 
                                                className="w-full bg-slate-800 border border-red-500/30 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-red-500 outline-none" 
                                                placeholder="0.00" 
                                             />
                                         </div>
                                     )}
                                 </div>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-white/30">
                        <Truck className="w-16 h-16 mb-4 opacity-50" />
                        <p>Select a truck from the list to begin sale</p>
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-slate-800/50">
                <Button onClick={onClose} variant="ghost" className="text-white hover:bg-white/10">Cancel</Button>
                <Button disabled={!selectedTruck} type="submit" form="truck-sale-form" className="bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm and Print Receipt
                </Button>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SellTruckModal;