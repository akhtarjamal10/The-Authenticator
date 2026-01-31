// import React from 'react';
// import { FileText, CheckCircle, XCircle } from 'lucide-react';

// // --- Type Definitions ---
// interface ComparisonProps {
//   file1: any; // Document data from Source A
//   file2: any; // Document data from Source B
//   diff: any;  // The parsed difference object
//   onComplete: () => void;
//   resetFlow: () => void;
// }

// // --- Helper Constants ---
// const IGNORED_KEYS = ['_id', '__v', '$oid'];

// // --- Helper Functions ---

// /**
//  * Recursively flattens JSON into a single object with dot notation keys (e.g., "marksheet.academic_info.sgpa").
//  * Used to prepare both the data and the difference object for easy comparison.
//  */
// const flattenDocument = (obj: any, parentKey: string = '', filePrefix: 'file1' | 'file2' | undefined = undefined): Record<string, any> => {
//     let result: Record<string, any> = {};

//     for (const key in obj) {
//         if (!obj.hasOwnProperty(key)) continue;

//         if (IGNORED_KEYS.includes(key) || key.includes('$')) {
//             continue; // Skip MongoDB internal keys
//         }

//         const newKey = parentKey ? `${parentKey}.${key}` : key;
//         const value = obj[key];

//         if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
//             // Recurse for nested objects
//             Object.assign(result, flattenDocument(value, newKey, filePrefix));
//         } else if (Array.isArray(value)) {
//             // For arrays, treat the entire array content as one field for simplicity.
//             result[newKey] = `[${value.length} items]`; 
//         } else {
//             // Primitive value (string, number, boolean, null)
            
//             // If processing the 'diff' object, extract the specific file's value
//             if (filePrefix && typeof value === 'object' && value !== null) {
//                 result[newKey] = value[filePrefix] ?? 'N/A';
//             } else {
//                  result[newKey] = value;
//             }
//         }
//     }
//     return result;
// };


// /**
//  * Renders the values for a single field, applying color highlighting based on diff status.
//  */
// const renderFieldRow = (key: string, value1: any, value2: any, isDiff: boolean) => {
    
//     const formatValue = (value: any) => {
//         if (value === null) return 'null';
//         if (typeof value === 'object') return '...Object / Array...';
//         return String(value);
//     };
    
//     // The highlight class is applied to the data cells (value1 and value2)
//     const highlightClass = isDiff ? 'bg-red-200 text-red-900 font-semibold' : 'text-gray-800';
    
//     // FIX 2: Extract the clean display name (last segment of the dot notation key)
//     const keySegments = key.split('.');
//     const rawDisplayKey = keySegments[keySegments.length - 1];
//     const displayKey = rawDisplayKey.replace(/_/g, ' '); // Clean up underscores

//     return (
//         // FIX 1: The key prop is added here to resolve the warning
//         <div 
//           key={key} 
//           className="grid grid-cols-3 gap-4 border-b border-gray-100 py-3 items-center hover:bg-gray-50"
//         >
//           <div className="text-sm font-medium text-gray-500 pl-4">{displayKey}</div>
          
//           {/* FIX 3: Ensure the highlight class is applied to the data cells for visibility */}
//           <div className={`text-sm pr-4 ${isDiff ? highlightClass : 'text-gray-800'}`}>{formatValue(value1)}</div>
          
//           <div className={`text-sm pr-4 ${isDiff ? highlightClass : 'text-gray-800'}`}>{formatValue(value2)}</div>
//         </div>
//     );
// };

// // --- Main Component ---
// export const DocumentComparisonDisplay: React.FC<ComparisonProps> = ({ 
//   file1, 
//   file2, 
//   diff, 
//   onComplete, 
//   resetFlow 
// }) => {
  
//   // 1. Flatten all documents and differences for easy key-based iteration and comparison
//   const flatFile1 = flattenDocument(file1);
//   const flatFile2 = flattenDocument(file2);
//   const flatDiff = flattenDocument(diff, '', 'file1'); 
  
//   const isMatch = Object.keys(flatDiff).length === 0;
  
//   // 2. Create a combined list of unique flattened keys for iteration
//   const allKeys = new Set([...Object.keys(flatFile1), ...Object.keys(flatFile2)]);
//   const sortedKeys = Array.from(allKeys).sort();

//   return (
//     <div className="max-w-7xl mx-auto p-4 md:p-8 bg-slate-50">
      
//       {/* --- Header Summary --- */}
//       <div className={`rounded-lg shadow-xl p-6 mb-8 border-l-8 ${isMatch ? 'border-gov-green bg-white' : 'border-red-600 bg-red-50'}`}>
//         <div className="flex items-center gap-4">
//           {isMatch 
//             ? <CheckCircle size={32} className="text-gov-green flex-shrink-0" /> 
//             : <XCircle size={32} className="text-red-600 flex-shrink-0" />
//           }
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900">
//               {isMatch ? "Verification Successful: Documents Match" : "Verification Failed: Mismatch Found"}
//             </h2>
//             <p className="text-sm text-gray-500 mt-1">
//               {isMatch 
//                 ? "The two documents' core data fields are a 100% database match." 
//                 : `Found ${Object.keys(flatDiff).length} mismatching field(s). Review the highlighted values below.`
//               }
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* --- Comparison Table --- */}
//       <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        
//         {/* Table Header */}
//         <div className="grid grid-cols-3 gap-4 p-4 bg-gray-100 font-bold text-sm text-gray-700 uppercase">
//           <div>Field</div>
//           <div className="flex items-center gap-2"><FileText size={16} /> Document 1 (Source A)</div>
//           <div className="flex items-center gap-2"><FileText size={16} /> Document 2 (Source B)</div>
//         </div>

