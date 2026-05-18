import React from 'react';
import { motion } from 'framer-motion';
import { X, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CombinedExpenseReceipt = ({ data, onClose }) => {
  const YAM_LOGO_URL = "https://horizons-cdn.hostinger.com/f8aba79f-60b9-413d-b971-e48e97627679/5fc8119d1382941996f04918d1bdfe78.png";

  const handlePrint = () => {
    window.print();
  };

  if (!data) return null;

  const { items, receiver, total, date } = data;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[70] overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col relative print:shadow-none print:max-w-none print:w-full print:h-auto print:static print:overflow-visible"
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
        <div id="printable-combined-receipt" className="p-8 bg-white text-black font-sans relative overflow-hidden flex flex-col min-h-[600px]">
          
          {/* --- WATERMARKS START --- */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0">
             <img 
               className="w-96 h-96 object-contain grayscale"
               alt="YAM World Wide Ventures Watermark Logo"
               src={YAM_LOGO_URL} />
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
             <div className="transform -rotate-45 flex flex-col items-center justify-center">
                <div className="text-6xl md:text-8xl font-black text-gray-900/5 uppercase tracking-widest border-[8px] border-gray-900/5 p-8 rounded-3xl whitespace-nowrap">
                    BULK RECEIPT
                </div>
             </div>
          </div>
          {/* --- WATERMARKS END --- */}

          <div className="relative z-10 flex-1 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-dashed border-gray-300 pb-6 mb-6">
                <div>
                     <div className="flex items-center gap-3 mb-2">
                        <img 
                            alt="YAM Logo" 
                            className="w-12 h-12 object-contain"
                            src={YAM_LOGO_URL} />
                         <div>
                            <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">YAM-WORLD-WIDE VENTURES</h1>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Combined Expense Receipt</p>
                         </div>
                     </div>
                     <div className="text-xs text-gray-600 space-y-0.5 ml-1">
                        <p>No. 01 Na'ibawa Fly Over, Zaria Road, Kano State</p>
                        <p className="font-bold">08069081690, 08142193149</p>
                    </div>
                </div>
                <div className="text-right text-xs">
                    <p className="text-gray-500">Date Generated:</p>
                    <p className="font-mono font-bold text-gray-900 text-sm">{date}</p>
                    <div className="mt-2 border border-green-600 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block print:border-black print:text-black">
                        Approved & Paid
                    </div>
                </div>
            </div>

            {/* Receiver Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-sm flex justify-between items-center print:bg-white print:border-gray-400">
                <div>
                    <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Receiver Details</span>
                    <span className="font-bold text-gray-900 text-lg block">{receiver.receiverName}</span>
                    {receiver.receiverPhone && <span className="text-gray-600 font-mono block">{receiver.receiverPhone}</span>}
                </div>
                <div className="text-right">
                    <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Total Items</span>
                    <span className="font-bold text-gray-900 text-lg">{items.length}</span>
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="border-b-2 border-gray-200">
                            <th className="py-2 text-gray-500 font-medium w-24">Date/Time</th>
                            <th className="py-2 text-gray-500 font-medium">Purpose</th>
                            <th className="py-2 text-gray-500 font-medium text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-100">
                                <td className="py-3 text-gray-600 text-xs">
                                    <div className="font-bold">{item.date}</div>
                                    <div className="text-gray-400">{item.time}</div>
                                </td>
                                <td className="py-3 font-medium text-gray-900">
                                    {item.purpose}
                                    <div className="text-[10px] text-gray-400 font-normal">Staff: {item.staffName}</div>
                                </td>
                                <td className="py-3 font-mono font-bold text-gray-900 text-right">
                                    ₦{parseFloat(item.amount).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-50 print:bg-white">
                            <td colSpan="2" className="py-3 px-2 text-gray-600 font-bold uppercase text-right">Total Amount Disbursed:</td>
                            <td className="py-3 px-2 text-xl font-black text-gray-900 text-right border-t-2 border-gray-800">
                                ₦{total.toLocaleString()}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Signatures */}
            <div className="mt-auto pt-10">
               <div className="flex justify-between items-end gap-12">
                  <div className="flex-1">
                      <div className="border-b-2 border-gray-400 mb-2 h-8"></div>
                      <p className="text-[10px] font-bold uppercase text-center text-gray-500">Receiver's Signature</p>
                  </div>
                  <div className="flex-1">
                      <div className="border-b-2 border-gray-400 mb-2 h-8"></div>
                      <p className="text-[10px] font-bold uppercase text-center text-gray-500">Authorized Signatory</p>
                  </div>
               </div>
            </div>

            <div className="mt-6 text-center">
                <p className="text-[10px] text-gray-400 italic">Combined Receipt Generated Automatically by System</p>
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
                Print Combined Receipt
            </Button>
        </div>
      </motion.div>
      <style>{`
        @media print {
            body * {
                visibility: hidden;
            }
            #printable-combined-receipt, #printable-combined-receipt * {
                visibility: visible;
            }
            #printable-combined-receipt {
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

export default CombinedExpenseReceipt;