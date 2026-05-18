import React from 'react';
import { motion } from 'framer-motion';
import { X, Printer, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DailyExpenseReceipt = ({ expense, onClose }) => {
  const YAM_LOGO_URL = "https://horizons-cdn.hostinger.com/f8aba79f-60b9-413d-b971-e48e97627679/5fc8119d1382941996f04918d1bdfe78.png";

  const handlePrint = () => {
    window.print();
  };

  if (!expense) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60] overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden flex flex-col relative print:shadow-none print:max-w-none print:w-full print:h-auto print:static print:overflow-visible"
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
        <div id="printable-expense-receipt" className="p-8 bg-white text-black font-sans relative overflow-hidden flex flex-col min-h-[600px]">
          
          {/* --- WATERMARKS START --- */}
          
          {/* 1. Logo Watermark (Background) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0">
             <img 
               className="w-80 h-80 object-contain grayscale"
               alt="YAM World Wide Ventures Watermark Logo"
               src={YAM_LOGO_URL} />
          </div>

          {/* 2. "DAILY SPENT" Text Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
             <div className="transform -rotate-45 flex flex-col items-center justify-center">
                <div className="text-6xl md:text-7xl font-black text-gray-900/5 uppercase tracking-widest border-[6px] border-gray-900/5 p-6 rounded-3xl whitespace-nowrap">
                    DAILY SPENT
                </div>
                <div className="text-sm font-bold text-gray-900/10 tracking-[1em] mt-4 uppercase">
                    Official Receipt
                </div>
             </div>
          </div>
          
          {/* --- WATERMARKS END --- */}

          <div className="relative z-10 flex-1 flex flex-col">
            <div className="text-center border-b-2 border-dashed border-gray-300 pb-6 mb-6">
                <div className="flex justify-center mb-4">
                    <img 
                        alt="YAM World Wide Ventures Logo" 
                        className="w-20 h-20 object-contain"
                        src={YAM_LOGO_URL} />
                </div>
                <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-900">YAM-WORLD-WIDE VENTURES</h1>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Official Payment Receipt</p>
                
                <div className="mt-4 text-xs text-gray-600 space-y-1">
                    <p>No. 01 Na'ibawa Fly Over, Zaria Road</p>
                    <p>Kano State, Nigeria</p>
                    <p className="font-semibold mt-2">Contact Us:</p>
                    <p className="font-bold">08069081690, 09042193149</p>
                    <p className="font-bold">yamworldwideventure@gmail.com</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-center mb-6">
                    <div className="border-2 border-green-600 text-green-700 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider flex items-center gap-2 transform -rotate-2 bg-white/80 backdrop-blur-[2px]">
                        <CheckCircle className="w-4 h-4" />
                        Paid & Approved
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 text-sm bg-gray-50 border border-gray-100 p-4 rounded print:bg-transparent print:border-gray-300">
                    <div className="text-gray-500 font-medium">Date:</div>
                    <div className="text-right font-mono font-bold text-gray-900">{expense.date}</div>

                    <div className="text-gray-500 font-medium">Time:</div>
                    <div className="text-right font-mono font-bold text-gray-900">{expense.time}</div>

                    <div className="text-gray-500 font-medium">Transaction ID:</div>
                    <div className="text-right font-mono text-xs text-gray-900">#{expense.id}</div>

                    <div className="text-gray-500 font-medium">Staff Member:</div>
                    <div className="text-right font-bold text-gray-900">{expense.staffName}</div>
                </div>

                {/* Receiver Details Section */}
                {expense.receiverName && (
                  <div className="bg-white border border-gray-300 rounded p-3 text-sm print:border-gray-400">
                    <div className="text-xs text-gray-500 uppercase font-bold mb-2 border-b border-gray-200 pb-1">Receiver Details</div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-bold text-gray-900">{expense.receiverName}</span>
                    </div>
                    {expense.receiverPhone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-mono text-gray-900">{expense.receiverPhone}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-b border-gray-200 py-4 my-4">
                    <div className="text-xs text-gray-500 uppercase mb-1 font-bold">Purpose of Payment</div>
                    <div className="text-lg font-bold text-gray-900 leading-tight">
                        {expense.purpose}
                    </div>
                </div>

                <div className="flex justify-between items-end bg-gray-50 p-4 rounded-lg border border-gray-200 relative z-20 print:bg-transparent print:border-gray-400">
                    <span className="text-gray-600 font-bold uppercase text-xs tracking-wider">Total Amount</span>
                    <span className="text-2xl font-black text-gray-900">
                        ₦{parseFloat(expense.amount).toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Signature Section with Digital Stamp */}
            <div className="mt-auto pt-12">
               <div className="flex justify-between items-end gap-4">
                  {/* Receiver Signature */}
                  <div className="flex-1">
                      <div className="border-b-2 border-gray-800 mb-2 h-10"></div>
                      <p className="text-[10px] font-bold uppercase text-center text-gray-600 tracking-wider">Receiver's Signature & Date</p>
                  </div>

                  {/* Company Signature */}
                  <div className="flex-1 relative">
                      {/* Digital Stamp Overlay */}
                      <div className="absolute bottom-6 right-0 left-0 flex justify-center pointer-events-none opacity-40">
                         <div className="relative">
                            <img 
                               src={YAM_LOGO_URL} 
                               className="w-24 h-24 object-contain transform -rotate-12 border-4 border-blue-800/20 rounded-full p-2" 
                               style={{ filter: 'grayscale(100%) sepia(100%) hue-rotate(200deg) saturate(300%)' }}
                               alt="Company Stamp"
                            />
                         </div>
                      </div>

                      <div className="border-b-2 border-gray-800 mb-2 h-10 relative z-10"></div>
                      <p className="text-[10px] font-bold uppercase text-center text-gray-600 tracking-wider">Company Signatory & Date</p>
                  </div>
               </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200 text-center">
                <p className="text-[10px] text-gray-400 italic">
                    This is a computer-generated receipt.
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                    Printed on {new Date().toLocaleString()}
                </p>
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
                Print Receipt
            </Button>
        </div>
      </motion.div>
      <style>{`
        @media print {
            body * {
                visibility: hidden;
            }
            #printable-expense-receipt, #printable-expense-receipt * {
                visibility: visible;
            }
            #printable-expense-receipt {
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

export default DailyExpenseReceipt;