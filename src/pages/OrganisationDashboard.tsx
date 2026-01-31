// import React, { useEffect, useState } from "react";
// import { Clock, FileUp, Loader2 } from "lucide-react";
// import { api } from "../services/api";

// interface OrganisationDashboardProps {
//   organisationId?: string;
// }

// export const OrganisationDashboard: React.FC<OrganisationDashboardProps> = ({
//   organisationId,
// }) => {
//   const [uploads, setUploads] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [file, setFile] = useState<File | null>(null);
//   const [uploading, setUploading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // Fetch upload history
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);

//       if (organisationId) {
//         const data = await api.getOrganisationUploads(organisationId);
//         setUploads(data);
//       }

//       setLoading(false);
//     };

//     if (organisationId) fetchData();
//     else setLoading(false);
//   }, [organisationId]);

//   // Handle file upload
//   const handleUpload = async () => {
//     if (!file || !organisationId) return;

//     setError("");
//     setSuccess("");
//     setUploading(true);

//     try {
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("organisationId", organisationId);


//       setSuccess("Document uploaded successfully!");
//       setFile(null);

//       // Refresh table
//       const refreshed = await api.getOrganisationUploads(organisationId);
//       setUploads(refreshed);
//     } catch (err: any) {
//       setError(err.message || "Upload failed");
//     } finally {
//       setUploading(false);
//     }
//   };

//   if (loading)
//     return (
//       <div className="flex justify-center py-20">
//         <Loader2 className="animate-spin text-gov-blue" />
//       </div>
//     );

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       {/* Header */}
//       <div className="mb-8 flex justify-between items-end">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 font-serif">
//             Organisation Dashboard
//           </h1>
//           <p className="text-sm text-gray-500">
//             Upload and track your verification document submissions.
//           </p>
//         </div>
//       </div>

//       {/* Upload Box */}
//       <div className="bg-white p-6 rounded-lg shadow mb-10">
//         <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
//           <FileUp size={18} /> Upload Document for Verification
//         </h3>

//         {error && (
//           <div className="bg-red-50 text-red-600 p-3 rounded mb-3">{error}</div>
//         )}
//         {success && (
//           <div className="bg-green-50 text-green-600 p-3 rounded mb-3">
//             {success}
//           </div>
//         )}

//         <div className="flex items-center gap-4">
//           <input
//             type="file"
//             onChange={(e) => setFile(e.target.files?.[0] || null)}
//             className="border rounded p-2"
//           />

//           <button
//             disabled={uploading || !file}
//             onClick={handleUpload}
//             className="bg-gov-blue text-white px-6 py-2 rounded shadow font-semibold flex items-center gap-2 disabled:opacity-60"
//           >
//             {uploading ? (
//               <Loader2 className="animate-spin" />
//             ) : (
//               <>
//                 <FileUp size={18} /> Upload
//               </>
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Upload History */}
//       <div className="bg-white rounded shadow overflow-hidden">
//         <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
//           <h3 className="font-bold text-gray-700 flex items-center gap-2">
//             <Clock size={18} /> Upload History
//           </h3>
//         </div>

//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                 Upload ID
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                 File Name
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                 Status
//               </th>
//             </tr>
//           </thead>

//           <tbody className="bg-white divide-y divide-gray-200">
//             {uploads.map((u) => (
//               <tr key={u.id}>
//                 <td className="px-6 py-4 text-sm font-mono text-gray-900">
//                   {u.id}
//                 </td>
//                 <td className="px-6 py-4 text-sm text-gray-500">
//                   {u.fileName}
//                 </td>
//                 <td className="px-6 py-4">
//                   <span className="px-2 py-1 text-xs font-bold rounded bg-yellow-100 text-yellow-800">
//                     {u.status}
//                   </span>
//                 </td>
//               </tr>
//             ))}

//             {uploads.length === 0 && (
//               <tr>
//                 <td
//                   colSpan={3}
//                   className="px-6 py-8 text-center text-gray-500"
//                 >
//                   No uploads found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };
// src/pages/OrganisationDashboard.tsx

