import { useState, useCallback } from 'react';
import './App.css';
import { convertImage } from './services/imageConverter';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import ProcessingView from './components/ProcessingView';
import ResultsView from './components/ResultsView';
const convertHeic = async (file) => {
  const heic2any = (await import('heic2any')).default;

  return heic2any({
    blob: file,
    toType: 'image/jpeg'
  });
};

// view: 'home' | 'processing' | 'results'
export default function App() {
  const [view, setView] = useState('home');
  const [targetFormat, setTargetFormat] = useState('jpeg');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState([]); // { file, preview, status, progress, error }
  const [results, setResults] = useState([]); // { fileName, format, blob, preview }

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

  const handleFilesSelect = useCallback(async (files) => {
    setSelectedFiles(files);
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/') || isHeic(f));
    if (files.length) handleFilesSelect(files);
  };

  const handleConvert = async () => {
    if (!selectedFiles.length) return;

    // Build initial queue with previews
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
    setView('processing');

    const newResults = [];

    for (let i = 0; i < initialQueue.length; i++) {
      // Mark as processing
      setQueue(prev => prev.map((item, idx) =>
        idx === i ? { ...item, status: 'processing', progress: 30 } : item
      ));

      try {
        const result = await convertImage(initialQueue[i].file, targetFormat);
        newResults.push({
          fileName: result.fileName,
          format: targetFormat,
          blob: result.blob,
          preview: initialQueue[i].preview,
        });
        setQueue(prev => prev.map((item, idx) =>
          idx === i ? { ...item, status: 'done', progress: 100 } : item
        ));
      } catch (err) {
        setQueue(prev => prev.map((item, idx) =>
          idx === i ? { ...item, status: 'error', error: err.message } : item
        ));
      }
    }

    setResults(newResults);
    // Small delay so user sees 100% before transitioning
    setTimeout(() => setView('results'), 600);
  };

  const handleDownloadAll = () => {
    results.forEach(item => {
      const url = URL.createObjectURL(item.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const handleRemoveResult = (index) => {
    setResults(prev => prev.filter((_, i) => i !== index));
  };

  const handleConvertMore = () => {
    setSelectedFiles([]);
    setQueue([]);
    setResults([]);
    setView('home');
  };

  const handleCancelProcessing = () => {
    handleConvertMore();
  };

  const activePage = view === 'results' ? 'results' : 'home';

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#0b1c30] font-sans">
      <Navbar activePage={activePage} />

      {view === 'home' && (
        <main className="flex-grow">
          <HomeView
            onFilesSelect={handleFilesSelect}
            dragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            targetFormat={targetFormat}
            onFormatChange={setTargetFormat}
            selectedFiles={selectedFiles}
            onConvert={handleConvert}
          />
        </main>
      )}

      {view === 'processing' && (
        <ProcessingView files={queue} onCancel={handleCancelProcessing} />
      )}

      {view === 'results' && (
        <main className="flex-grow flex flex-col">
          <ResultsView
            results={results}
            onConvertMore={handleConvertMore}
            onRemove={handleRemoveResult}
            onDownloadAll={handleDownloadAll}
          />
        </main>
      )}

      <Footer />
    </div>
  );
}
