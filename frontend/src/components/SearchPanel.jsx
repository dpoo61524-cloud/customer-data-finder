import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

const API_BASE_URL = window.location.port === '5173' ? 'http://localhost:8000' : window.location.origin;

export default function SearchPanel({ filename, onSearchSuccess, onSearchStart }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setError("Please enter a customer ID, name, or search value.");
      return;
    }

    setError(null);
    setLoading(true);
    onSearchStart();

    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: filename,
          search_term: searchTerm.trim()
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Search failed");
      }

      const data = await response.json();
      onSearchSuccess(data, searchTerm.trim());
    } catch (err) {
      setError(err.message || "An error occurred during search.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-50 text-primary-600 text-xs font-bold">2</span>
        Search Workbook
      </h3>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="search-term" className="text-xs font-semibold text-slate-500 mb-1.5">
            Enter Customer Name, ID, or value to search across all columns
          </label>
          <div className="relative">
            <input
              id="search-term"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. Imran Alam, John Doe, C-8492"
              className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 text-sm rounded-xl pl-4 pr-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg animate-pulse">
            {error}
          </p>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`w-full md:w-auto px-6 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-primary-500/20 active:scale-98 transition-all
              ${loading ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 hover:shadow-md hover:shadow-primary-500/30'}
            `}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching all columns...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search Workbook
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
