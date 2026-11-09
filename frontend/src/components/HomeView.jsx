import PhotoUpload from './PhotoUpload';

const FORMATS = ['jpeg', 'png', 'webp', 'gif', 'bmp'];

export default function HomeView({
  onFilesSelect,
  dragging,
  onDragOver,
  onDragLeave,
  onDrop,
  targetFormat,
  onFormatChange,
  selectedFiles,
  onConvert,
}) {
  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-20 pb-12 px-6 overflow-hidden">
        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1 px-4 py-1 bg-[#e1e0ff] text-[#07006c] rounded-full">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1", fontSize: '14px' }}>bolt</span>
              <span className="text-xs font-semibold uppercase tracking-wide">FASTEST CONVERSION ENGINE</span>
            </div>
            <h1 className="text-[48px] font-bold leading-[56px] tracking-tight">
              Convert your photos with <span className="text-[#4648d4]">surgical precision.</span>
            </h1>
            <p className="text-lg text-[#464554] max-w-xl">
              ConvLocal handles batch image conversion, compression, and formatting in seconds. No quality loss, no complicated settings. Just drop and download.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex -space-x-2">
                {['bg-slate-200', 'bg-slate-300', 'bg-slate-400'].map((bg, i) => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-white ${bg}`} />
                ))}
              </div>
              <div>
                <span className="text-sm font-medium block">Trusted by 10k+ artists</span>
                <div className="flex text-[#904900]">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1", fontSize: '16px' }}>star</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Dropzone */}
          <div className="relative">
            <PhotoUpload
              onFileSelect={onFilesSelect}
              dragging={dragging}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            />

            {/* Format selector + Convert button */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm font-medium text-[#464554] whitespace-nowrap">Convert to:</label>
                  <select
                    value={targetFormat}
                    onChange={e => onFormatChange(e.target.value)}
                    className="flex-1 border border-[#c7c4d7] rounded-lg px-3 py-2 text-sm text-[#0b1c30] bg-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]/50 focus:border-[#4648d4]"
                  >
                    {FORMATS.map(f => (
                      <option key={f} value={f}>{f.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={onConvert}
                  className="bg-[#4648d4] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#6063ee] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">auto_fix_high</span>
                  Convert {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}
                </button>
              </div>
            )}

            {/* Selected files preview chips */}
            {selectedFiles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedFiles.slice(0, 5).map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-[#e5eeff] text-[#0b1c30] text-xs px-2 py-1 rounded-full">
                    <span className="material-symbols-outlined text-xs" style={{ fontSize: '14px' }}>image</span>
                    {f.name.length > 20 ? f.name.slice(0, 18) + '…' : f.name}
                  </span>
                ))}
                {selectedFiles.length > 5 && (
                  <span className="inline-flex items-center bg-[#d3e4fe] text-[#4648d4] text-xs px-2 py-1 rounded-full font-semibold">
                    +{selectedFiles.length - 5} more
                  </span>
                )}
              </div>
            )}

            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 hidden md:block glass-card p-4 rounded-xl shadow-lg border border-[#c7c4d7] max-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded bg-[#86f2e4] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#006f66] text-sm" style={{ fontSize: '16px' }}>check_circle</span>
                </div>
                <span className="text-xs font-semibold">Ready to Convert</span>
              </div>
              <div className="h-1 w-full bg-[#d3e4fe] rounded-full overflow-hidden">
                <div className="h-full w-[85%] bg-[#006a61]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-12 bg-[#eff4ff] px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[32px] font-semibold leading-10 mb-4">Streamlined workflow</h2>
            <p className="text-[#464554] text-base max-w-2xl mx-auto">
              We've removed the complexity from image processing. Follow these three simple steps to transform your assets.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: 'add_photo_alternate', step: '1. Upload', desc: 'Drag and drop any image format into our secure upload zone. We support individual files or bulk processing.' },
              { icon: 'settings_input_component', step: '2. Convert', desc: 'Our high-performance engine processes your images instantly using professional-grade compression algorithms.' },
              { icon: 'download', step: '3. Download', desc: 'Get your optimized images in the desired format, ready for the web or print, in a single ZIP file.' },
            ].map(({ icon, step, desc }) => (
              <div key={step} className="bg-white p-6 rounded-xl card-shadow hover:card-shadow-hover transition-shadow group">
                <div className="w-12 h-12 bg-[#4648d4]/10 rounded-lg flex items-center justify-center text-[#4648d4] mb-4 group-hover:bg-[#4648d4] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">{icon}</span>
                </div>
                <h4 className="text-lg font-semibold mb-2">{step}</h4>
                <p className="text-[#464554] text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento */}
      <section className="py-12 px-6">
        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 bg-[#e5eeff] p-4 rounded-xl flex items-center gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <span className="material-symbols-outlined text-[#4648d4] text-3xl">image</span>
                </div>
                <div>
                  <h5 className="font-bold text-sm">Next-Gen Formats</h5>
                  <p className="text-xs text-[#464554]">Full support for AVIF & WebP</p>
                </div>
              </div>
              <div className="col-span-1 bg-[#86f2e4]/30 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="font-bold text-2xl text-[#006a61]">85%</span>
                <span className="text-[10px] uppercase font-bold text-[#006a61]">Compression</span>
              </div>
              <div className="col-span-1 bg-[#e5eeff] p-4 rounded-xl flex flex-col items-center">
                <span className="material-symbols-outlined mb-2 text-[#904900]">security</span>
                <span className="text-xs font-bold">Secure SSL</span>
              </div>
              <div className="col-span-2 bg-[#6063ee] text-white p-4 rounded-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h5 className="font-bold text-sm">Batch Engine</h5>
                  <p className="text-xs opacity-90">Convert 50+ images at once</p>
                </div>
                <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-7xl opacity-20">stacks</span>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-[32px] font-semibold leading-10 mb-4">Universal compatibility. Zero compromises.</h2>
            <p className="text-[#464554] text-base mb-6">
              ConvLocal was built for developers, designers, and social media managers who need fast results without sacrificing image integrity.
            </p>
            <ul className="space-y-2">
              {['Lossless conversion for PNG and TIFF', 'Smart metadata preservation', 'Customizable resizing and cropping'].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006a61]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <span className="text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-6">
        <div className="max-w-[1280px] mx-auto bg-[#213145] text-[#eaf1ff] rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-[48px] font-bold leading-[56px] mb-4">Ready to shift your workflow?</h2>
            <p className="text-[#767586] text-lg mb-12">
              Join thousands of users who have optimized their image pipeline with ConvLocal. Start your first conversion for free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[#6063ee] text-white px-12 py-4 rounded-xl text-2xl font-semibold hover:shadow-2xl transition-all active:scale-95">
                Get Started Now
              </button>
              <button className="border border-[#c7c4d7] px-12 py-4 rounded-xl text-2xl font-semibold hover:bg-white/5 transition-all">
                View API Docs
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
