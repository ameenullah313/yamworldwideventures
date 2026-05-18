import React from 'react';
import { motion } from 'framer-motion';
import { X, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MonthlyReport = ({ sales = [], expenses = [], period = 'Monthly', onClose }) => {
  const YAM_LOGO_URL = "https://horizons-cdn.hostinger.com/f8aba79f-60b9-413d-b971-e48e97627679/5fc8119d1382941996f04918d1bdfe78.png";

  const totalSales = sales.reduce((sum, sale) => sum + (parseFloat(sale.amountPaid) || 0), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  const netProfit = totalSales - totalExpenses;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[70] overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col relative print:shadow-none print:max-w-none print:w-full print:h-auto print:static print:overflow-visible"
      >
        <div className="absolute top-2 right-2 print:hidden z-20">
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full h-8 w-8 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Printable Area */}
        <div id="printable-report" className="p-8 bg-white text-black font-sans relative overflow-hidden flex flex-col min-h-[500px]">
           {/* Watermark */}
           <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0">
             <img 
               className="w-96 h-96 object-contain grayscale"
               alt="Watermark"
               src={YAM_LOGO_URL} />
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center border-b-2 border-gray-800 pb-6 mb-8">
                <div className="flex justify-center mb-4">
                    <img 
                        alt="Logo" 
                        className="w-20 h-20 object-contain"
                        src={YAM_LOGO_URL} />
                </div>
                <h1 className="text-3xl font-black uppercase tracking-wide text-gray-900">YAM-WORLD-WIDE VENTURES</h1>
                <p className="text-sm text-gray-600 mt-2 font-medium">FINANCIAL REPORT - {period.toUpperCase()}</p>
                <p className="text-xs text-gray-500 mt-1">Generated on {new Date().toLocaleString()}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded border border-gray-200 print:bg-white print:border-gray-400">
                    <h3 className="text-sm font-bold text-gray-500 uppercase">Total Income</h3>
                    <p className="text-2xl font-bold text-blue-700 print:text-black">₦{totalSales.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded border border-gray-200 print:bg-white print:border-gray-400">
                    <h3 className="text-sm font-bold text-gray-500 uppercase">Total Expenses</h3>
                    <p className="text-2xl font-bold text-red-700 print:text-black">₦{totalExpenses.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded border border-gray-200 print:bg-white print:border-gray-400">
                    <h3 className="text-sm font-bold text-gray-500 uppercase">Net Flow</h3>
                    <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'} print:text-black`}>
                        {netProfit >= 0 ? '+' : ''}₦{netProfit.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Sales Table */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-blue-600 pl-3 print:border-black">Sales Records</h3>
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-xs print:bg-white print:border-b print:border-gray-300">
                        <tr>
                            <th className="px-3 py-2">Date</th>
                            <th className="px-3 py-2">Receipt #</th>
                            <th className="px-3 py-2">Item</th>
                            <th className="px-3 py-2">Customer</th>
                            <th className="px-3 py-2 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {sales.length > 0 ? sales.map((sale, i) => (
                            <tr key={i}>
                                <td className="px-3 py-2">{sale.date}</td>
                                <td className="px-3 py-2 font-mono text-xs font-bold">{sale.receiptNo}</td>
                                <td className="px-3 py-2">{sale.itemName}</td>
                                <td className="px-3 py-2">{sale.customerName}</td>
                                <td className="px-3 py-2 text-right font-medium">₦{parseFloat(sale.amountPaid).toLocaleString()}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-3 py-4 text-center text-gray-500 italic">No sales records for this period.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Expenses Table */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-red-600 pl-3 print:border-black">Expense Records</h3>
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-xs print:bg-white print:border-b print:border-gray-300">
                        <tr>
                            <th className="px-3 py-2">Date</th>
                            <th className="px-3 py-2">Staff</th>
                            <th className="px-3 py-2">Purpose</th>
                            <th className="px-3 py-2">Status</th>
                            <th className="px-3 py-2 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {expenses.length > 0 ? expenses.map((exp, i) => (
                            <tr key={i}>
                                <td className="px-3 py-2">{exp.date}</td>
                                <td className="px-3 py-2">{exp.staffName}</td>
                                <td className="px-3 py-2">{exp.purpose}</td>
                                <td className="px-3 py-2 text-xs uppercase">{exp.status}</td>
                                <td className="px-3 py-2 text-right font-medium">₦{parseFloat(exp.amount).toLocaleString()}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-3 py-4 text-center text-gray-500 italic">No expense records for this period.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-8 border-t border-gray-200 text-center text-xs text-gray-500">
                <p>Y.A.M World Wide Venture • Confidential Financial Document</p>
                <p>08069081690, 08142193149 • yamworldwideventure@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex gap-3 print:hidden relative z-20">
            <Button 
                onClick={onClose}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
            >
                Close
            </Button>
            <Button 
                onClick={handlePrint}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/10"
            >
                <Printer className="w-4 h-4 mr-2" />
                Print / Save as PDF
            </Button>
        </div>
      </motion.div>
      <style>{`
        @media print {
            body * {
                visibility: hidden;
            }
            #printable-report, #printable-report * {
                visibility: visible;
            }
            #printable-report {
                position: fixed;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 20px;
                background-color: white !important;
                color: black !important;
                z-index: 99999;
                overflow: visible;
            }
        }
      `}</style>
    </div>
  );
};

export default MonthlyReport;