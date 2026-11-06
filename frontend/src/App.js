import { useState, useCallback, useRef } from 'react';
import './App.css';
import { convertImage } from './services/imageConverter';

const FORMATS = ['jpeg', 'png', 'webp', 'gif', 'bmp'];

const isHeic = (file) => {
  const ext = file.name.split('.').pop().toLowerCase();
  return ext === 'heic' || ext === 'heif' || file.type === 'image/heic' || file.type === 'image/heif';
};

const buildPreview = async (file) => {
  try {
    if (isHeic(file)) {
      const heic2any = (await import('heic2any')).default;
      const blob = await heic2any({ blob: file, toType: 'image/png' });
      return URL.createObjectURL(blob);
    }
    return URL.createObjectURL(file);
  } catch {
    return null;
  }
};

// ─── Utilitaire de téléchargement fiable ─────────────────────────────────────
// Convertit un Blob en data URL base64 puis force le téléchargement.
// Cette méthode fonctionne même hors d'un geste utilisateur direct.
const triggerDownload = (blob, fileName) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = reader.result; // data:image/...;base64,...
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      resolve();
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// ─── Carte résultat ──────────────────────────────────────────────────────────
function ResultCard({ item, onRemove }) {
  const [dlState, setDlState] = useState('idle');

  const handleDownload = async () => {
    if (dlState !== 'idle') return;
    setDlState('loading');
    await triggerDownload(item.blob, item.fileName);
    setDlState('done');
    setTimeout(() => setDlState('idle'), 2000);
  };

  const size =
    item.blob.size > 1024 * 1024
      ? `${(item.blob.size / 1024 / 1024).toFixed(1)} MB`
      : `${(item.blob.size / 1024).toFixed(0)} KB`;

  return (
    <div className="group bg-white rounded-2xl border border-[#e0e0f0] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-[#e5eeff] overflow-hidden">
        {item.preview ? (
          <img src={item.preview} alt={item.fileName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[#767586] text-4xl">image</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-[#006a61] text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '12px' }}>check_circle</span>
          {item.format.toUpperCase()}
        </div>
      </div>
      <div className="p-3 flex flex-col gap-2">
        <p className="text-sm font-medium text-[#0b1c30] truncate" title={item.fileName}>{item.fileName}</p>
        <p className="text-xs text-[#767586]">{size}</p>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 bg-[#4648d4] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#6063ee] transition-colors flex items-center justify-center gap-1"
          >
            {dlState === 'idle' && <><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>Download</>}
            {dlState === 'loading' && <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>progress_activity</span>Saving…</>}
            {dlState === 'done' && <><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>Done</>}
          </button>
          <button
            onClick={onRemove}
            className="p-2 text-[#767586] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/30 rounded-lg transition-colors"
            title="Supprimer"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Ligne de progression dans la file ───────────────────────────────────────
function QueueRow({ item }) {
  const statusColors = {
    queued: 'text-[#767586]',
    processing: 'text-[#4648d4] font-medium',
    done: 'text-[#006a61]',
    error: 'text-[#ba1a1a]',
  };
  const statusLabel = {
    queued: 'En attente…',
    processing: 'Conversion…',
    done: 'Terminé',
    error: 'Erreur',
  };

  return (
    <div className={`flex items-center gap-3 py-2 border-b border-[#f0f0f8] last:border-0 ${item.status === 'queued' ? 'opacity-50' : ''}`}>
      <div className="w-10 h-10 rounded-lg bg-[#e5eeff] overflow-hidden flex-shrink-0 flex items-center justify-center">
        {item.preview ? (
          <img src={item.preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="material-symbols-outlined text-[#767586]" style={{ fontSize: '18px' }}>image</span>
        )}
      </div>
      <div className="flex-grow min-w-0">
        <p className="text-sm text-[#0b1c30] truncate">{item.file.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-grow h-1 bg-[#e0e0f0] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                item.status === 'done' ? 'bg-[#006a61]' :
                item.status === 'error' ? 'bg-[#ba1a1a]' :
                item.status === 'processing' ? 'bg-[#4648d4] progress-shimmer' : 'bg-transparent'
              }`}
              style={{ width: item.status === 'processing' ? `${item.progress || 50}%` : item.status === 'done' || item.status === 'error' ? '100%' : '0%' }}
            />
          </div>
          <span className={`text-xs flex-shrink-0 ${statusColors[item.status]}`}>{statusLabel[item.status]}</span>
        </div>
      </div>
      {item.status === 'done' && <span className="material-symbols-outlined text-[#006a61] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1", fontSize: '18px' }}>check_circle</span>}
      {item.status === 'error' && <span className="material-symbols-outlined text-[#ba1a1a] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1", fontSize: '18px' }}>error</span>}
      {item.status === 'processing' && <span className="material-symbols-outlined text-[#4648d4] flex-shrink-0 processing-pulse" style={{ fontSize: '18px' }}>sync</span>}
      {item.status === 'queued' && <span className="material-symbols-outlined text-[#767586] flex-shrink-0" style={{ fontSize: '18px' }}>schedule</span>}
    </div>
  );
}

// ─── App principale ───────────────────────────────────────────────────────────
export default function App() {
  const [targetFormat, setTargetFormat] = useState('jpeg');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState([]);
  const [results, setResults] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const fileRef = useRef(null);
  const resultsRef = useRef(null);

  const handleFilesSelect = useCallback((files) => {
    const valid = files.filter(f => f.type.startsWith('image/') || isHeic(f));
    if (valid.length) setSelectedFiles(prev => [...prev, ...valid]);
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelect(Array.from(e.dataTransfer.files));
  };

  const removeSelected = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (!selectedFiles.length || isConverting) return;

    setIsConverting(true);
    setResults([]);

    const initialQueue = await Promise.all(
      selectedFiles.map(async (file) => ({
        file,
        preview: await buildPreview(file),
        status: 'queued',
        progress: 0,
        error: null,
      }))
    );

    setQueue(initialQueue);

    // Scroll vers les résultats
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

    const newResults = [];

    for (let i = 0; i < initialQueue.length; i++) {
      setQueue(prev => prev.map((item, idx) =>
        idx === i ? { ...item, status: 'processing', progress: 30 } : item
      ));

      try {
        const result = await convertImage(initialQueue[i].file, targetFormat);
        newResults.push({
          fileName: result.fileName,
          format: result.format,
          blob: result.blob,
          preview: initialQueue[i].preview,
        });
        setResults([...newResults]);
        setQueue(prev => prev.map((item, idx) =>
          idx === i ? { ...item, status: 'done', progress: 100 } : item
        ));
      } catch (err) {
        setQueue(prev => prev.map((item, idx) =>
          idx === i ? { ...item, status: 'error', error: err.message } : item
        ));
      }
    }

    setIsConverting(false);
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setQueue([]);
    setResults([]);
    setIsConverting(false);
  };

  const handleDownloadAll = async () => {
    for (const item of results) {
      await triggerDownload(item.blob, item.fileName);
      // Petit délai entre chaque pour que le navigateur traite le précédent
      await new Promise(r => setTimeout(r, 300));
    }
  };

  const handleRemoveResult = (index) => {
    setResults(prev => prev.filter((_, i) => i !== index));
  };

  const totalFiles = queue.length;
  const doneFiles = queue.filter(f => f.status === 'done' || f.status === 'error').length;
  const percent = totalFiles > 0 ? Math.round((doneFiles / totalFiles) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#0b1c30] font-sans">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-[#f8f9ff]/80 backdrop-blur-md border-b border-[#e0e0f0]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4648d4] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>layers</span>
            <span className="text-xl font-bold text-[#4648d4]">PixelShift</span>
          </div>
          <span className="text-xs text-[#767586] hidden sm:block">Conversion d'images côté client — aucun upload vers un serveur</span>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="pt-12 pb-6 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#e1e0ff] text-[#07006c] rounded-full mb-4">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '14px' }}>bolt</span>
            <span className="text-xs font-semibold uppercase tracking-wide">100 % local · aucune donnée envoyée</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-3">
            Convertissez vos images<br />
            <span className="text-[#4648d4]">en quelques secondes.</span>
          </h1>
          <p className="text-[#464554] text-base">
            Déposez vos fichiers, choisissez le format cible, téléchargez. Simple.
          </p>
        </div>
      </section>

      {/* ── Zone principale ── */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-6 pb-16 space-y-8">

        {/* Dropzone */}
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            className="hidden"
            onChange={e => { if (e.target.files?.length) handleFilesSelect(Array.from(e.target.files)); }}
          />
          <div
            className={`bg-white border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center min-h-[220px] cursor-pointer transition-all duration-200 ${isDragging ? 'upload-zone-active' : 'border-[#4648d4]/30 hover:border-[#4648d4] hover:bg-[#f0f4ff]'}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <span className="material-symbols-outlined text-[#4648d4] text-5xl mb-3">upload_file</span>
            <p className="text-lg font-semibold mb-1">{isDragging ? '📂 Relâchez pour ajouter' : 'Déposez vos images ici'}</p>
            <p className="text-sm text-[#767586] mb-4">ou cliquez pour parcourir</p>
            <div className="flex gap-2 flex-wrap justify-center">
              {['JPG', 'PNG', 'WEBP', 'HEIC', 'BMP', 'GIF'].map(fmt => (
                <span key={fmt} className="px-2 py-1 bg-[#e5eeff] text-[#4648d4] rounded text-xs font-semibold">{fmt}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Fichiers sélectionnés + contrôles */}
        {selectedFiles.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#e0e0f0] shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#0b1c30]">
                {selectedFiles.length} fichier{selectedFiles.length > 1 ? 's' : ''} sélectionné{selectedFiles.length > 1 ? 's' : ''}
              </h2>
              <button onClick={handleReset} className="text-xs text-[#767586] hover:text-[#ba1a1a] transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>Tout effacer
              </button>
            </div>

            {/* Liste des fichiers */}
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-1 bg-[#e5eeff] text-[#0b1c30] text-xs px-2 py-1 rounded-full">
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>image</span>
                  <span className="max-w-[120px] truncate">{f.name}</span>
                  <button onClick={() => removeSelected(i)} className="ml-1 text-[#767586] hover:text-[#ba1a1a]">
                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>close</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Format + bouton convert */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-[#f0f0f8]">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-[#464554] whitespace-nowrap">Convertir en :</label>
                <select
                  value={targetFormat}
                  onChange={e => setTargetFormat(e.target.value)}
                  className="border border-[#c7c4d7] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]/40 focus:border-[#4648d4]"
                >
                  {FORMATS.map(f => (
                    <option key={f} value={f}>{f.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleConvert}
                disabled={isConverting}
                className="flex-1 sm:flex-none bg-[#4648d4] disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#6063ee] active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {isConverting ? (
                  <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>progress_activity</span>Conversion…</>
                ) : (
                  <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>auto_fix_high</span>
                  Convertir {selectedFiles.length} fichier{selectedFiles.length > 1 ? 's' : ''}</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Zone de progression + résultats */}
        {queue.length > 0 && (
          <div ref={resultsRef} className="space-y-6">

            {/* Barre de progression globale */}
            <div className="bg-white rounded-2xl border border-[#e0e0f0] shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isConverting ? (
                    <span className="material-symbols-outlined text-[#4648d4] processing-pulse" style={{ fontSize: '18px' }}>sync</span>
                  ) : (
                    <span className="material-symbols-outlined text-[#006a61]" style={{ fontVariationSettings: "'FILL' 1", fontSize: '18px' }}>check_circle</span>
                  )}
                  <span className="text-sm font-semibold">
                    {isConverting ? `Traitement… ${doneFiles}/${totalFiles}` : `Terminé — ${results.length} converti${results.length > 1 ? 's' : ''}`}
                  </span>
                </div>
                <span className="text-sm font-bold text-[#4648d4]">{percent}%</span>
              </div>
              <div className="h-2 w-full bg-[#e0e0f0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4648d4] rounded-full transition-all duration-700"
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Détail par fichier */}
              <div className="mt-4 divide-y divide-[#f0f0f8]">
                {queue.map((item, i) => <QueueRow key={i} item={item} />)}
              </div>
            </div>

            {/* Résultats */}
            {results.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#0b1c30]">
                    Résultats ({results.length})
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1 border border-[#4648d4] text-[#4648d4] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#e1e0ff] transition-colors"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                      Nouvelles images
                    </button>
                    <button
                      onClick={handleDownloadAll}
                      className="flex items-center gap-1 bg-[#4648d4] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#6063ee] transition-colors shadow-sm"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
                      Tout télécharger
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {results.map((item, i) => (
                    <ResultCard key={i} item={item} onRemove={() => handleRemoveResult(i)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#e0e0f0] py-5 px-6 text-center text-xs text-[#767586]">
        <span className="font-semibold text-[#4648d4]">PixelShift</span> · Conversion locale dans votre navigateur · Aucune image envoyée sur un serveur · © 2024
      </footer>
    </div>
  );
}
