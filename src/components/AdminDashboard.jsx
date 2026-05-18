import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { LogOut, TrendingUp, Search, AlertCircle, Wallet, Users, LayoutGrid, Box, DollarSign, CheckSquare, Printer, FileDown, CalendarDays, Lock, AlertTriangle, FileText, Filter, Calendar, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import SalesReceipt from '@/components/SalesReceipt';
import MonthlyReport from '@/components/MonthlyReport';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/lib/customSupabaseClient';

const YAM_LOGO_URL = "https://horizons-cdn.hostinger.com/f8aba79f-60b9-413d-b971-e48e97627679/5fc8119d1382941996f04918d1bdfe78.png";
const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes in milliseconds

const AdminDashboard = ({ onLogout, username }) => {
  const [trucks, setTrucks] = useState([]);
  const [engines, setEngines] = useState([]);
  const [machinery, setMachinery] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  
  const [inventorySearch, setInventorySearch] = useState('');
  const [salesSearch, setSalesSearch] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState('all'); 
  const [salesFilter, setSalesFilter] = useState('all'); // 'all' or 'debtors'
  const [expenseFilter, setExpenseFilter] = useState('pending'); // pending or history
  
  // Selection State for Bulk Actions
  const [selectedExpenseIds, setSelectedExpenseIds] = useState([]);

  // Time Segmentation
  const [timeFilter, setTimeFilter] = useState('all'); // 'all' or 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Dashboard Navigation State
  const [activeTab, setActiveTab] = useState('expenses');

  const [showReportModal, setShowReportModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [showSalesReceipt, setShowSalesReceipt] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  const { toast } = useToast();
  
  // Ref to store the timer ID so we can clear it
  const logoutTimerRef = useRef(null);

  // --- Inactivity Logic ---
  const resetInactivityTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    
    logoutTimerRef.current = setTimeout(() => {
      toast({ title: "Session Timeout", description: "You have been logged out due to inactivity." });
      onLogout();
    }, INACTIVITY_TIMEOUT);
  }, [onLogout, toast]);

  useEffect(() => {
    resetInactivityTimer();
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handleActivity = () => resetInactivityTimer();
    events.forEach(event => window.addEventListener(event, handleActivity));

    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [resetInactivityTimer]);

  // --- Data Loading & Realtime ---
  useEffect(() => {
    // Initial Load
    loadData();

    // Smart Subscription: Only reload specific tables that changed
    const channel = supabase.channel('admin-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        const { table } = payload;
        switch (table) {
            case 'trucks':
                fetchTrucks();
                break;
            case 'engines':
                fetchEngines();
                break;
            case 'machinery':
                fetchMachinery();
                break;
            case 'sales':
                fetchSales();
                break;
            case 'expenses':
                fetchExpenses();
                break;
            default:
                break;
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Individual Fetchers for Optimization
  const fetchTrucks = async () => {
      const { data } = await supabase.from('trucks').select('*').order('created_at', { ascending: false });
      if (data) setTrucks(data);
  };
  const fetchEngines = async () => {
      const { data } = await supabase.from('engines').select('*').order('created_at', { ascending: false });
      if (data) setEngines(data);
  };
  const fetchMachinery = async () => {
      const { data } = await supabase.from('machinery').select('*').order('created_at', { ascending: false });
      if (data) setMachinery(data);
  };
  const fetchSales = async () => {
      const { data } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
      if (data) setSales(data);
  };
  const fetchExpenses = async () => {
      const { data } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
      if (data) setExpenses(data);
  };

  const loadData = () => {
      fetchTrucks();
      fetchEngines();
      fetchMachinery();
      fetchSales();
      fetchExpenses();
  };

  // --- Filtering Logic (Updated for Date Range) ---
  const filterByTime = (data, dateField = 'date') => {
    if (timeFilter === 'all') return data;
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      return data.filter(item => {
        if (!item[dateField]) return false;
        const itemDate = new Date(item[dateField]);
        if (isNaN(itemDate.getTime())) return false;
        return itemDate >= start && itemDate <= end;
      });
    }
    return data;
  };

  const timeFilteredSales = filterByTime(sales);
  const timeFilteredExpenses = filterByTime(expenses);

  const displayedExpenses = timeFilteredExpenses.filter(e => {
      if (expenseFilter === 'pending') return e.status === 'pending';
      return e.status !== 'pending';
  });

  // --- Handlers ---
  const handleMarkAsPaid = async (id) => {
    // Optimistic Update
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'approved' } : e));
    toast({ title: "Marked as Paid", description: "Expense status updated to approved." });

    try {
      const { error } = await supabase
        .from('expenses')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;
      // No reload needed, optimistic update handles UI, realtime ensures consistency
    } catch (error) {
      // Revert on error
      fetchExpenses(); 
      toast({ title: "Error", description: "Could not update expense status.", variant: "destructive" });
    }
  };

  const handleBulkMarkAsPaid = async () => {
    if (selectedExpenseIds.length === 0) return;

    // Optimistic Update
    setExpenses(prev => prev.map(e => selectedExpenseIds.includes(e.id) ? { ...e, status: 'approved' } : e));
    setSelectedExpenseIds([]); // Clear selection immediately
    toast({ 
        title: "Bulk Update Processing", 
        description: `Marking ${selectedExpenseIds.length} expenses as paid...` 
    });

    try {
      const { error } = await supabase
        .from('expenses')
        .update({ status: 'approved' })
        .in('id', selectedExpenseIds);

      if (error) throw error;
    } catch (error) {
      fetchExpenses(); // Revert
      toast({ title: "Error", description: "Could not perform bulk update.", variant: "destructive" });
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allVisiblePendingIds = displayedExpenses
        .filter(e => e.status === 'pending')
        .map(e => e.id);
      setSelectedExpenseIds(allVisiblePendingIds);
    } else {
      setSelectedExpenseIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedExpenseIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleReprint = (sale) => {
    setSelectedSale(sale);
    setShowSalesReceipt(true);
  };

  // Metrics Calculation
  const totalRevenue = timeFilteredSales.reduce((sum, sale) => sum + (parseFloat(sale.amountPaid) || 0), 0);
  const totalDebt = timeFilteredSales.reduce((sum, sale) => {
    if (sale.paymentMode === 'partial') {
      return sum + (parseFloat(sale.remainingBalance) || 0);
    }
    return sum;
  }, 0);

  const totalAllExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const pendingExpenses = expenses.filter(e => e.status === 'pending');
  const totalPendingAmount = pendingExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  // Combine Inventory for Display
  const allInventory = [
    ...trucks.map(i => ({ ...i, type: 'Truck', name: `${i.truckType} ${i.model}`, category: 'Truck' })),
    ...machinery.map(i => ({ ...i, type: 'Machinery', name: i.name, category: 'Machinery', price: 0 })),
    ...engines.map(i => ({ ...i, type: 'Engine/Axle', name: i.name, category: i.category || 'Axle', price: 0 }))
  ];

  const filteredInventory = allInventory.filter(item => {
    if ((parseInt(item.quantity) || 0) <= 0) return false;

    const matchesSearch = 
      (item.name?.toLowerCase() || '').includes(inventorySearch.toLowerCase()) ||
      (item.type?.toLowerCase() || '').includes(inventorySearch.toLowerCase());
    
    if (inventoryFilter === 'all') return matchesSearch;
    if (inventoryFilter === 'trucks') return matchesSearch && item.category === 'Truck';
    if (inventoryFilter === 'machinery') return matchesSearch && item.category === 'Machinery';
    if (inventoryFilter === 'engines') return matchesSearch && (item.category === 'Engine' || item.category === 'Axle');
    return matchesSearch;
  });

  const displayedSales = timeFilteredSales.filter(sale => {
    const matchesSearch = 
      (sale.customerName?.toLowerCase() || '').includes(salesSearch.toLowerCase()) ||
      (sale.receiptNo?.toLowerCase() || '').includes(salesSearch.toLowerCase()) ||
      (sale.itemName?.toLowerCase() || '').includes(salesSearch.toLowerCase());
    
    if (salesFilter === 'debtors') {
      return matchesSearch && sale.paymentMode === 'partial' && parseFloat(sale.remainingBalance) > 0;
    }
    return matchesSearch;
  });

  const availableTrucks = trucks.reduce((sum, item) => sum + (parseInt(item.quantity) > 0 ? parseInt(item.quantity) : 0), 0);
  const availableMachinery = machinery.reduce((sum, item) => sum + (parseInt(item.quantity) > 0 ? parseInt(item.quantity) : 0), 0);
  const availableEnginesOnly = engines.filter(i => i.category === 'Engine').reduce((sum, item) => sum + (parseInt(item.quantity) > 0 ? parseInt(item.quantity) : 0), 0);
  const availableAxles = engines.filter(i => i.category === 'Axle').reduce((sum, item) => sum + (parseInt(item.quantity) > 0 ? parseInt(item.quantity) : 0), 0);

  const handleDateChange = () => {
    if (startDate && endDate) {
      setTimeFilter('custom');
    } else {
      if (!startDate && !endDate) setTimeFilter('all');
    }
  };

  useEffect(() => {
    handleDateChange();
  }, [startDate, endDate]);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div className="flex items-center gap-4">
             <div className="bg-white/10 p-2 rounded-full">
                <img src={YAM_LOGO_URL} alt="Y.A.M Logo" className="w-16 h-16 object-contain rounded-full" />
             </div>
             <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">Y.A.M World Wide Venture</h1>
                <p className="text-blue-200 text-sm">Admin Dashboard</p>
             </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowPasswordModal(true)} variant="outline" className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
              <Lock className="w-4 h-4 mr-2" />
              Password
            </Button>
            <Button onClick={onLogout} variant="outline" className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* TIME FILTER CONTROL */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-8 flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-white/80">
                <CalendarDays className="w-5 h-5 text-blue-400" />
                <span className="font-semibold text-sm uppercase tracking-wide">Financial Overview Period:</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                 <Button
                    onClick={() => {
                      setTimeFilter('all');
                      setStartDate('');
                      setEndDate('');
                    }}
                    variant={timeFilter === 'all' ? "default" : "outline"}
                    className={`capitalize ${timeFilter === 'all' ? 'bg-blue-600 border-blue-500' : 'bg-transparent border-white/20 text-white hover:bg-white/10'}`}
                    size="sm"
                 >
                     Show All
                 </Button>

                 <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                    <span className="text-xs text-white/50 px-2 uppercase font-bold">Custom Range:</span>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-slate-800 text-white text-sm px-2 py-1 rounded border border-white/20 focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-white/50">-</span>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-slate-800 text-white text-sm px-2 py-1 rounded border border-white/20 focus:outline-none focus:border-blue-500"
                    />
                 </div>
            </div>

            <Button 
                onClick={() => setShowReportModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
            >
                <FileDown className="w-4 h-4 mr-2" />
                Download Report (PDF)
            </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Inventory Breakdown */}
          <div 
            onClick={() => setActiveTab('inventory')}
            className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 shadow-lg border border-purple-400/30 cursor-pointer hover:scale-[1.02] transition-transform relative group"
           >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="text-purple-100 text-sm font-medium flex items-center gap-1">
                      Inventory Breakdown
                    </p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                    <Package className="w-5 h-5 text-white" />
                </div>
            </div>
            
            <div className="space-y-1 mt-1">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-purple-200">Trucks:</span>
                    <span className="font-bold text-white">{availableTrucks}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-purple-200">Machinery:</span>
                    <span className="font-bold text-white">{availableMachinery}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-purple-200">Engines:</span>
                    <span className="font-bold text-white">{availableEnginesOnly}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-purple-200">Axles:</span>
                    <span className="font-bold text-white">{availableAxles}</span>
                </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 shadow-lg border border-blue-400/30">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-blue-100 text-sm font-medium">
                      Total Income ({timeFilter === 'all' ? 'All Time' : 'Range'})
                    </p>
                    <h3 className="text-2xl font-bold text-white mt-1">₦{totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-600 to-pink-800 rounded-xl p-6 shadow-lg border border-pink-400/30">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-pink-100 text-sm font-medium">Total Expenses (All Time)</p>
                    <h3 className="text-2xl font-bold text-white mt-1">₦{totalAllExpenses.toLocaleString()}</h3>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                </div>
            </div>
             <p className="text-xs text-pink-200 mt-2">Accumulated Total</p>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-6 shadow-lg border border-red-400/30">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-red-100 text-sm font-medium">Outstanding Debt ({timeFilter === 'all' ? 'All Time' : 'Range'})</p>
                    <h3 className="text-2xl font-bold text-white mt-1">₦{totalDebt.toLocaleString()}</h3>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-white" />
                </div>
            </div>
             <p className="text-xs text-red-200 mt-2">Pending Payments</p>
          </div>
        </div>

        {/* PENDING PAYMENT SECTION */}
        {pendingExpenses.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4"
          >
             <div className="flex items-center gap-4">
                <div className="bg-amber-500/20 p-3 rounded-full animate-pulse">
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-amber-500">
                     Action Required: Pending Payments
                  </h2>
                  <p className="text-amber-200/80 mt-1">
                     You have <span className="font-bold text-white">{pendingExpenses.length}</span> expense request{pendingExpenses.length !== 1 && 's'} waiting for approval.
                  </p>
                </div>
             </div>
             <div className="text-right bg-amber-900/20 px-6 py-4 rounded-lg border border-amber-500/10 min-w-[200px]">
                <p className="text-xs text-amber-200 uppercase tracking-wide font-semibold mb-1">Total Pending Amount</p>
                <p className="text-3xl font-black text-white">₦{totalPendingAmount.toLocaleString()}</p>
             </div>
          </motion.div>
        )}

        {/* Main Content Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <TabsList className="bg-slate-900/50 p-1 border border-white/10 flex-wrap h-auto">
                <TabsTrigger value="expenses" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white text-blue-200 hover:text-white">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Expenses & Approvals
                </TabsTrigger>
                <TabsTrigger value="sales" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-blue-200 hover:text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  Sales Records
                </TabsTrigger>
                <TabsTrigger value="inventory" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-200 hover:text-white">
                  <Box className="w-4 h-4 mr-2" />
                  Global Inventory
                </TabsTrigger>
              </TabsList>
            </div>

            {/* EXPENSES CONTENT */}
            <TabsContent value="expenses" className="mt-0 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex items-center gap-4">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                          Expenses ({timeFilter === 'all' ? 'All Time' : `${startDate || '?'} to ${endDate || '?'}`})
                      </h2>
                      {expenseFilter === 'pending' && selectedExpenseIds.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <Button
                                onClick={handleBulkMarkAsPaid}
                                size="sm"
                                className="bg-green-600 hover:bg-green-500 text-white border-green-400 shadow-lg shadow-green-900/50 animate-in fade-in"
                            >
                                <CheckSquare className="w-4 h-4 mr-2" />
                                Mark {selectedExpenseIds.length} Selected as Paid
                            </Button>
                          </motion.div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 w-full md:w-auto">
                        <Button 
                            onClick={() => { setExpenseFilter('pending'); setSelectedExpenseIds([]); }}
                            size="sm"
                            className={`${expenseFilter === 'pending' ? 'bg-pink-600' : 'bg-white/10'} hover:bg-pink-700 border border-white/10`}
                        >
                            Awaiting Payment
                        </Button>
                        <Button 
                            onClick={() => { setExpenseFilter('history'); setSelectedExpenseIds([]); }}
                            size="sm"
                            className={`${expenseFilter === 'history' ? 'bg-blue-600' : 'bg-white/10'} hover:bg-blue-700 border border-white/10 text-white`}
                        >
                            Paid History
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-white text-sm">
                        <thead>
                            <tr className="border-b border-white/20 bg-white/5">
                                {expenseFilter === 'pending' && (
                                  <th className="w-10 py-3 px-4">
                                    <Checkbox 
                                      checked={displayedExpenses.length > 0 && selectedExpenseIds.length === displayedExpenses.filter(e => e.status === 'pending').length}
                                      onCheckedChange={handleSelectAll}
                                      className="border-white/50 bg-white/10 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                                    />
                                  </th>
                                )}
                                <th className="text-left py-3 px-4">Date</th>
                                <th className="text-left py-3 px-4">Staff Member</th>
                                <th className="text-left py-3 px-4">Purpose</th>
                                <th className="text-left py-3 px-4">Amount</th>
                                <th className="text-left py-3 px-4">Status</th>
                                <th className="text-left py-3 px-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedExpenses.length > 0 ? (
                                displayedExpenses.map((exp, idx) => (
                                    <tr key={exp.id} className={`border-b border-white/10 transition-colors ${selectedExpenseIds.includes(exp.id) ? 'bg-blue-500/20' : 'hover:bg-white/5'}`}>
                                        {expenseFilter === 'pending' && (
                                          <td className="py-3 px-4">
                                              {exp.status === 'pending' && (
                                                <Checkbox 
                                                  checked={selectedExpenseIds.includes(exp.id)}
                                                  onCheckedChange={() => handleSelectOne(exp.id)}
                                                  className="border-white/50 bg-white/10 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                                                />
                                              )}
                                          </td>
                                        )}
                                        <td className="py-3 px-4 text-white/70">
                                            {exp.date} <span className="text-xs block text-white/40">{exp.time}</span>
                                        </td>
                                        <td className="py-3 px-4 font-medium">{exp.staffName}</td>
                                        <td className="py-3 px-4">{exp.purpose}</td>
                                        <td className="py-3 px-4 font-bold text-pink-300">₦{parseFloat(exp.amount).toLocaleString()}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                exp.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' : 
                                                exp.status === 'approved' ? 'bg-blue-500/20 text-blue-300' :
                                                'bg-green-500/20 text-green-300'
                                            }`}>
                                                {exp.status === 'pending' ? 'AWAITING' : 
                                                 exp.status === 'approved' ? 'PAID (Waiting Confirmation)' : 
                                                 'COMPLETED'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {exp.status === 'pending' && (
                                                <Button 
                                                    onClick={() => handleMarkAsPaid(exp.id)}
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-500 text-white h-8"
                                                >
                                                    <CheckSquare className="w-3 h-3 mr-1.5" />
                                                    Mark Paid
                                                </Button>
                                            )}
                                            {exp.status !== 'pending' && (
                                                <span className="text-white/30 text-xs italic">No actions</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={expenseFilter === 'pending' ? "7" : "6"} className="py-8 text-center text-white/50">
                                        {expenseFilter === 'pending' 
                                            ? "No pending expenses to review." 
                                            : "No payment history found for this period."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </TabsContent>

            {/* SALES RECORDS CONTENT */}
            <TabsContent value="sales" className="mt-0 space-y-4">
                 <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by customer, phone, item or receipt no..."
                            value={salesSearch}
                            onChange={(e) => setSalesSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <Button 
                            onClick={() => setSalesFilter(prev => prev === 'all' ? 'debtors' : 'all')}
                            className={`${salesFilter === 'debtors' ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/20' : 'bg-white/10 hover:bg-white/20 text-white'} border border-white/10 shadow-lg`}
                        >
                            {salesFilter === 'debtors' ? (
                                <>
                                    <Filter className="w-4 h-4 mr-2" />
                                    Show All Sales
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-4 h-4 mr-2 text-red-400" />
                                    Outstanding Debts Only
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-white text-sm">
                        <thead>
                            <tr className="border-b border-white/20 bg-white/5">
                                <th className="text-left py-3 px-4">Date/Time</th>
                                <th className="text-left py-3 px-4">Receipt No</th>
                                <th className="text-left py-3 px-4">Customer Info</th>
                                <th className="text-left py-3 px-4">Item Details</th>
                                <th className="text-left py-3 px-4">Qty</th>
                                <th className="text-left py-3 px-4">Amount Paid</th>
                                <th className="text-left py-3 px-4">Status / Debt</th>
                                <th className="text-left py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedSales.length > 0 ? (
                                displayedSales.map((sale, index) => (
                                    <motion.tr
                                        key={sale.id || index}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-white/10 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="py-3 px-4">
                                            <div className="text-white">{sale.date}</div>
                                            <div className="text-white/50 text-xs">{sale.time}</div>
                                        </td>
                                        <td className="py-3 px-4 font-mono text-sm text-blue-200">{sale.receiptNo}</td>
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-white">{sale.customerName}</div>
                                            <div className="text-xs text-white/60 flex items-center gap-1">
                                                <span>{sale.customerPhone}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-white font-medium">{sale.itemName}</div>
                                            <div className="text-xs text-white/50 max-w-[150px] truncate">{sale.details}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                             <span className="bg-blue-500/20 text-blue-200 px-2 py-1 rounded text-xs font-bold">
                                                {sale.quantity}
                                             </span>
                                        </td>
                                        <td className="py-3 px-4 font-medium">₦{parseFloat(sale.amountPaid).toLocaleString()}</td>
                                        <td className="py-3 px-4">
                                            {sale.paymentMode === 'partial' ? (
                                                <div className="flex flex-col items-start">
                                                    <span className="bg-red-500/20 text-red-200 px-2 py-0.5 rounded text-xs font-bold mb-1 uppercase">Debt</span>
                                                    <span className="text-red-400 font-bold text-xs">Bal: ₦{parseFloat(sale.remainingBalance).toLocaleString()}</span>
                                                </div>
                                            ) : (
                                                 <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs font-bold uppercase">Paid Full</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Button
                                                onClick={() => handleReprint(sale)}
                                                size="sm"
                                                className="bg-slate-700 hover:bg-slate-600 text-white border border-white/10 shadow-sm h-8"
                                            >
                                                <Printer className="w-3 h-3 mr-1.5" />
                                                Reprint
                                            </Button>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="py-8 text-center text-white/50">
                                        No sales records found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </TabsContent>

            {/* INVENTORY CONTENT */}
            <TabsContent value="inventory" className="mt-0 space-y-4">
                 <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Box className="w-5 h-5" />
                        Global Inventory View
                    </h2>
                    <div className="flex gap-2">
                        {['all', 'trucks', 'machinery', 'engines'].map(type => (
                             <Button 
                                key={type}
                                onClick={() => setInventoryFilter(type)}
                                size="sm"
                                className={`${inventoryFilter === type ? 'bg-blue-600' : 'bg-white/10'} hover:bg-blue-700 border border-white/10 capitalize`}
                            >
                                {type}
                            </Button>
                        ))}
                    </div>
                </div>

                 <div className="overflow-x-auto">
                    <table className="w-full text-white text-sm">
                         <thead>
                            <tr className="border-b border-white/20 bg-white/5">
                                <th className="text-left py-3 px-4">Category</th>
                                <th className="text-left py-3 px-4">Item Name / Model</th>
                                <th className="text-left py-3 px-4">Details</th>
                                <th className="text-left py-3 px-4">Stock Qty</th>
                                <th className="text-left py-3 px-4">Added Date</th>
                            </tr>
                        </thead>
                        <tbody>
                             {filteredInventory.map((item, idx) => (
                                 <tr key={idx} className="border-b border-white/10 hover:bg-white/5">
                                     <td className="py-3 px-4">
                                         <span className="bg-white/10 px-2 py-1 rounded text-xs border border-white/10">
                                            {item.type}
                                         </span>
                                     </td>
                                     <td className="py-3 px-4 font-medium">{item.name}</td>
                                     <td className="py-3 px-4 text-white/60 max-w-md truncate">
                                        {/* Updated Detail Display for Admin too */}
                                        {item.type === 'Truck' ? `Chassis: ${item.chassisNo || 'N/A'}` : item.details || '-'}
                                     </td>
                                     <td className="py-3 px-4">
                                         <span className={`font-bold ${parseInt(item.quantity) < 2 ? 'text-red-400' : 'text-white'}`}>
                                            {item.quantity}
                                         </span>
                                     </td>
                                     <td className="py-3 px-4 text-white/50">{item.dateAdded || '-'}</td>
                                 </tr>
                             ))}
                        </tbody>
                    </table>
                 </div>
            </TabsContent>
          </Tabs>
        </div>

      </motion.div>

      {/* Reprint Modal */}
      {showSalesReceipt && selectedSale && (
        <SalesReceipt
            sale={selectedSale}
            onClose={() => {
                setShowSalesReceipt(false);
                setSelectedSale(null);
            }}
        />
      )}

      {/* Report Modal */}
      {showReportModal && (
        <MonthlyReport 
            sales={timeFilteredSales}
            expenses={timeFilteredExpenses}
            period={timeFilter === 'all' ? 'All Time' : `${startDate || 'Start'} to ${endDate || 'End'}`}
            onClose={() => setShowReportModal(false)}
        />
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal 
            onClose={() => setShowPasswordModal(false)}
            userRole="admin"
            username={username}
        />
      )}
    </div>
  );
};

export default AdminDashboard;