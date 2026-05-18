import React from 'react';
import { motion } from 'framer-motion';
import { X, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

const YAM_LOGO_URL = "https://horizons-cdn.hostinger.com/f8aba79f-60b9-413d-b971-e48e97627679/5fc8119d1382941996f04918d1bdfe78.png";

const SalesReceipt = ({ sale, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  if (!sale) return null;

  // Helper to parse details into structured view
  const renderDetails = () => {
    // 1. TRUCK SPECIFIC DETAILS
    if (sale.category === 'Truck' && sale.itemData) {
         return (
             <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
                 <div className="flex justify-between border-b border-gray-300 pb-1">
                    <span className="text-gray-600">Color:</span>
                    <span className="font-bold text-gray-900">{sale.itemData.color || 'N/A'}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-300 pb-1">
                    <span className="text-gray-600">Engine:</span>
                    <span className="font-bold text-gray-900">{sale.itemData.engine || 'N/A'}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-300 pb-1">
                    <span className="text-gray-600">Horse Power:</span>
                    <span className="font-bold text-gray-900">{sale.itemData.horsePower || 'N/A'}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-300 pb-1">
                    <span className="text-gray-600">Condition:</span>
                    <span className="font-bold text-gray-900 capitalize">{sale.itemData.condition || 'Used'}</span>
                 </div>
                 <div className="col-span-2 flex justify-between border-b border-gray-300 pb-1 pt-1">
                    <span className="text-gray-700 font-bold">Chassis No:</span>
                    <span className="font-mono font-bold text-gray-900">{sale.itemData.chassisNo || 'N/A'}</span>
                 </div>
             </div>
         );
    }

    // 2. MACHINERY SPECIFIC DETAILS
    if (sale.category === 'Machinery' && sale.itemData) {
         return (
             <div className="space-y-1 mt-2 text-xs">
                 <div className="flex justify-between border-b border-gray-300 pb-1">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-bold text-gray-900">{sale.itemData.type || 'N/A'}</span>
                 </div>
                 <div className="border-b border-gray-300 pb-1">
                    <span className="text-gray-600 block text-[10px] uppercase">Description:</span>
                    <span className="font-bold text-gray-900">{sale.itemData.details || sale.details || 'N/A'}</span>
                 </div>
             </div>
         );
    }

    // 3. GENERIC / FALLBACK DETAILS
    const details = sale.details || '';
    if (details.includes('\n') || details.includes(',')) {
        const separator = details.includes('\n') ? '\n' : ',';
        return (
             <div className="space-y-1 mt-2 text-xs">
                {details.split(separator).map((line, idx) => {
                    const parts = line.split(':');
                    if (parts.length > 1) {
                         return (
                            <div key={idx} className="flex justify-between border-b border-gray-300 pb-1">
                                <span className="text-gray-600">{parts[0].trim()}:</span>
                                <span className="font-bold text-gray-900">{parts.slice(1).join(':').trim()}</span>
                            </div>
                         );
                    }
                    return <div key={idx} className="text-gray-900 border-b border-gray-300 pb-1">{line}</div>;
                })}
             </div>
        );
    }
    
    return <div className="text-gray-900 text-xs mt-2 border-b border-gray-300 pb-2">{details}</div>;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60] overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-2xl max-w-[800px] w-full overflow-hidden flex flex-col relative print:shadow-none print:max-w-none print:w-full print:h-auto print:static print:overflow-visible"
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
        <div id="printable-sales-receipt" className="p-8 bg-white text-black font-sans relative flex flex-col min-h-[800px] h-full">
          
          {/* --- WATERMARKS --- */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none select-none z-0">
             <img 
               className="w-96 h-96 object-contain grayscale"
               alt="Watermark"
               src={YAM_LOGO_URL} />
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
             <div className="transform -rotate-45">
                <div className="text-8xl font-black text-blue-900/5 uppercase tracking-widest border-[8px] border-blue-900/5 p-10 rounded-3xl whitespace-nowrap">
                    {sale.paymentMode === 'partial' ? 'DEPOSIT' : 'PAID & APPROVED'}
                </div>
             </div>
          </div>

          {/* --- HEADER --- */}
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center border-b-2 border-double border-gray-800 pb-6 mb-6">
             <div className="flex flex-col items-center md:items-start text-center md:text-left mb-4 md:mb-0">
                <img src={YAM_LOGO_URL} alt="Logo" className="w-24 h-24 object-contain mb-2" />
                <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">YAM World Wide Ventures</h1>
                
             </div>
             
             <div className="text-center md:text-right text-sm text-gray-700 space-y-1">
                 <p className="font-bold text-gray-900 uppercase tracking-wide">Head Office:</p>
                 <p>No. 01 Na'ibawa Fly Over, Zaria Road</p>
                 <p>Kano State, Nigeria</p>
                 <div className="mt-3 pt-3 border-t border-gray-300">
                     <p className="font-bold">Tel: 08069081690, 08142193149</p>
                     <p>Email: yamworldwideventure@gmail.com</p>
                 </div>
             </div>
          </div>

          {/* --- RECEIPT META --- */}
          <div className="relative z-10 flex justify-between items-end mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200 print:bg-transparent print:border-gray-300">
             <div>
                 <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Customer Details</p>
                 <h3 className="text-lg font-bold text-gray-900">{sale.customerName}</h3>
                 <p className="text-sm text-gray-700">{sale.customerPhone}</p>
                 <p className="text-sm text-gray-700 max-w-[250px] leading-tight mt-1">{sale.address}</p>
             </div>
             <div className="text-right">
                 <div className="inline-block bg-white border border-gray-300 px-4 py-2 rounded shadow-sm print:shadow-none print:border-gray-400">
                     <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Receipt No</p>
                     <p className="text-xl font-mono font-bold text-gray-900">{sale.receiptNo}</p>
                 </div>
                 <p className="text-sm text-gray-600 mt-2">
                     Date: <span className="font-bold text-gray-900">{sale.date}</span>
                 </p>
                 <p className="text-sm text-gray-600">
                     Time: <span className="font-bold text-gray-900">{sale.time}</span>
                 </p>
             </div>
          </div>

          {/* --- MAIN CONTENT (TABLE STYLE) --- */}
          <div className="relative z-10 flex-1">
             <div className="border border-gray-300 rounded-lg overflow-hidden">
                 <table className="w-full text-left">
                     <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-bold print:bg-gray-200">
                         <tr>
                             <th className="px-6 py-3 border-b border-gray-300">Item Description</th>
                             <th className="px-6 py-3 border-b border-gray-300 text-center">Qty</th>
                             <th className="px-6 py-3 border-b border-gray-300 text-right">Amount (₦)</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-200">
                         <tr>
                             <td className="px-6 py-4 align-top">
                                 <p className="font-bold text-lg text-gray-900">{sale.itemName}</p>
                                 <span className="inline-block bg-blue-50 text-blue-900 border border-blue-100 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider mb-2 print:border-gray-300 print:text-black">
                                     {sale.category}
                                 </span>
                                 {/* Render Dynamic Details */}
                                 <div className="bg-gray-50 p-3 rounded border border-gray-200 max-w-md print:bg-transparent print:border-gray-300">
                                     {renderDetails()}
                                 </div>
                             </td>
                             <td className="px-6 py-4 text-center align-top font-bold text-gray-900">
                                 {sale.quantity}
                             </td>
                             <td className="px-6 py-4 text-right align-top">
                                 <span className="font-bold text-lg text-gray-900">{parseFloat(sale.amountPaid).toLocaleString()}</span>
                                 {sale.paymentMode === 'partial' && (
                                     <div className="mt-1 text-xs text-red-600 font-bold print:text-black">
                                         (Deposit Only)
                                     </div>
                                 )}
                             </td>
                         </tr>
                     </tbody>
                 </table>
             </div>

             {/* --- TOTALS SECTION --- */}
             <div className="flex justify-end mt-4">
                 <div className="w-64 space-y-2">
                     <div className="flex justify-between text-sm text-gray-700">
                         <span>Payment Mode:</span>
                         <span className="font-bold uppercase text-gray-900">{sale.paymentMode === 'full' ? 'Full Payment' : 'Partial Payment'}</span>
                     </div>
                     <div className="flex justify-between items-center border-t border-gray-300 pt-2">
                         <span className="font-bold text-gray-900">Total Paid:</span>
                         <span className="font-bold text-xl text-blue-900 print:text-black">₦{parseFloat(sale.amountPaid).toLocaleString()}</span>
                     </div>
                     {sale.paymentMode === 'partial' && (
                         <div className="flex justify-between items-center bg-red-50 p-2 rounded border border-red-200 print:bg-transparent print:border-gray-300">
                             <span className="font-bold text-red-800 text-sm print:text-black">Balance Due:</span>
                             <span className="font-bold text-lg text-red-600 print:text-black">₦{parseFloat(sale.remainingBalance || 0).toLocaleString()}</span>
                         </div>
                     )}
                 </div>
             </div>
          </div>
            
          {/* --- FOOTER & SIGNATURES --- */}
          <div className="relative z-10 mt-auto pt-12 pb-4">
             <div className="grid grid-cols-2 gap-12 mb-8">
                  <div className="text-center">
                      <div className="border-b-2 border-gray-400 w-3/4 mx-auto mb-2"></div>
                      <p className="text-xs font-bold uppercase text-gray-600">Customer's Signature</p>
                  </div>
                  <div className="text-center relative">
                      {/* Stamp Overlay */}
                      <div className="absolute -top-12 left-0 right-0 flex justify-center opacity-70 pointer-events-none">
                            <img 
                                src={YAM_LOGO_URL} 
                                className="w-32 h-32 object-contain transform -rotate-12" 
                                style={{ filter: 'hue-rotate(200deg) saturate(200%)' }}
                                alt="Stamp"
                            />
                      </div>
                      <div className="border-b-2 border-gray-400 w-3/4 mx-auto mb-2 relative z-10"></div>
                      <p className="text-xs font-bold uppercase text-gray-600 relative z-10">Manager's Signature</p>
                  </div>
             </div>

             <div className="text-center border-t-2 border-gray-200 pt-4">
                <p className="text-xs text-gray-500 italic font-medium">
                    "Goods sold in good condition are not returnable."
                </p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
                    Thank you for your patronage • Generated on {new Date().toLocaleString()}
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
            #printable-sales-receipt, #printable-sales-receipt * {
                visibility: visible;
            }
            #printable-sales-receipt {
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
            /* Ensure text is black for printing */
            .text-white, .text-blue-200, .text-gray-500, .text-gray-400 {
                color: black !important;
            }
            .border-white\\/10 {
                border-color: #e5e7eb !important; /* gray-200 */
            }
        }
      `}</style>
    </div>
  );
};

export default SalesReceipt;