import React, { useEffect, useState } from 'react';
import { 
  FileText, CheckCircle, XCircle, Clock, Loader2, RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';
import axios from 'axios';

// ✅ Updated Interface to match your JSON structure
interface QueueItem {
  id: string;
  fileName: string;
  fileUrl?: string; // Make optional as it wasn't in your snippet (CHECK THIS!)
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: any;
  userId: string;
  type: string;
}

export const OrganisationDashboard: React.FC = () => {
  const [pendingDocs, setPendingDocs] = useState<QueueItem[]>([]);
  const [pastLogs, setPastLogs] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Pending
      const pending = await api.getPendingVerifications();
      setPendingDocs(pending as QueueItem[]);

      // 2. Fetch History
      const history = await api.getVerificationHistory();
      setPastLogs(history as QueueItem[]);
      
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doc: QueueItem) => {
    if (!doc.fileUrl && !doc.fileName) { // Basic safety check
       alert("Error: File URL missing from database record.");
       return;
    }
    
    // Fallback: If fileUrl is missing in DB, try to construct it or ask user
    // ideally your upload logic should save 'fileUrl'
    const targetUrl = doc.fileUrl; 

    if (!targetUrl) {
       alert("Cannot process: Document URL not found in database.");
       return;
    }

    if (!confirm(`Are you sure you want to approve "${doc.fileName}"?`)) return;

    setProcessingId(doc.id);
    try {
      // Call the Python processing API
      await api.processAndApproveDocument(targetUrl, doc.id);
      
      alert("Document Approved & Processed Successfully!");
      fetchData(); // Refresh lists
      try {
        console.log("Approving:", doc.fileName);
    
        // This hits your /uploadMongo route
        const response = await axios.post('http://127.0.0.1:8000/uploadMongo', {
          filename: doc.fileName
        });
    
        if (response.data.status === 'success') {
          alert("✅ Document Approved & Saved to Database!");
          // Optionally refresh the list here
        } else {
          alert("⚠️ Approval failed: " + response.data.error);
        }
    
      } catch (error) {
        console.error("Approval Error:", error);
        alert("❌ Server Error during approval.");
      }
    } catch (error: any) {
      alert(`Approval Failed: ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">
             Verification Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Manage incoming verification requests.</p>
        </div>
        <button 
          onClick={fetchData} 
          className="flex items-center gap-2 text-sm text-blue-600 hover:bg-blue-50 px-3 py-2 rounded"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: PENDING */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-orange-100/50 p-4 border-b border-orange-200">
            <h2 className="font-bold text-orange-800 flex items-center gap-2">
              <Clock size={20} /> Pending Queue ({pendingDocs.length})
            </h2>
          </div>

          <div className="p-4 space-y-4">
            {loading ? <div className="text-center py-4">Loading...</div> : 
             pendingDocs.length === 0 ? <div className="text-center py-8 text-gray-500 italic">Queue is empty.</div> :
             (
              pendingDocs.map((doc) => (
                <div key={doc.id} className="bg-white p-4 rounded-lg shadow-sm border border-orange-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 p-2 rounded">
                        <FileText className="text-orange-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{doc.fileName}</h3>
                        <p className="text-xs text-gray-500">User ID: {doc.userId}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    {doc.fileUrl && (
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer"
                        className="flex-1 text-center py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded border">
                        View PDF
                      </a>
                    )}
                    
                    <button
                      onClick={() => handleApprove(doc)}
                      disabled={!!processingId}
                      className="flex-[2] py-2 text-sm font-bold text-white bg-gov-blue hover:bg-blue-700 rounded shadow-sm flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                      {processingId === doc.id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                      {processingId === doc.id ? "Processing..." : "Approve"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: HISTORY */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <h2 className="font-bold text-gray-700 flex items-center gap-2">
              <CheckCircle size={20} /> Verification History
            </h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
             {pastLogs.map((doc) => (
                <div key={doc.id} className="p-4 flex justify-between items-center">
                  <span className="text-sm font-medium">{doc.fileName}</span>
                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                    doc.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {doc.status}
                  </span>
                </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
};