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

// import React from 'react';
// import { motion } from 'framer-motion';
// import { 
//   CheckCircle, 
//   AlertTriangle, 
//   FileText, 
//   ArrowRight, 
//   ShieldCheck, 
//   XOctagon 
// } from 'lucide-react';
// import { VerificationResult } from '../types';

// interface Props {
//   result: VerificationResult;
//   onReset: () => void;
// }

// export const DocumentComparisonDisplay: React.FC<Props> = ({ result, onReset }) => {
//   const isMatch = result.status === "MATCH";
//   const scoreColor = isMatch ? "text-emerald-600" : "text-rose-600";
//   const bgColor = isMatch ? "bg-emerald-50" : "bg-rose-50";
//   const borderColor = isMatch ? "border-emerald-200" : "border-rose-200";

//   return (
//     <div className="max-w-4xl mx-auto w-full">
      
//       {/* 1. HEADER CARD (Score & Status) */}
//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className={`relative overflow-hidden rounded-2xl border-2 ${borderColor} ${bgColor} p-8 mb-8 shadow-sm`}
//       >
//         <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          
//           {/* Status Icon & Text */}
//           <div className="flex items-center gap-5">
//             <div className={`p-4 rounded-full bg-white shadow-sm ${scoreColor}`}>
//               {isMatch ? <ShieldCheck size={48} /> : <XOctagon size={48} />}
//             </div>
//             <div>
//               <h2 className={`text-3xl font-bold ${scoreColor} tracking-tight`}>
//                 {isMatch ? "Authentic Document" : "Tampering Detected"}
//               </h2>
//               <p className="text-gray-600 mt-1 font-medium">
//                 {isMatch 
//                   ? "All data points match the university records." 
//                   : "Discrepancies found between document and database."}
//               </p>
//             </div>
//           </div>

//           {/* Score Counter */}
//           <div className="text-center bg-white/80 p-4 rounded-xl backdrop-blur-sm border border-gray-100 shadow-sm min-w-[140px]">
//             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Trust Score</span>
//             <div className={`text-5xl font-black ${scoreColor}`}>
//               {result.score}%
//             </div>
//           </div>
//         </div>

//         {/* Background Decorative Pattern */}
//         <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-current opacity-5 rounded-full blur-2xl pointer-events-none" />
//       </motion.div>


//       {/* 2. DISCREPANCY LIST (Only if Tampered) */}
//       {!isMatch && (
//         <motion.div 
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.3 }}
//           className="mb-8"
//         >
//           <div className="flex items-center gap-2 mb-4">
//              <AlertTriangle className="text-rose-500" size={20} />
//              <h3 className="text-lg font-bold text-gray-800">Detected Issues ({result.discrepancies.length})</h3>
//           </div>

//           <div className="space-y-3">
//             {result.discrepancies.map((item, idx) => (
//               <motion.div 
//                 key={idx}
//                 initial={{ x: -20, opacity: 0 }}
//                 animate={{ x: 0, opacity: 1 }}
//                 transition={{ delay: 0.4 + (idx * 0.1) }}
//                 className="bg-white rounded-lg border-l-4 border-rose-500 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
//               >
//                 <div className="flex-1">
//                   <span className="text-xs font-bold text-rose-500 uppercase tracking-wider bg-rose-50 px-2 py-1 rounded-full">
//                     {item.issue || "Mismatch"}
//                   </span>
//                   <p className="font-bold text-gray-800 mt-2 text-lg">{item.field}</p>
//                 </div>

//                 {/* Comparison Visual */}
//                 <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
//                   <div className="text-center">
//                     <p className="text-xs text-gray-400 mb-1">Document Says</p>
//                     <p className="font-mono font-bold text-rose-600 bg-rose-100 px-2 py-1 rounded">
//                       {String(item.uploaded_value)}
//                     </p>
//                   </div>
//                   <ArrowRight className="text-gray-300" />
//                   <div className="text-center">
//                     <p className="text-xs text-gray-400 mb-1">Official Record</p>
//                     <p className="font-mono font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
//                       {String(item.truth_value)}
//                     </p>
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </motion.div>
//       )}


