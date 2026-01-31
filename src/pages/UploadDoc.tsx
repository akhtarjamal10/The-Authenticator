// import React, { useState, ChangeEvent } from 'react';
// import './UploadDoc.css';
// import { CloudCog } from 'lucide-react';

// // 1. Define an interface for the object returned by your backend
// // Based on your code: src={fileData.path}
// interface UploadedFileData {
//   path: string;
//   [key: string]: any; // Allows for other properties like filename, public_id, etc.
// }

// // 2. Define a type for your status to prevent typos
// type UploadStatus = "idle" | "uploading" | "success" | "error";

// function UploadDoc() {
//   // 3. Explicitly type the useState hooks
//   const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
//   const [status, setStatus] = useState<UploadStatus>("idle");
//   const [uploadedUrls, setUploadedUrls] = useState<UploadedFileData[]>([]);

//   // 4. Handle File Selection
//   // We use React.ChangeEvent<HTMLInputElement> for file inputs
//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const files = Array.from(e.target.files);
//       setSelectedFiles(files);
//       setStatus("idle");
//     }
//   };

//   // 5. Handle Upload
//   const handleUpload = async () => {
//     if (selectedFiles.length === 0) {
//       alert("Please select files first!");
//       return;
//     }

//     setStatus("uploading");
//     const formData = new FormData();

//     selectedFiles.forEach((file) => {
//       formData.append("files", file);
//     });

//     try {
//       const response = await fetch("http://localhost:5000/upload", {
//         method: "POST",
//         body: formData,
//       });

//       const result = await response.json();

//       if (response.ok) {
//         setStatus("success");
//         // Assuming result.data matches the UploadedFileData interface
//         setUploadedUrls(result.data); 
//         try {
//           const mongo = await fetch("http://127.0.0.1:8000/uploadMongo", {
//             method: "GET",
//           });
          
//         } catch (error) {
//           console.log(error);
//         }
        
//       } else {
//         setStatus("error");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       setStatus("error");
//     }
//   };

//   return (
//     <div className="app-container">
//       <div className="upload-card" style={{ width: '450px' }}>
//         <h2>Upload pdf file</h2>
        
//         <div className="file-input-wrapper">
//           <input 
//             type="file" 
//             multiple 
//             onChange={handleFileChange} 
//           />
//         </div>

//         {/* List of selected files to upload */}
//         {selectedFiles.length > 0 && (
//           <div className="file-info">
//             <p><strong>Selected Files ({selectedFiles.length}):</strong></p>
//             <ul style={{textAlign:'left', paddingLeft:'20px'}}>
//               {selectedFiles.map((file, index) => (
//                 <li key={index}>{file.name}</li>
//               ))}
//             </ul>
//           </div>
//         )}

//         <button 
//           onClick={handleUpload} 
//           disabled={status === "uploading"}
//           className="upload-btn"
//         >
//           {status === "uploading" ? "Uploading..." : "Upload"}
//         </button>

//         {status === "success" && (
//           <div className="success-msg">
//             <p>✅ Upload successful!</p>
//             {/* Display uploaded images */}
//             <div style={{display: 'flex', gap: '10px', flexWrap:'wrap', marginTop: '10px'}}>
//               {uploadedUrls.map((fileData, index) => (
//                  <img 
//                    key={index} 
//                    src={fileData.path} 
//                    alt="uploaded" 
//                    style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px'}}
//                  />
//               ))}
//             </div>
//           </div>
//         )}
        
//         {status === "error" && <p className="error-msg">❌ Upload failed.</p>}
//       </div>
//     </div>
//   );
// }

// export default UploadDoc;

import React, { useState } from 'react';
import { api } from '../services/api';
import { UploadCloud, FileText, Loader2, X } from 'lucide-react';

// ✅ THIS INTERFACE FIXES YOUR ERROR
interface Props {
  organisationId: string; 
  onUploadSuccess?: () => void;
}

export const UploadDoc: React.FC<Props> = ({ organisationId, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first.");
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      // We pass "GLOBAL" or the ID provided to the API
      formData.append("organisationId", organisationId); 

      await api.uploadOrganisationDocument(formData); 

      alert("Upload Successful! Sent for verification.");
      setFile(null);
      if (onUploadSuccess) onUploadSuccess();
      
    } catch (error: any) {
      console.error("Upload Error:", error);
      alert(`Upload Failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
        <UploadCloud className="text-gov-blue" /> Upload Document
      </h3>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
        {!file ? (
          <>
            <input 
              type="file" 
              id="fileInput"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
              className="hidden"
            />
            <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
              <UploadCloud size={32} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Click to upload PDF</span>
              <span className="text-xs text-gray-400 mt-1">(Max size: 5MB)</span>
            </label>
          </>
        ) : (
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded">
            <div className="flex items-center gap-2 overflow-hidden">
              <FileText size={20} className="text-blue-600 flex-shrink-0" />
              <span className="text-sm truncate text-blue-900">{file.name}</span>
            </div>
            <button onClick={() => setFile(null)} className="text-gray-500 hover:text-red-500">
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      <button 
        onClick={handleUpload} 
        disabled={uploading || !file}
        className="w-full mt-4 bg-gov-blue text-white py-2 rounded font-medium shadow-sm hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      >
        {uploading ? <Loader2 className="animate-spin" size={18} /> : "Submit for Verification"}
      </button>
    </div>
  );
};