//         {/* Table Body - Iterating over all flattened fields */}
//         <div className="divide-y divide-gray-200">
//           {sortedKeys.map(key => {
//             const value1 = flatFile1[key];
//             const value2 = flatFile2[key];
            
//             const isDiff = flatDiff.hasOwnProperty(key); 
            
//             // The renderFieldRow function now includes the key prop on its root element
//             return renderFieldRow(key, value1, value2, isDiff);
//           })}

//            {sortedKeys.length === 0 && (
//             <div className="p-8 text-center text-gray-500">
//                 No comparable fields found in the documents.
//             </div>
//           )}
//         </div>
//       </div>
      
//       {/* --- Action Buttons --- */}
//       <div className="flex justify-center gap-4 mt-8">
//         <button 
//           onClick={resetFlow} 
//           className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
//         >
//           Submit Another Document
//         </button>
//         <button 
//           onClick={onComplete} 
//           className="px-6 py-2 bg-gov-blue text-white rounded shadow hover:bg-blue-800 font-bold"
//         >
//           Go to Dashboard
//         </button>
//       </div>
//     </div>
//   );
// };

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  ShieldCheck, 
  XOctagon 
} from 'lucide-react';
import { VerificationResult } from '../types';

interface Props {
  result: VerificationResult;
  onReset: () => void;
}

export const DocumentComparisonDisplay: React.FC<Props> = ({ result, onReset }) => {
  const isMatch = result.status === "MATCH";
  const scoreColor = isMatch ? "text-emerald-600" : "text-rose-600";
  const bgColor = isMatch ? "bg-emerald-50" : "bg-rose-50";
  const borderColor = isMatch ? "border-emerald-200" : "border-rose-200";

  return (
    <div className="max-w-4xl mx-auto w-full">
      
      {/* 1. HEADER CARD (Score & Status) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative overflow-hidden rounded-2xl border-2 ${borderColor} ${bgColor} p-8 mb-8 shadow-sm`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          
          {/* Status Icon & Text */}
          <div className="flex items-center gap-5">
            <div className={`p-4 rounded-full bg-white shadow-sm ${scoreColor}`}>
              {isMatch ? <ShieldCheck size={48} /> : <XOctagon size={48} />}
            </div>
            <div>
              <h2 className={`text-3xl font-bold ${scoreColor} tracking-tight`}>
                {isMatch ? "Authentic Document" : "Tampering Detected"}
              </h2>
              <p className="text-gray-600 mt-1 font-medium">
                {isMatch 
                  ? "All data points match the university records." 
                  : "Discrepancies found between document and database."}
              </p>
            </div>
          </div>

          {/* Score Counter */}
          <div className="text-center bg-white/80 p-4 rounded-xl backdrop-blur-sm border border-gray-100 shadow-sm min-w-[140px]">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Trust Score</span>
            <div className={`text-5xl font-black ${scoreColor}`}>
              {result.score}%
            </div>
          </div>
        </div>

        {/* Background Decorative Pattern */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-current opacity-5 rounded-full blur-2xl pointer-events-none" />
      </motion.div>


      {/* 2. DISCREPANCY LIST (Only if Tampered) */}
      {!isMatch && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
             <AlertTriangle className="text-rose-500" size={20} />
             <h3 className="text-lg font-bold text-gray-800">Detected Issues ({result.discrepancies.length})</h3>
          </div>

          <div className="space-y-3">
            {result.discrepancies.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + (idx * 0.1) }}
                className="bg-white rounded-lg border-l-4 border-rose-500 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <span className="text-xs font-bold text-rose-500 uppercase tracking-wider bg-rose-50 px-2 py-1 rounded-full">
                    {item.issue || "Mismatch"}
                  </span>
                  <p className="font-bold text-gray-800 mt-2 text-lg">{item.field}</p>
                </div>

                {/* Comparison Visual */}
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">Document Says</p>
                    <p className="font-mono font-bold text-rose-600 bg-rose-100 px-2 py-1 rounded">
                      {String(item.uploaded_value)}
                    </p>
                  </div>
                  <ArrowRight className="text-gray-300" />
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">Official Record</p>
                    <p className="font-mono font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                      {String(item.truth_value)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}


      {/* 3. VERIFIED FIELDS LIST (Always Show) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="text-blue-500" size={20} />
          Verified Data Points
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {result.verified_fields.map((field, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
              <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
              <span className="truncate capitalize">{field.replace(/_/g, ' ')}</span>
            </div>
          ))}
          {result.verified_fields.length === 0 && (
            <p className="text-gray-400 italic">No fields were successfully verified.</p>
          )}
        </div>
      </motion.div>

      {/* 4. ACTION BUTTONS */}
      <div className="mt-8 flex justify-center">
        <button 
          onClick={onReset}
          className="px-8 py-3 bg-gray-900 text-white font-bold rounded-lg shadow-lg hover:bg-gray-800 transition-transform active:scale-95 flex items-center gap-2"
        >
          <FileText size={18} /> Verify Another Document
        </button>
      </div>

    </div>
  );
};