//       {/* 3. VERIFIED FIELDS LIST (Always Show) */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.6 }}
//         className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
//       >
//         <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//           <FileText className="text-blue-500" size={20} />
//           Verified Data Points
//         </h3>
        
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
//           {result.verified_fields.map((field, idx) => (
//             <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
//               <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
//               <span className="truncate capitalize">{field.replace(/_/g, ' ')}</span>
//             </div>
//           ))}
//           {result.verified_fields.length === 0 && (
//             <p className="text-gray-400 italic">No fields were successfully verified.</p>
//           )}
//         </div>
//       </motion.div>

//       {/* 4. ACTION BUTTONS */}
//       <div className="mt-8 flex justify-center">
//         <button 
//           onClick={onReset}
//           className="px-8 py-3 bg-gray-900 text-white font-bold rounded-lg shadow-lg hover:bg-gray-800 transition-transform active:scale-95 flex items-center gap-2"
//         >
//           <FileText size={18} /> Verify Another Document
//         </button>
//       </div>

//     </div>
//   );
// };

// import React from 'react';
// import { CheckCircle, XCircle, AlertTriangle, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';

// // ✅ 1. Update the Interface to accept the new props
// interface DocumentComparisonDisplayProps {
//   file1: any; // User Uploaded Data
//   file2: any; // Original MongoDB Data
//   diff: any;  // The differences object
//   onComplete?: () => void;
//   resetFlow?: () => void;
// }

// export const DocumentComparisonDisplay: React.FC<DocumentComparisonDisplayProps> = ({ 
//   file1, 
//   file2, 
//   diff, 
//   onComplete,
//   resetFlow 
// }) => {

//   // Logic to determine if valid: If "diff" is empty (or just has meta changes), it's valid.
//   // Adjust this logic based on how strict you want to be.
//   const hasDifferences = diff && Object.keys(diff).length > 0;
//   const isAuthentic = !hasDifferences;

//   return (
//     <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      
//       {/* Header Section */}
//       <div className={`p-8 text-center ${isAuthentic ? 'bg-green-50' : 'bg-red-50'}`}>
//         <div className="flex justify-center mb-4">
//           {isAuthentic ? (
//             <div className="bg-white p-4 rounded-full shadow-sm">
//               <ShieldCheck size={64} className="text-green-600" />
//             </div>
//           ) : (
//             <div className="bg-white p-4 rounded-full shadow-sm">
//               <ShieldAlert size={64} className="text-red-600" />
//             </div>
//           )}
//         </div>
        
//         <h2 className={`text-3xl font-bold mb-2 ${isAuthentic ? 'text-green-800' : 'text-red-800'}`}>
//           {isAuthentic ? 'Authenticity Verified' : 'Discrepancy Detected'}
//         </h2>
        
//         <p className={`text-lg ${isAuthentic ? 'text-green-700' : 'text-red-700'}`}>
//           {isAuthentic 
//             ? 'The uploaded document matches the official university records perfectly.' 
//             : 'The uploaded document differs from the official university records.'}
//         </p>
//       </div>

//       {/* Comparison Details Table */}
//       <div className="p-8">
//         {!isAuthentic && (
//           <div className="mb-8">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//               <AlertTriangle className="text-amber-500 mr-2" />
//               Detected Alterations
//             </h3>
            
