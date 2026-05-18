
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Plus, Search, Trash2, Edit, DollarSign, Truck, Box, Wrench, Wallet, CheckCircle, FileText, Printer, CalendarDays, FileDown, Lock, Filter, AlertCircle, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AddTruckModal from '@/components/AddTruckModal';
import EditTruckModal from '@/components/EditTruckModal';
import AddEngineModal from '@/components/AddEngineModal';
import AddMachineryModal from '@/components/AddMachineryModal';
import SellEngineModal from '@/components/SellEngineModal';
import SellTruckModal from '@/components/SellTruckModal';
import DailyExpenseModal from '@/components/DailyExpenseModal';
import DailyExpenseReceipt from '@/components/DailyExpenseReceipt';
import CombinedExpenseReceipt from '@/components/CombinedExpenseReceipt';
import SalesReceipt from '@/components/SalesReceipt';
import MonthlyReport from '@/components/MonthlyReport';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import ConfirmExpenseModal from '@/components/ConfirmExpenseModal';
import BulkConfirmExpenseModal from '@/components/BulkConfirmExpenseModal';
import DebtPaymentModal from '@/components/DebtPaymentModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/lib/customSupabaseClient';

const YAM_LOGO_URL = "https://horizons-cdn.hostinger.com/f8aba79f-60b9-413d-b971-e48e97627679/5fc8119d1382941996f04918d1bdfe78.png";
const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes

