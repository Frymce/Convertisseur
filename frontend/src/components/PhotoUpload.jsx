import { useRef } from 'react';

export default function PhotoUpload({ onFileSelect, dragging, onDragOver, onDragLeave, onDrop }) {
  const fileRef = useRef(null);

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        className="hidden"
        onChange={e => { if (e.target.files?.length) onFileSelect(Array.from(e.target.files)); }}
      />
      <div
        id="dropzone"
        className={`bg-white border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px] transition-all duration-300 group cursor-pointer ${dragging ? 'upload-zone-active' : 'border-[#4648d4]/30 hover:border-[#4648d4]'}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="w-20 h-20 bg-[#6063ee]/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-[#4648d4] text-4xl">upload_file</span>
        </div>
        <h3 className="text-2xl font-semibold mb-2">Drop your images here</h3>
        <p className="text-[#464554] mb-12">{dragging ? '📂 Release to upload!' : 'or click to browse from your device'}</p>
        <div className="flex gap-2 flex-wrap justify-center opacity-60 group-hover:opacity-100 transition-opacity">
          {['JPG', 'PNG', 'WEBP', 'HEIC', 'BMP', 'GIF'].map(fmt => (
            <span key={fmt} className="px-2 py-1 bg-[#d3e4fe] rounded text-xs font-semibold">{fmt}</span>
          ))}
        </div>
      </div>
    </>
  );
}