//             <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
//               <table className="w-full text-left border-collapse">
//                 <thead>
//                   <tr className="bg-gray-100 border-b border-gray-200 text-sm uppercase text-gray-500">
//                     <th className="p-4 font-medium">Field</th>
//                     <th className="p-4 font-medium text-red-600">Uploaded (Fake?)</th>
//                     <th className="p-4 font-medium text-green-600">Official Record</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {/* Iterate over the diff object to show changes */}
//                   {Object.entries(diff).map(([key, value]: [string, any]) => (
//                     <tr key={key} className="hover:bg-white transition-colors">
//                       <td className="p-4 font-mono text-sm font-semibold text-gray-700">
//                         {key.replace('root', '').replace(/\['/g, ' ').replace(/'\]/g, '')}
//                       </td>
//                       <td className="p-4 bg-red-50 text-red-700 font-medium">
//                         {/* Handle cases where value might be complex object */}
//                         {typeof value.old_value === 'object' ? JSON.stringify(value.old_value) : String(value.old_value)}
//                       </td>
//                       <td className="p-4 bg-green-50 text-green-700 font-medium">
//                          {typeof value.new_value === 'object' ? JSON.stringify(value.new_value) : String(value.new_value)}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* Metadata Section (Optional Display of Roll No, etc) */}
//         <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600 border-t pt-6">
//           <div>
//              <span className="block font-semibold text-gray-400 uppercase text-xs">University</span>
//              {file2?.marksheet?.university_name || file1?.marksheet?.university_name || "N/A"}
//           </div>
//           <div className="text-right">
//              <span className="block font-semibold text-gray-400 uppercase text-xs">Roll Number</span>
//              {file2?.marksheet?.rollNo || file1?.marksheet?.rollNo || "N/A"}
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="mt-8 flex justify-center space-x-4">
//           <button 
//             onClick={resetFlow}
//             className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
//           >
//             Scan Another
//           </button>
          
//           {onComplete && (
//             <button 
//               onClick={onComplete}
//               className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center"
//             >
//               Finish Verification <ArrowRight size={16} className="ml-2" />
//             </button>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// };

import React, { useState } from 'react';
import { 
  AlertTriangle, ArrowRight, ShieldCheck, ShieldAlert, 
  FileText, Database, Check, X, ChevronDown, ChevronUp 
} from 'lucide-react';

interface DocumentComparisonDisplayProps {
  file1: any; // User Uploaded Data
  file2: any; // Official MongoDB Data
  diff: any;  // DeepDiff Result
  onComplete?: () => void;
  resetFlow?: () => void;
}

