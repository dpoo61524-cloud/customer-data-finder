import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const API_BASE_URL = window.location.port === '5173' ? 'http://localhost:8000' : window.location.origin;

export default function FileUpload({ onUploadSuccess, onReset }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadMeta, setUploadMeta] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      await processFile(droppedFile);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (selectedFile) => {
    if (!selectedFile.name.endsWith('.xlsx')) {
      setError("Only .xlsx Excel files are supported.");
      setFile(null);
      setUploadMeta(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to upload file");
      }

      const data = await response.json();
      setUploadMeta(data);
      onUploadSuccess(data);
    } catch (err) {
      setError(err.message || "An error occurred during file upload.");
      setFile(null);
      setUploadMeta(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaClick = () => {
    if (!loading && !uploadMeta) {
      fileInputRef.current.click();
    }
  };

  const handleReset = () => {
    setFile(null);
    setError(null);
    setUploadMeta(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onReset();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleAreaClick}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer overflow-hidden
          ${isDragActive ? 'border-primary-500 bg-primary-50/50 scale-[1.01]' : 'border-slate-200 bg-white hover:border-primary-400 hover:shadow-lg'}
          ${uploadMeta ? 'border-emerald-200 bg-emerald-50/10 cursor-default' : ''}
          ${loading ? 'cursor-not-allowed bg-slate-50/50' : ''}
        `}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".xlsx" 
          onChange={handleFileChange} 
          className="hidden"
          disabled={loading || !!uploadMeta}
        />

        {/* Pulse glow background effect */}
        {isDragActive && (
          <div className="absolute inset-0 bg-primary-100/20 pulse-glow pointer-events-none" />
        )}

        <div className="relative z-10 flex flex-col items-center justify-center">
          {!file && !loading && !uploadMeta && (
            <>
              <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                Upload your Excel file
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Drag and drop your <span className="font-medium text-slate-700">.xlsx</span> file here, or click to browse
              </p>
              <div className="text-xs text-slate-400">
                Supports spreadsheets with single or multiple sheets
              </div>
            </>
          )}

          {loading && (
            <div className="py-6 flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
              <p className="text-sm font-medium text-slate-600">Uploading and parsing file...</p>
              <p className="text-xs text-slate-400 mt-1">Reading worksheets and column metadata</p>
            </div>
          )}

          {uploadMeta && (
            <div className="w-full text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">
                      {file?.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Successfully uploaded • {uploadMeta.sheets.length} sheet{uploadMeta.sheets.length !== 1 ? 's' : ''} detected
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                >
                  Change File
                </button>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Worksheets Found
                </span>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                  {uploadMeta.sheets.map((sheet, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-200/50 transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                      {sheet}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-sm font-semibold">Upload Failed</h5>
            <p className="text-xs mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
