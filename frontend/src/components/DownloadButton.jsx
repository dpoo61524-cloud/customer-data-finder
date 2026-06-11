import React, { useState } from 'react';
import { Download, Loader2, CheckCircle } from 'lucide-react';

const API_BASE_URL = window.location.port === '5173' ? 'http://localhost:8000' : window.location.origin;

export default function DownloadButton({ filename, searchTerm }) {
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;
    
    setDownloading(true);
    setSuccess(false);

    try {
      const url = `${API_BASE_URL}/download/${filename}/${encodeURIComponent(searchTerm)}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Unable to download file. It may have expired. Please search again.");
      }

      // Convert to blob and download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Filename from search term
      link.setAttribute('download', `${searchTerm}_result.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Reset success icon after 3s
    } catch (err) {
      alert(err.message || "Failed to download the results. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex justify-center pt-2">
      <button
        onClick={handleDownload}
        disabled={downloading}
        className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 shadow-lg cursor-pointer active:scale-98
          ${downloading 
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
            : success 
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20' 
              : 'bg-primary-600 hover:bg-primary-700 text-white hover:-translate-y-0.5 shadow-primary-500/30'
          }
        `}
      >
        {downloading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Styled Excel File...
          </>
        ) : success ? (
          <>
            <CheckCircle className="w-5 h-5 animate-bounce" />
            Downloaded Successfully!
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            Download Results Excel
          </>
        )}
      </button>
    </div>
  );
}
