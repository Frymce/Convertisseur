import { useState } from 'react';

function ResultCard({ item, onRemove }) {
  const [dlState, setDlState] = useState('idle'); // idle | loading | done

  const handleDownload = () => {
    if (dlState !== 'idle') return;
    setDlState('loading');
    const url = URL.createObjectURL(item.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTimeout(() => { setDlState('done'); setTimeout(() => setDlState('idle'), 2000); }, 1200);
  };

  const sizeKB = item.blob ? (item.blob.size / 1024).toFixed(0) : '?';
  const sizeMB = item.blob && item.blob.size > 1024 * 1024
    ? `${(item.blob.size / 1024 / 1024).toFixed(1)} MB`
    : `${sizeKB} KB`;

  return (
    <div className="group bg-white rounded-xl border border-[#c7c4d7] card-shadow card-shadow-hover transition-all duration-300 overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-[#e5eeff] overflow-hidden">
        {item.preview && (
          <img
            src={item.preview}
            alt={item.fileName}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute top-2 right-2 bg-[#006a61] text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1", fontSize: '14px' }}>check_circle</span>
          Success
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <div>
          <p className="text-sm font-medium text-[#0b1c30] truncate">{item.fileName}</p>
          <p className="text-xs text-[#464554]">{sizeMB} • {item.format.toUpperCase()}</p>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleDownload}
            className="flex-1 bg-[#4648d4] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#6063ee] transition-colors flex items-center justify-center gap-1"
          >
            {dlState === 'idle' && <><span className="material-symbols-outlined text-lg">download</span>Download</>}
            {dlState === 'loading' && <><span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>Downloading...</>}
            {dlState === 'done' && <><span className="material-symbols-outlined text-lg">check</span>Done</>}
          </button>
          <button
            onClick={onRemove}
            className="p-2 text-[#464554] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/20 rounded-lg transition-colors"
            title="Remove"
          >
            <span className="material-symbols-outlined text-xl">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResultsView({ results, onConvertMore, onRemove, onDownloadAll }) {
  return (
    <main className="flex-grow max-w-[1280px] mx-auto w-full px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-[#c7c4d7] pb-6">
        <div>
          <h1 className="text-[48px] font-bold leading-[56px] tracking-tight text-[#0b1c30] mb-1">Conversion Results</h1>
          <p className="text-[#464554] text-lg">{results.length} image{results.length > 1 ? 's' : ''} successfully processed and ready for download.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={onConvertMore}
            className="flex items-center gap-2 border border-[#4648d4] text-[#4648d4] px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#e1e0ff] transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined">add</span>
            Convert more
          </button>
          <button
            onClick={onDownloadAll}
            className="flex items-center gap-2 bg-[#4648d4] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#6063ee] transition-all shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined">download</span>
            Download All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {results.map((item, i) => (
          <ResultCard key={i} item={item} onRemove={() => onRemove(i)} />
        ))}
      </div>
    </main>
  );
}
