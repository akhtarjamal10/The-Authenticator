// import React from "react";
// import { DocumentAuthenticityForm } from "../components/DocumentAuthenticityForm";

// const DocumentAuthenticityPage: React.FC = () => {
//   return (
//     <div className="min-h-screen bg-gray-100 py-10 px-4">
//       <div className="max-w-3xl mx-auto">
//         <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
//           Document Authenticity Predictor
//         </h1>

//         <DocumentAuthenticityForm />
//       </div>
//     </div>
//   );
// };

// export default DocumentAuthenticityPage;


import React, { useState } from "react";
import { DocumentAuthenticityForm } from "../components/DocumentAuthenticityForm";
import { DocumentComparisonDisplay } from "./DocumentComparisonDisplay";
import { Loader2, ScanLine } from "lucide-react";
import { VerificationResult } from "../types";

const DocumentAuthenticityPage: React.FC = () => {
  // State for managing the view
  const [viewState, setViewState] = useState<'IDLE' | 'SCANNING' | 'RESULT'>('IDLE');
  const [resultData, setResultData] = useState<VerificationResult | null>(null);

  // Called when the form successfully gets a response from the backend
  const handleVerificationComplete = (data: any) => {
    setViewState('SCANNING');
    
    // Simulate a short "Scanning" delay for visual effect (optional but looks cool)
    setTimeout(() => {
      // Backend response from compare_json.py should match VerificationResult interface
      setResultData(data); 
      setViewState('RESULT');
    }, 1500);
  };

  const handleReset = () => {
    setResultData(null);
    setViewState('IDLE');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Header - Only show on Idle or Scanning */}
        {viewState !== 'RESULT' && (
          <div className="text-center mb-10">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
              Document Authenticity Predictor
            </h1>
            <p className="text-gray-500 max-w-lg mx-auto">
              Upload a document to verify its integrity against the official immutable records stored on our Blockchain/Database.
            </p>
          </div>
        )}

        {/* VIEW 1: IDLE (Upload Form) */}
        {viewState === 'IDLE' && (
           <div className="max-w-2xl mx-auto">
              {/* Pass the callback to your existing form */}
              {/* NOTE: You need to update your DocumentAuthenticityForm to accept 'onSuccess' prop */}
              <DocumentAuthenticityForm onSuccess={handleVerificationComplete} />
           </div>
        )}

        {/* VIEW 2: SCANNING (Loading Animation) */}
        {viewState === 'SCANNING' && (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="relative">
                <ScanLine size={64} className="text-blue-500 animate-pulse" />
                <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse"></div>
             </div>
             <h2 className="text-2xl font-bold text-gray-800 mt-6">Analyzing Document Structure...</h2>
             <p className="text-gray-500 mt-2">Cross-referencing with MongoDB records</p>
          </div>
        )}

        {/* VIEW 3: RESULTS (The new display) */}
        {viewState === 'RESULT' && resultData && (
          <DocumentComparisonDisplay 
            result={resultData} 
            onReset={handleReset} 
          />
        )}

      </div>
    </div>
  );
};

export default DocumentAuthenticityPage;