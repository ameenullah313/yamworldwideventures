import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Truck, Search, Tag, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CustomerPage = ({ onLogout }) => {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadedInventory = JSON.parse(localStorage.getItem('yamInventory') || '[]');
    setInventory(loadedInventory);
  }, []);

  const filteredInventory = inventory.filter(record => 
    (record.truckType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.model?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (parseInt(record.quantity) || 0) > 0
  );

  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
             <div className="bg-white/10 p-2 rounded-full">
                <img 
                  src="https://horizons-cdn.hostinger.com/f8aba79f-60b9-413d-b971-e48e97627679/5fc8119d1382941996f04918d1bdfe78.png" 
                  alt="Y.A.M Logo" 
                  className="w-16 h-16 object-contain rounded-full"
                />
             </div>
            <div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">Y.A.M World Wide Venture</h1>
                <p className="text-blue-200 text-sm">No. 01 Na'ibawa Fly Over, Zaria Road, Kano State Nigeria</p>
                <div className="flex items-center gap-2 mt-1">
              </div>
                  <span className="bg-purple-500/20 text-purple-200 text-xs px-2 py-0.5 rounded border border-purple-500/30">Available Inventory</span>
                </div>
             </div>
          </div>
          <Button onClick={onLogout} variant="outline" className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto mb-10">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <input 
                type="text" 
                placeholder="Search for trucks, heavy machinery..."
                className="w-full pl-12 pr-4 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInventory.length > 0 ? (
                filteredInventory.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 hover:border-white/30 hover:bg-white/15 transition-all group shadow-lg"
                    >
                        <div className="h-48 bg-slate-800/50 flex items-center justify-center relative overflow-hidden">
                           {/* Placeholder for truck image - in a real app this would be a real image url */}
                            <Truck className="w-20 h-20 text-white/20 group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                                <span className={`text-xs font-bold uppercase tracking-wider ${item.condition === 'new' ? 'text-green-400' : 'text-amber-400'}`}>
                                    {item.condition}
                                </span>
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-1 truncate">{item.truckType}</h3>
                            <p className="text-blue-200 text-sm mb-4">{item.model}</p>
                            
                            <div className="flex flex-col gap-2 mb-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/60">Color:</span>
                                    <span className="text-white font-medium">{item.color}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/60">Stock:</span>
                                    <span className="text-white font-medium">{item.quantity} available</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-white/10 pt-4">
                                <div>
                                    <span className="text-xs text-white/50 block">Price</span>
                                    <span className="text-xl font-bold text-green-400">₦{parseFloat(item.price).toLocaleString()}</span>
                                </div>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                    <Info className="w-4 h-4 mr-2" />
                                    Details
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))
            ) : (
                <div className="col-span-full text-center py-20">
                    <div className="bg-white/5 rounded-full p-6 inline-block mb-4">
                        <Tag className="w-12 h-12 text-white/30" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Inventory Found</h3>
                    <p className="text-white/50">Check back later for new arrivals.</p>
                </div>
            )}
        </div>
      </motion.div>
    </div>
  );
};

export default CustomerPage;