const StaffDashboard = ({ onLogout, username }) => {
  // Truck Inventory State
  const [inventoryRecords, setInventoryRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null); // Used for UI key but less critical with DB IDs

  // Engine Inventory State
  const [engineRecords, setEngineRecords] = useState([]);
  const [engineSearchTerm, setEngineSearchTerm] = useState('');
  const [showAddEngineModal, setShowAddEngineModal] = useState(false);
  
  // Machinery Inventory State
  const [machineryRecords, setMachineryRecords] = useState([]);
  const [machinerySearchTerm, setMachinerySearchTerm] = useState('');
  const [showAddMachineryModal, setShowAddMachineryModal] = useState(false);

  // Expenses State
  const [expenses, setExpenses] = useState([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState([]);
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);
  
  // Sales Records State
  const [salesRecords, setSalesRecords] = useState([]);
  const [salesSearchTerm, setSalesSearchTerm] = useState('');
  const [salesFilterType, setSalesFilterType] = useState('all'); // 'all' or 'outstanding'
  
  // Time Segmentation
  const [timeFilter, setTimeFilter] = useState('all'); // 'all' or 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [showReportModal, setShowReportModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Receipt State
  const [receiptData, setReceiptData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false); // For Expense Receipt
  const [showSalesReceipt, setShowSalesReceipt] = useState(false); // For Sales Receipt
  const [selectedSale, setSelectedSale] = useState(null);
  
  // Combined Receipt State
  const [showCombinedReceipt, setShowCombinedReceipt] = useState(false);
  const [combinedReceiptData, setCombinedReceiptData] = useState(null);

  // Expense Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [expenseToConfirm, setExpenseToConfirm] = useState(null);

  // Sales Modal State (Unified but context-aware)
  const [showSellModal, setShowSellModal] = useState(false);
  const [showSellTruckModal, setShowSellTruckModal] = useState(false);
  const [sellModalConfig, setSellModalConfig] = useState({
    defaultCategory: 'All',
    lockCategory: false
  });

  // Debt Payment Modal State
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [saleToPayDebt, setSaleToPayDebt] = useState(null);

  const { toast } = useToast();
  
  // Ref to store the timer ID
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


  // --- Data Loading & Optimization ---
  useEffect(() => {
    loadAllData();

    // Smart Subscription: Listen only for specific table changes to avoid full reloads
    const channel = supabase.channel('staff-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        const { table } = payload;
        switch (table) {
            case 'trucks':
                loadInventory();
                break;
            case 'engines':
                loadEngineInventory();
                break;
            case 'machinery':
                loadMachineryInventory();
                break;
            case 'sales':
                loadSales();
                break;
            case 'expenses':
                loadExpenses();
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

  const loadAllData = () => {
    loadInventory();
    loadEngineInventory();
    loadMachineryInventory();
    loadExpenses();
    loadSales();
  };

  // --- Loaders with Error Handling ---
  const loadInventory = async () => {
    try {
      const { data, error } = await supabase.from('trucks').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setInventoryRecords(data);
    } catch (error) {
      console.error("Error loading trucks:", error);
      toast({ title: "Error", description: "Failed to load truck inventory.", variant: "destructive" });
    }
  };

  const loadEngineInventory = async () => {
    try {
      const { data, error } = await supabase.from('engines').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setEngineRecords(data);
    } catch (error) {
      console.error("Error loading engines:", error);
      toast({ title: "Error", description: "Failed to load engine inventory.", variant: "destructive" });
    }
  };

  const loadMachineryInventory = async () => {
    try {
      const { data, error } = await supabase.from('machinery').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setMachineryRecords(data);
    } catch (error) {
      console.error("Error loading machinery:", error);
      toast({ title: "Error", description: "Failed to load machinery inventory.", variant: "destructive" });
    }
  };

  const loadExpenses = async () => {
    try {
      const { data, error } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setExpenses(data);
    } catch (error) {
      console.error("Error loading expenses:", error);
      toast({ title: "Error", description: "Failed to load expenses.", variant: "destructive" });
    }
  };

  const loadSales = async () => {
    try {
      const { data, error } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setSalesRecords(data);
    } catch (error) {
      console.error("Error loading sales:", error);
      toast({ title: "Error", description: "Failed to load sales records.", variant: "destructive" });
    }
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
  const timeFilteredSales = filterByTime(salesRecords);
  const timeFilteredExpenses = filterByTime(expenses);


  // --- Truck Functions (Optimistic Updates) ---
  const handleAddRecord = async (record) => {
    const newRecord = {
      ...record,
      category: 'Truck', 
      dateAdded: new Date().toLocaleDateString()
    };
    delete newRecord.category; 

    // Optimistic insert to allow instant UI response? 
    // For inserts, we need the DB ID usually, but we can rely on rapid return.
    const { data, error } = await supabase.from('trucks').insert([newRecord]).select().single();
    
    if (!error && data) {
      setInventoryRecords(prev => [data, ...prev]); // Immediate update
      setShowAddModal(false);
      toast({ title: "Success", description: "Truck added successfully" });
    } else {
      toast({ title: "Error", description: "Failed to add truck", variant: "destructive" });
    }
  };

  const handleEditRecord = async (record) => {
    // Optimistic Update
    setInventoryRecords(prev => prev.map(item => item.id === record.id ? { ...item, ...record } : item));
    setShowEditModal(false);
    setEditingRecord(null);
    setEditingIndex(null);
    toast({ title: "Success", description: "Truck record updated successfully" });

    // Background DB Update
    const { error } = await supabase.from('trucks').update(record).eq('id', editingRecord.id);
    if (error) {
        loadInventory(); // Revert on failure
        toast({ title: "Error", description: "Failed to save changes to server", variant: "destructive" });
    }
  };

  const handleDeleteRecord = async (id) => {
    // Optimistic Update
    setInventoryRecords(prev => prev.filter(item => item.id !== id));
    toast({ title: "Deleted", description: "Truck record deleted successfully" });

    const { error } = await supabase.from('trucks').delete().eq('id', id);
    if (error) {
        loadInventory(); // Revert
        toast({ title: "Error", description: "Failed to delete from server", variant: "destructive" });
    }
  };

  const openEditModal = (record, index) => {
    setEditingRecord(record);
    setEditingIndex(index);
    setShowEditModal(true);
  };

  // --- Engine Functions ---
  const handleAddEngineRecord = async (record) => {
    const newRecord = { ...record, dateAdded: new Date().toLocaleDateString() };
    const { data, error } = await supabase.from('engines').insert([newRecord]).select().single();
    
    if (!error && data) {
        setEngineRecords(prev => [data, ...prev]);
        setShowAddEngineModal(false);
        toast({ title: "Success", description: `${record.category} record added successfully` });
    }
  };

  const handleDeleteEngineRecord = async (id) => {
    setEngineRecords(prev => prev.filter(item => item.id !== id));
    toast({ title: "Deleted", description: "Item deleted successfully" });
    await supabase.from('engines').delete().eq('id', id);
  };

  // --- Machinery Functions ---
  const handleAddMachineryRecord = async (record) => {
    const newRecord = { ...record, dateAdded: new Date().toLocaleDateString() };
    delete newRecord.category;
    const { data, error } = await supabase.from('machinery').insert([newRecord]).select().single();
    
    if (!error && data) {
        setMachineryRecords(prev => [data, ...prev]);
        setShowAddMachineryModal(false);
        toast({ title: "Success", description: "Machinery added successfully" });
    }
  };

  const handleDeleteMachineryRecord = async (id) => {
    setMachineryRecords(prev => prev.filter(item => item.id !== id));
    toast({ title: "Deleted", description: "Machinery record deleted successfully" });
    await supabase.from('machinery').delete().eq('id', id);
  };

  // --- Expenses Functions ---
  const handleAddExpense = async (data) => {
    const newExpense = {
        purpose: data.purpose,
        amount: data.amount,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        status: 'pending', 
        staffName: username
    };
    
    const { data: savedData, error } = await supabase.from('expenses').insert([newExpense]).select().single();

    if (!error && savedData) {
        setExpenses(prev => [savedData, ...prev]);
        setShowExpenseModal(false);
        toast({ title: "Request Sent", description: "Daily spent request submitted for approval." });
    }
  };

  const initiateConfirmExpense = (expense) => {
    setExpenseToConfirm(expense);
    setShowConfirmModal(true);
  };

  const handleFinalizeExpense = async (id, receiverData) => {
    // Optimistic Update
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'completed', ...receiverData } : e));
    setShowConfirmModal(false);
    toast({ title: "Confirmed", description: "Payment received and confirmed." });

    // DB Update
    const { error } = await supabase.from('expenses').update({
        status: 'completed',
        ...receiverData
    }).eq('id', id);

    // After success, show receipt. We use local data if DB fetch is slow.
    if (!error) {
        const updatedExpense = expenses.find(e => e.id === id);
        setReceiptData({ ...updatedExpense, status: 'completed', ...receiverData });
        setShowReceipt(true);
    } else {
        loadExpenses(); // Revert
    }
  };

  // --- Bulk Expenses Functions ---
  const handleSelectExpense = (id) => {
    setSelectedExpenseIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));
  };

  const handleSelectAllExpenses = (e) => {
    if (e.target.checked) {
      const confirmable = timeFilteredExpenses.filter(exp => exp.status === 'approved').map(exp => exp.id);
      setSelectedExpenseIds(confirmable);
    } else {
      setSelectedExpenseIds([]);
    }
  };

  const selectedExpensesTotal = expenses
    .filter(e => selectedExpenseIds.includes(e.id))
    .reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);


  const handleFinalizeBulkExpense = async (receiverData) => {
    // 1. Get objects locally
    const selectedExpenseObjects = expenses.filter(e => selectedExpenseIds.includes(e.id));
    
    // 2. Prepare receipt data
    const receiptData = {
        items: selectedExpenseObjects,
        receiver: receiverData,
        total: selectedExpensesTotal,
        date: new Date().toLocaleDateString()
    };

    // 3. Optimistic Update
    setExpenses(prev => prev.map(e => selectedExpenseIds.includes(e.id) ? { ...e, status: 'completed', ...receiverData } : e));
    setShowBulkConfirmModal(false);
    setCombinedReceiptData(receiptData);
    setShowCombinedReceipt(true);
    setSelectedExpenseIds([]);
    toast({ title: "Bulk Confirmation Success", description: `${selectedExpenseObjects.length} payments marked as received.` });

    // 4. Update DB
    await supabase.from('expenses').update({
        status: 'completed',
        ...receiverData
    }).in('id', selectedExpenseIds);
  };


  // --- Sales ---
  const handleSaleComplete = () => {
    // We do NOT reload data here. The modal shows the receipt.
    // The dashboard background update will happen via Realtime subscription.
    // This prevents the UI freeze while the receipt is open.
    toast({ title: "Sale Successful", description: "Item sold. Inventory updating in background..." });
  };

  const openSellModal = (category, locked = false) => {
    if (category === 'Truck') {
        setShowSellTruckModal(true);
    } else {
        setSellModalConfig({ defaultCategory: category, lockCategory: locked });
        setShowSellModal(true);
    }
  };

  const handleReprintReceipt = (sale) => {
    setSelectedSale(sale);
    setShowSalesReceipt(true);
  };

  const handleDeleteSale = async (id) => {
    if (window.confirm("Are you sure you want to delete this sales record?")) {
      setSalesRecords(prev => prev.filter(s => s.id !== id)); // Optimistic
      toast({ title: "Deleted", description: "Sales record deleted successfully" });
      
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if(error) loadSales();
    }
  };

  const initiateDebtPayment = (sale) => {
    setSaleToPayDebt(sale);
    setShowDebtModal(true);
  };

  const handleDebtPaymentComplete = (updatedSale) => {
    loadSales(); 
    setShowDebtModal(false);
    setSaleToPayDebt(null);
    setSelectedSale(updatedSale);
    setShowSalesReceipt(true);
  };

  // --- Filtering ---
  const filteredInventory = inventoryRecords.filter(record => {
    if ((parseInt(record.quantity) || 0) <= 0) return false;
    return record.truckType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.chassisNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.color?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredEngines = engineRecords.filter(record => {
    if ((parseInt(record.quantity) || 0) <= 0) return false;
    return record.name?.toLowerCase().includes(engineSearchTerm.toLowerCase()) ||
    record.category?.toLowerCase().includes(engineSearchTerm.toLowerCase()) ||
    record.details?.toLowerCase().includes(engineSearchTerm.toLowerCase());
  });

  const filteredMachinery = machineryRecords.filter(record => {
    if ((parseInt(record.quantity) || 0) <= 0) return false;
    return record.name?.toLowerCase().includes(machinerySearchTerm.toLowerCase()) ||
    record.type?.toLowerCase().includes(machinerySearchTerm.toLowerCase());
  });
  
  const displayedSales = timeFilteredSales.filter(record => {
    const matchesSearch = 
        record.customerName?.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
        record.itemName?.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
        record.receiptNo?.toLowerCase().includes(salesSearchTerm.toLowerCase());
    if (salesFilterType === 'outstanding') {
        return matchesSearch && record.paymentMode === 'partial' && parseFloat(record.remainingBalance) > 0;
    }
    return matchesSearch;
  });

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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div className="flex items-center gap-4">
             <div className="bg-white/10 p-2 rounded-full">
                <img 
                  src={YAM_LOGO_URL} 
                  alt="Y.A.M Logo" 
                  className="w-16 h-16 object-contain rounded-full"
                />
             </div>
             <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">Y.A.M World Wide Venture</h1>
                <p className="text-blue-200 text-sm">No. 01 Na'ibawa Fly Over, Zaria Road, Kano State Nigeria</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-green-500/20 text-green-200 text-xs px-2 py-0.5 rounded border border-green-500/30">Staff Dashboard</span>
                  <span className="text-blue-300 text-xs">Welcome, {username}</span>
                </div>
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
                <span className="font-semibold text-sm uppercase tracking-wide">Financial Period:</span>
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

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <Tabs defaultValue="trucks" className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <TabsList className="bg-slate-900/50 p-1 border border-white/10 flex-wrap h-auto">
                <TabsTrigger value="trucks" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-200 hover:text-white">
                  <Truck className="w-4 h-4 mr-2" />
                  Trucks
                </TabsTrigger>
                <TabsTrigger value="machinery" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-200 hover:text-white">
                  <Wrench className="w-4 h-4 mr-2" />
                  Machinery
                </TabsTrigger>
                <TabsTrigger value="engines" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-200 hover:text-white">
                  <Box className="w-4 h-4 mr-2" />
                  Engines & Axles
                </TabsTrigger>
                <TabsTrigger value="sales" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-200 hover:text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  Sales Records ({timeFilter === 'all' ? 'All Time' : `${startDate || '?'} to ${endDate || '?'}`})
                </TabsTrigger>
                <TabsTrigger value="expenses" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-200 hover:text-white">
                  <Wallet className="w-4 h-4 mr-2" />
                  Expenses ({timeFilter === 'all' ? 'All Time' : `${startDate || '?'} to ${endDate || '?'}`})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TRUCKS TAB */}
            <TabsContent value="trucks" className="mt-0 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search trucks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => openSellModal('Truck', true)} 
                    className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Sell Truck
                  </Button>
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/20"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Truck
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Model</th>
                      <th className="text-left py-3 px-4">Specs</th>
                      <th className="text-left py-3 px-4">Color</th>
                      <th className="text-left py-3 px-4">Price</th>
                      <th className="text-left py-3 px-4">Cond</th>
                      <th className="text-left py-3 px-4">Qty</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((record, index) => (
                      <motion.tr
                        key={record.id || index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4">{record.truckType}</td>
                        <td className="py-3 px-4">{record.model}</td>
                        <td className="py-3 px-4 text-xs text-blue-200">
                            {/* Replaced Cabin with Chassis */}
                            {record.chassisNo && <span className="block font-medium">Chassis: {record.chassisNo}</span>}
                            {record.engine && <span className="block">Eng: {record.engine}</span>}
                            {record.horsePower && <span className="block">HP: {record.horsePower}</span>}
                        </td>
                        <td className="py-3 px-4">{record.color}</td>
                        <td className="py-3 px-4">₦{parseFloat(record.price || 0).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${record.condition === 'new' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                            {record.condition}
                          </span>
                        </td>
                        <td className="py-3 px-4">{record.quantity}</td>
                        <td className="py-3 px-4">{record.dateAdded}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => openEditModal(record, index)}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteRecord(record.id)}
                              size="sm"
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {filteredInventory.length === 0 && (
                  <p className="text-center text-white/50 py-8">No truck records found</p>
                )}
              </div>
            </TabsContent>

            {/* MACHINERY TAB */}
            <TabsContent value="machinery" className="mt-0 space-y-4">
                 <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search machinery..."
                    value={machinerySearchTerm}
                    onChange={(e) => setMachinerySearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => openSellModal('Machinery', true)}
                    className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Sell Machinery
                  </Button>
                  <Button
                    onClick={() => setShowAddMachineryModal(true)}
                    className="bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-900/20"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Machinery
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Details</th>
                      <th className="text-left py-3 px-4">Qty</th>
                      <th className="text-left py-3 px-4">Price</th>
                      <th className="text-left py-3 px-4">Date Added</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMachinery.map((record, index) => (
                      <motion.tr
                        key={record.id || index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-white">{record.name}</td>
                        <td className="py-3 px-4">{record.type}</td>
                        <td className="py-3 px-4 text-white/80 max-w-xs truncate">{record.details}</td>
                        <td className="py-3 px-4">
                          <span className="bg-orange-500/20 text-orange-200 px-2 py-1 rounded text-sm font-bold">
                            {record.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4">₦{parseFloat(record.price || 0).toLocaleString()}</td>
                        <td className="py-3 px-4 text-sm text-white/60">{record.dateAdded}</td>
                        <td className="py-3 px-4">
                          <Button
                            onClick={() => handleDeleteMachineryRecord(record.id)}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {filteredMachinery.length === 0 && (
                  <p className="text-center text-white/50 py-8">No machinery records found</p>
                )}
              </div>
            </TabsContent>

            {/* ENGINES TAB */}
            <TabsContent value="engines" className="mt-0 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search engines, axles..."
                    value={engineSearchTerm}
                    onChange={(e) => setEngineSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => openSellModal('Engines/Axles', true)}
                    className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Sell Item
                  </Button>
                  <Button
                    onClick={() => setShowAddEngineModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-900/20"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Engine/Axle
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-4">Category</th>
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Details/Description</th>
                      <th className="text-left py-3 px-4">Quantity</th>
                      <th className="text-left py-3 px-4">Date Added</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEngines.map((record, index) => (
                      <motion.tr
                        key={record.id || index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-white/10 hover:bg-white/5 transition-colors"
                      >
                         <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded border ${
                                record.category === 'Engine' 
                                ? 'bg-orange-500/20 text-orange-200 border-orange-500/30' 
                                : 'bg-cyan-500/20 text-cyan-200 border-cyan-500/30'
                            }`}>
                                {record.category === 'Axle' ? 'Axle' : record.category}
                            </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-white">{record.name}</td>
                        <td className="py-3 px-4 text-white/80">{record.details}</td>
                        <td className="py-3 px-4">
                          <span className="bg-purple-500/20 text-purple-200 px-2 py-1 rounded text-sm font-bold">
                            {record.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-white/60">{record.dateAdded}</td>
                        <td className="py-3 px-4">
                          <Button
                            onClick={() => handleDeleteEngineRecord(record.id)}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {filteredEngines.length === 0 && (
                  <p className="text-center text-white/50 py-8">No engine or axle records found</p>
                )}
              </div>
            </TabsContent>
            
            {/* SALES RECORDS TAB */}
            <TabsContent value="sales" className="mt-0 space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by customer, item or receipt no..."
                            value={salesSearchTerm}
                            onChange={(e) => setSalesSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <Button 
                            onClick={() => setSalesFilterType(prev => prev === 'all' ? 'outstanding' : 'all')}
                            className={`${salesFilterType === 'outstanding' ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/20' : 'bg-white/10 hover:bg-white/20 text-white'} border border-white/10 shadow-lg`}
                        >
                            {salesFilterType === 'outstanding' ? (
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
                    <table className="w-full text-white">
                        <thead>
                            <tr className="border-b border-white/20">
                                <th className="text-left py-3 px-4">Date/Time</th>
                                <th className="text-left py-3 px-4">Receipt No</th>
                                <th className="text-left py-3 px-4">Customer</th>
                                <th className="text-left py-3 px-4">Item</th>
                                <th className="text-left py-3 px-4">Qty</th>
                                <th className="text-left py-3 px-4">Amount</th>
                                <th className="text-left py-3 px-4">Status</th>
                                <th className="text-left py-3 px-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedSales.map((sale, index) => (
                                <motion.tr
                                    key={sale.id || index}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                                >
                                    <td className="py-3 px-4 text-sm">
                                        <div className="text-white">{sale.date}</div>
                                        <div className="text-white/50 text-xs">{sale.time}</div>
                                    </td>
                                    <td className="py-3 px-4 font-mono text-sm text-blue-200">{sale.receiptNo}</td>
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-white">{sale.customerName}</div>
                                        <div className="text-xs text-white/50">{sale.customerPhone}</div>
                                    </td>
                                    <td className="py-3 px-4 text-white/90">{sale.itemName}</td>
                                    <td className="py-3 px-4">
                                         <span className="bg-blue-500/20 text-blue-200 px-2 py-1 rounded text-sm font-bold">
                                            {sale.quantity}
                                         </span>
                                    </td>
                                    <td className="py-3 px-4 font-medium">₦{parseFloat(sale.amountPaid).toLocaleString()}</td>
                                    <td className="py-3 px-4">
                                        {sale.paymentMode === 'partial' ? (
                                            <div className="flex flex-col items-start">
                                                <span className="text-red-400 font-bold text-xs uppercase mb-1">Debt: ₦{parseFloat(sale.remainingBalance).toLocaleString()}</span>
                                                <Button 
                                                    onClick={() => initiateDebtPayment(sale)}
                                                    size="sm" 
                                                    className="h-6 bg-red-600 hover:bg-red-700 text-white text-xs px-2"
                                                >
                                                    Pay Debt
                                                </Button>
                                            </div>
                                        ) : (
                                             <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs font-bold">Paid</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-2">
                                          <Button
                                              onClick={() => handleReprintReceipt(sale)}
                                              size="sm"
                                              className="bg-slate-700 hover:bg-slate-600 text-white border border-white/10 shadow-sm"
                                          >
                                              <Printer className="w-4 h-4 mr-2" />
                                              Reprint
                                          </Button>
                                          <Button
                                              onClick={() => handleDeleteSale(sale.id)}
                                              size="sm"
                                              className="bg-red-600 hover:bg-red-700 text-white border border-red-500/30 shadow-sm"
                                          >
                                              <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {displayedSales.length === 0 && (
                        <p className="text-center text-white/50 py-8">No sales records found matching your search.</p>
                    )}
                </div>
            </TabsContent>

             {/* DAILY SPENT TAB - content unchanged */}
             <TabsContent value="expenses" className="mt-0 space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">Expense History & Confirmation ({timeFilter === 'all' ? 'All Time' : `${startDate || '?'} to ${endDate || '?'}`})</h3>
                        <p className="text-blue-200 text-sm">View expense history by date and confirm payments.</p>
                    </div>
                    
                    {/* Bulk Action Button */}
                    {selectedExpenseIds.length > 0 && (
                       <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                         <Button
                            onClick={() => setShowBulkConfirmModal(true)}
                            className="bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/50 mr-2"
                         >
                            <CheckSquare className="w-4 h-4 mr-2" />
                            Confirm {selectedExpenseIds.length} Selected (₦{selectedExpensesTotal.toLocaleString()})
                         </Button>
                       </motion.div>
                    )}

                    <div>
                        <Button
                            onClick={() => setShowExpenseModal(true)}
                            className="bg-pink-600 hover:bg-pink-700 shadow-lg shadow-pink-900/20"
                        >
                            <DollarSign className="w-4 h-4 mr-2" />
                            Log Daily Expense
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-white">
                        <thead>
                            <tr className="border-b border-white/20">
                                <th className="w-10 py-3 px-4">
                                   <input 
                                     type="checkbox"
                                     onChange={handleSelectAllExpenses}
                                     className="rounded border-white/30 bg-white/10 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                     title="Select all approved items"
                                   />
                                </th>
                                <th className="text-left py-3 px-4">Date & Time</th>
                                <th className="text-left py-3 px-4">Purpose</th>
                                <th className="text-left py-3 px-4">Amount</th>
                                <th className="text-left py-3 px-4">Status</th>
                                <th className="text-left py-3 px-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {timeFilteredExpenses.map((expense, index) => (
                                <motion.tr
                                    key={expense.id || index}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`border-b border-white/10 transition-colors ${selectedExpenseIds.includes(expense.id) ? 'bg-blue-500/20' : 'hover:bg-white/5'}`}
                                >
                                    <td className="py-3 px-4">
                                        {expense.status === 'approved' && (
                                            <input 
                                              type="checkbox" 
                                              checked={selectedExpenseIds.includes(expense.id)}
                                              onChange={() => handleSelectExpense(expense.id)}
                                              className="rounded border-white/30 bg-white/10 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                            />
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-sm">
                                        <div className="text-white">{expense.date}</div>
                                        <div className="text-white/50 text-xs">{expense.time}</div>
                                    </td>
                                    <td className="py-3 px-4 font-medium">{expense.purpose}</td>
                                    <td className="py-3 px-4">₦{parseFloat(expense.amount).toLocaleString()}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                            expense.status === 'pending' ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30' :
                                            expense.status === 'approved' ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' :
                                            'bg-green-500/10 text-green-300 border-green-500/30'
                                        }`}>
                                            {expense.status === 'pending' ? 'Awaiting Approval' :
                                             expense.status === 'approved' ? 'Payment Sent' :
                                             'Confirmed'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        {expense.status === 'approved' && (
                                            <Button 
                                                onClick={() => initiateConfirmExpense(expense)}
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 h-8"
                                            >
                                                <CheckCircle className="w-3 h-3 mr-1.5" />
                                                Confirm Receipt
                                            </Button>
                                        )}
                                        {expense.status === 'completed' && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-green-500 text-xs flex items-center">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Completed
                                                </span>
                                                <Button 
                                                    onClick={() => {
                                                        setReceiptData(expense);
                                                        setShowReceipt(true);
                                                    }}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-6 w-6 p-0 hover:bg-white/10 text-blue-300"
                                                    title="View Receipt"
                                                >
                                                    <Wallet className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        )}
                                        {expense.status === 'pending' && (
                                            <span className="text-white/30 text-xs italic">
                                                No action yet
                                            </span>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {timeFilteredExpenses.length === 0 && (
                        <p className="text-center text-white/50 py-8">No expense requests found for {timeFilter} period.</p>
                    )}
                </div>
             </TabsContent>
          </Tabs>
        </div>
      </motion.div>

      {showAddModal && (
        <AddTruckModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddRecord}
        />
      )}

      {showEditModal && editingRecord && (
        <EditTruckModal
          record={editingRecord}
          onClose={() => {
            setShowEditModal(false);
            setEditingRecord(null);
            setEditingIndex(null);
          }}
          onEdit={handleEditRecord}
        />
      )}

      {showAddEngineModal && (
        <AddEngineModal
          onClose={() => setShowAddEngineModal(false)}
          onAdd={handleAddEngineRecord}
        />
      )}

      {showAddMachineryModal && (
        <AddMachineryModal
          onClose={() => setShowAddMachineryModal(false)}
          onAdd={handleAddMachineryRecord}
        />
      )}

      {showExpenseModal && (
        <DailyExpenseModal
            onClose={() => setShowExpenseModal(false)}
            onAdd={handleAddExpense}
        />
      )}

      {showConfirmModal && expenseToConfirm && (
        <ConfirmExpenseModal
            expense={expenseToConfirm}
            onClose={() => setShowConfirmModal(false)}
            onConfirm={handleFinalizeExpense}
        />
      )}

      {showBulkConfirmModal && (
        <BulkConfirmExpenseModal 
            selectedCount={selectedExpenseIds.length}
            totalAmount={selectedExpensesTotal}
            onClose={() => setShowBulkConfirmModal(false)}
            onConfirm={handleFinalizeBulkExpense}
        />
      )}
      
      {showReceipt && receiptData && (
        <DailyExpenseReceipt
            expense={receiptData}
            onClose={() => setShowReceipt(false)}
        />
      )}
      
      {showCombinedReceipt && combinedReceiptData && (
        <CombinedExpenseReceipt
            data={combinedReceiptData}
            onClose={() => {
                setShowCombinedReceipt(false);
                setCombinedReceiptData(null);
            }}
        />
      )}
      
      {showSalesReceipt && selectedSale && (
        <SalesReceipt
            sale={selectedSale}
            onClose={() => {
                setShowSalesReceipt(false);
                setSelectedSale(null);
            }}
        />
      )}

      {showSellModal && (
        <SellEngineModal
          onClose={() => setShowSellModal(false)}
          truckInventory={inventoryRecords}
          engineInventory={engineRecords}
          machineryInventory={machineryRecords}
          onSaleComplete={handleSaleComplete}
          defaultCategory={sellModalConfig.defaultCategory}
          lockCategory={sellModalConfig.lockCategory}
        />
      )}

      {showSellTruckModal && (
         <SellTruckModal 
            onClose={() => setShowSellTruckModal(false)}
            inventory={inventoryRecords}
            onSaleComplete={handleSaleComplete}
         />
      )}

      {/* Debt Payment Modal */}
      {showDebtModal && saleToPayDebt && (
        <DebtPaymentModal
            sale={saleToPayDebt}
            onClose={() => {
                setShowDebtModal(false);
                setSaleToPayDebt(null);
            }}
            onPaymentComplete={handleDebtPaymentComplete}
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
            userRole="staff"
            username={username}
        />
      )}
    </div>
  );
};

export default StaffDashboard;
