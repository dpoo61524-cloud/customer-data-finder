import React, { useState } from 'react';
import { FileSpreadsheet, Search, CheckCircle2, ChevronRight, RefreshCw, Sparkles } from 'lucide-react';
import FileUpload from './components/FileUpload';
import SearchPanel from './components/SearchPanel';
import ResultsTable from './components/ResultsTable';
import DownloadButton from './components/DownloadButton';

export default function App() {
  const [fileMeta, setFileMeta] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);

  const handleUploadSuccess = (meta) => {
    setFileMeta(meta);
    setSearchResults(null);
    setSearchTerm('');
  };

  const handleReset = () => {
    setFileMeta(null);
    setSearchResults(null);
    setSearchTerm('');
    setSearching(false);
  };

  const handleSearchStart = () => {
    setSearching(true);
    setSearchResults(null);
  };

  const handleSearchSuccess = (results, term) => {
    setSearchResults(results);
    setSearchTerm(term);
    setSearching(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Premium Gradient Header */}
      <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-md relative overflow-hidden shrink-0">
        {/* Subtle background glow pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_40%)] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md text-white rounded-xl flex items-center justify-center border border-white/10 shadow-inner">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                Customer Data Finder
                <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-500/30 border border-indigo-400/30 text-[10px] uppercase font-bold tracking-widest rounded-full text-indigo-200">
                  <Sparkles className="w-2.5 h-2.5" /> v1.0
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100/80 font-medium mt-0.5">
                Upload spreadsheets, search across sheets, and export custom styled results.
              </p>
            </div>
          </div>
          
          {fileMeta && (
            <button
              onClick={handleReset}
              className="self-start md:self-auto px-4 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-inner"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Workspace
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        
        {/* Step 1: File Upload */}
        <section className="space-y-3">
          {!fileMeta && (
            <div className="max-w-2xl mx-auto mb-6 bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-blue-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs leading-relaxed">
                <p className="font-bold mb-0.5">Welcome!</p>
                Get started by uploading an Excel workbook (.xlsx). The app will automatically map out the worksheets and search across all sheets and columns simultaneously.
              </div>
            </div>
          )}
          <FileUpload onUploadSuccess={handleUploadSuccess} onReset={handleReset} />
        </section>

        {/* Step 2: Search Configuration */}
        {fileMeta && (
          <div className="animate-[slide-up_0.3s_ease-out] space-y-6">
            <SearchPanel 
              filename={fileMeta.filename} 
              onSearchStart={handleSearchStart}
              onSearchSuccess={handleSearchSuccess} 
            />
          </div>
        )}

        {/* Step 3: Search Results Preview & Action */}
        {(searching || searchResults) && (
          <section className="space-y-6 border-t border-slate-200/80 pt-8 animate-[fade-in_0.4s_ease-out]">
            <div className="max-w-4xl mx-auto flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-50 text-primary-600 text-xs font-bold">3</span>
              <h3 className="text-base font-bold text-slate-800">
                Results & Export
              </h3>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-400">
                {searching ? 'Processing request' : `Found ${searchResults?.total_matches || 0} matches`}
              </span>
            </div>

            {searching ? (
              <div className="py-20 flex flex-col items-center justify-center max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin" />
                  <Search className="w-5 h-5 text-primary-600 absolute inset-0 m-auto animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-slate-700 mt-4">Searching sheets...</h4>
                <p className="text-xs text-slate-400 mt-1">Filtering data and generating your downloadable report</p>
              </div>
            ) : (
              <>
                <ResultsTable results={searchResults} searchTerm={searchTerm} />
                
                {searchResults && searchResults.total_matches > 0 && (
                  <DownloadButton filename={fileMeta.filename} searchTerm={searchTerm} />
                )}
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
