export default function ProcessingView({ files, onCancel }) {
  const total = files.length;
  const processed = files.filter(f => f.status === 'done' || f.status === 'error').length;
  const percent = total > 0 ? Math.round((processed / total) * 100) : 0;

  return (
    <main className="max-w-[1280px] mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#4648d4] mb-1">
            <span className="material-symbols-outlined text-xl processing-pulse">sync</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Active Pipeline</span>
          </div>
          <h1 className="text-[32px] font-semibold leading-10 text-[#0b1c30]">Processing Photos...</h1>
          <p className="text-[#464554] mt-1">Converting {total} image{total > 1 ? 's' : ''} to the selected format.</p>
        </div>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 bg-[#d3e4fe] text-[#0b1c30] rounded-lg text-sm font-medium hover:bg-[#ffdad6] hover:text-[#93000a] transition-colors"
        >
          <span className="material-symbols-outlined">cancel</span>
          Cancel All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#eff4ff] p-6 rounded-xl card-shadow">
            <h3 className="text-xs font-semibold text-[#767586] mb-4 uppercase tracking-widest">Job Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#464554] text-sm">Total Files</span>
                <span className="text-sm font-medium text-[#0b1c30]">{total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#464554] text-sm">Processed</span>
                <span className="text-sm font-medium text-[#006a61]">{processed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#464554] text-sm">Remaining</span>
                <span className="text-sm font-medium text-[#0b1c30]">{total - processed}</span>
              </div>
              <div className="pt-4 border-t border-[#c7c4d7]">
                <span className="text-[#464554] text-sm block mb-1">Progress</span>
                <span className="text-2xl font-semibold text-[#4648d4]">{percent}%</span>
              </div>
            </div>
          </div>
          <div className="bg-[#e1e0ff]/30 border border-[#e1e0ff] p-6 rounded-xl">
            <div className="flex items-center gap-2 text-[#4648d4] mb-2">
              <span className="material-symbols-outlined">info</span>
              <span className="text-sm font-bold">Client-side Processing</span>
            </div>
            <p className="text-sm text-[#464554]">Images are converted locally in your browser using the Canvas API — no upload required.</p>
          </div>
        </div>

        {/* Queue */}
        <div className="lg:col-span-9 space-y-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-sm font-medium text-[#464554]">Queue status</h2>
            <span className="text-xs font-semibold bg-[#86f2e4] text-[#006f66] px-2 py-1 rounded-full">{percent}% Complete</span>
          </div>

          <div className="space-y-3">
            {files.map((f, i) => (
              <div
                key={i}
                className={`bg-white p-4 rounded-xl border card-shadow flex items-center gap-4 transition-all duration-300 ${f.status === 'processing' ? 'border-2 border-[#4648d4]' : 'border-[#c7c4d7]'} ${f.status === 'queued' ? 'opacity-70' : ''}`}
              >
                <div className="w-16 h-16 rounded-lg bg-[#e5eeff] overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {f.preview ? (
                    <img src={f.preview} alt={f.file.name} className={`w-full h-16 object-cover ${f.status === 'queued' ? 'grayscale' : ''}`} />
                  ) : (
                    <span className="material-symbols-outlined text-[#767586]">image</span>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-[#0b1c30] truncate">{f.file.name}</h4>
                      <p className={`text-xs ${f.status === 'processing' ? 'text-[#4648d4] font-medium' : f.status === 'done' ? 'text-[#006a61]' : f.status === 'error' ? 'text-[#ba1a1a]' : 'text-[#767586]'}`}>
                        {f.status === 'processing' ? 'Processing...' : f.status === 'done' ? 'Optimized' : f.status === 'error' ? `Error: ${f.error}` : 'Waiting in queue...'}
                      </p>
                    </div>
                    {f.status === 'done' && <span className="material-symbols-outlined text-[#006a61] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                    {f.status === 'error' && <span className="material-symbols-outlined text-[#ba1a1a] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>}
                    {f.status === 'queued' && <span className="material-symbols-outlined text-[#767586] flex-shrink-0">schedule</span>}
                  </div>
                  <div className="w-full h-1 rounded-full overflow-hidden bg-[#c7c4d7]/30">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${f.status === 'done' ? 'bg-[#006a61] w-full' : f.status === 'processing' ? 'bg-[#4648d4] progress-shimmer' : f.status === 'error' ? 'bg-[#ba1a1a] w-full' : 'w-0'}`}
                      style={f.status === 'processing' ? { width: `${f.progress || 50}%` } : {}}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