export const DocumentComparisonDisplay: React.FC<DocumentComparisonDisplayProps> = ({ 
  file1, 
  file2, 
  diff, 
  onComplete,
  resetFlow 
}) => {
  const [showRaw, setShowRaw] = useState(false);

  // 1. Determine Status
  const isAuthentic = !diff || Object.keys(diff).length === 0;

  // 2. Define the fields we ALWAYS want to compare visually
  // This is your "Visual Proof"
  const getComparisonRows = () => {
    // Helper to safely dig into the nested JSON structure
    const getVal = (obj: any, path: string[]) => {
      let current = obj?.marksheet;
      for (const key of path) {
        if (!current) return "N/A";
        current = current[key];
      }
      return current || "N/A";
    };

    const fields = [
      { label: "Student Name", path: ["student_info", "name"] },
      { label: "Roll Number", path: ["student_info", "roll_no"] },
      { label: "Course", path: ["academic_info", "course"] },
      { label: "Semester", path: ["academic_info", "semester"] },
      { label: "CGPA", path: ["academic_info", "cgpa"] },
      { label: "Result Status", path: ["academic_info", "result_status"] },
      { label: "University", path: ["university"] },
    ];

    return fields.map(field => {
      const uploadVal = getVal(file1, field.path);
      const dbVal = getVal(file2, field.path);
      
      // Strict equality check for visual feedback
      // We convert to string to handle number vs string mismatches visually
      const isMatch = String(uploadVal).trim().toLowerCase() === String(dbVal).trim().toLowerCase();
      
      return {
        label: field.label,
        uploadVal,
        dbVal,
        isMatch
      };
    });
  };

  const comparisonRows = getComparisonRows();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- HEADER: STATUS BANNER --- */}
      <div className={`p-8 text-center ${isAuthentic ? 'bg-green-50' : 'bg-red-50'}`}>
        <div className="flex justify-center mb-4">
          {isAuthentic ? (
            <div className="bg-white p-4 rounded-full shadow-sm ring-4 ring-green-100">
              <ShieldCheck size={64} className="text-green-600" />
            </div>
          ) : (
            <div className="bg-white p-4 rounded-full shadow-sm ring-4 ring-red-100">
              <ShieldAlert size={64} className="text-red-600" />
            </div>
          )}
        </div>
        
        <h2 className={`text-3xl font-bold mb-2 ${isAuthentic ? 'text-green-800' : 'text-red-800'}`}>
          {isAuthentic ? 'Authenticity Verified' : 'Discrepancy Detected'}
        </h2>
        <p className={`text-lg ${isAuthentic ? 'text-green-700' : 'text-red-700'}`}>
          {isAuthentic 
            ? 'Success! The data in the uploaded document perfectly matches the official university ledger.' 
            : 'Warning! The uploaded document contains data that conflicts with the official university ledger.'}
        </p>
      </div>

      <div className="p-8">
        
        {/* --- SECTION: VISUAL PROOF TABLE --- */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Database className="text-blue-600 mr-2" size={20} />
            Ledger Comparison Proof
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Side-by-side comparison of the document you uploaded vs. the immutable record in the database.
          </p>
          
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 tracking-wider">
                  <th className="p-4 font-medium w-1/4">Data Field</th>
                  <th className="p-4 font-medium text-gray-700 w-1/3">
                      <div className="flex items-center"><FileText size={14} className="mr-1"/> Uploaded File</div>
                  </th>
                  <th className="p-4 font-medium text-blue-800 w-1/3">
                      <div className="flex items-center"><Database size={14} className="mr-1"/> Official DB Record</div>
                  </th>
                  <th className="p-4 font-medium text-center w-16">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comparisonRows.map((row, index) => (
                  <tr key={index} className={`transition-colors ${row.isMatch ? 'hover:bg-gray-50' : 'bg-red-50 hover:bg-red-100'}`}>
                    <td className="p-3 text-sm font-semibold text-gray-700">
                      {row.label}
                    </td>
                    <td className="p-3 text-sm font-mono text-gray-600 break-all">
                      {String(row.uploadVal)}
                    </td>
                    <td className="p-3 text-sm font-mono text-blue-700 font-medium break-all">
                      {String(row.dbVal)}
                    </td>
                    <td className="p-3 text-center">
                      {row.isMatch ? (
                        <Check size={20} className="text-green-500 mx-auto" />
                      ) : (
                        <X size={20} className="text-red-500 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- SECTION: DEBUG / RAW JSON TOGGLE --- */}
        <div className="mt-6 border-t pt-4">
            <button 
                onClick={() => setShowRaw(!showRaw)}
                className="w-full py-2 flex items-center justify-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
                {showRaw ? "Hide Raw JSON Data" : "View Raw JSON Data (Developer Mode)"}
                {showRaw ? <ChevronUp size={12} className="ml-1"/> : <ChevronDown size={12} className="ml-1"/>}
            </button>
            
            {showRaw && (
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                        <span className="text-xs font-bold text-gray-500">Uploaded JSON</span>
                        <pre className="p-3 bg-gray-900 text-yellow-400 text-[10px] rounded h-64 overflow-auto">
                            {JSON.stringify(file1, null, 2)}
                        </pre>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-gray-500">Database JSON</span>
                        <pre className="p-3 bg-gray-900 text-green-400 text-[10px] rounded h-64 overflow-auto">
                            {JSON.stringify(file2, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>

        {/* --- BUTTONS --- */}
        <div className="mt-8 flex justify-center space-x-4">
          <button 
            onClick={resetFlow}
            className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Scan Another
          </button>
          
          {onComplete && (
            <button 
              onClick={onComplete}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-lg"
            >
              Finish Verification <ArrowRight size={16} className="ml-2" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};