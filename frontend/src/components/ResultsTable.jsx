import React from 'react';
import { Layers, FileSpreadsheet, Eye, Info } from 'lucide-react';

export default function ResultsTable({ results, searchTerm }) {
  if (!results) return null;

  const { total_matches, sheets_matched, preview_rows } = results;

  if (total_matches === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <Info className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-800">No results matched</h4>
        <p className="text-sm text-slate-500 mt-1">
          No records found matching <span className="font-semibold text-slate-700">"{searchTerm}"</span>.
        </p>
      </div>
    );
  }

  // Get headers from preview rows. Wait, exclude "Source Sheet" to place it first.
  const allHeaders = preview_rows.length > 0 ? Object.keys(preview_rows[0]) : [];
  
  // Reorder headers to put "Source Sheet" at the start
  const reorderedHeaders = allHeaders.filter(h => h !== 'Source Sheet');
  if (allHeaders.includes('Source Sheet')) {
    reorderedHeaders.unshift('Source Sheet');
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Search statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Matches card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Total Matched Records
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-slate-800">{total_matches}</span>
              <span className="text-xs text-slate-500">row{total_matches !== 1 ? 's' : ''} across file</span>
            </div>
          </div>
        </div>

        {/* Sheets Matched card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Worksheets with Matches ({sheets_matched.length})
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5 max-h-12 overflow-y-auto custom-scrollbar">
              {sheets_matched.map((sheet, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-100 rounded-md truncate max-w-[120px]"
                >
                  {sheet}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-slate-500" />
            <h4 className="text-sm font-bold text-slate-800">
              Preview Results
            </h4>
            <span className="text-xs text-slate-500">
              (showing first {Math.min(50, preview_rows.length)} matches)
            </span>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar max-h-96">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10">
                {reorderedHeaders.map((header, idx) => (
                  <th 
                    key={idx} 
                    className={`px-5 py-3.5 ${header === 'Source Sheet' ? 'sticky left-0 bg-slate-50 border-r border-slate-100' : ''}`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm font-medium">
              {preview_rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-50/40 transition-colors">
                  {reorderedHeaders.map((header, colIdx) => {
                    const value = row[header];
                    const isSourceSheet = header === 'Source Sheet';
                    
                    return (
                      <td 
                        key={colIdx} 
                        className={`px-5 py-3 truncate max-w-xs whitespace-nowrap
                          ${isSourceSheet 
                            ? 'sticky left-0 bg-yellow-50/90 text-yellow-800 font-bold border-r border-slate-100/50 shadow-[1px_0_0_rgba(226,232,240,0.5)]' 
                            : ''
                          }
                        `}
                      >
                        {value === null || value === undefined ? (
                          <span className="text-slate-400 font-light italic">empty</span>
                        ) : (
                          String(value)
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
