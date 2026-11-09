import { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '../assets/logo.png';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ─── Utilitaire de téléchargement fiable (data URL base64) ───────────────────
const triggerDownload = (blob, fileName) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = reader.result;
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

export default function SharePage({ fileId }) {
  // state: 'loading' | 'ready' | 'expired' | 'error'
  const [state, setState] = useState('loading');
  const [fileName, setFileName] = useState('');
  const [fileBlob, setFileBlob] = useState(null);
  const [fileSize, setFileSize] = useState('');
  const [dlState, setDlState] = useState('idle'); // 'idle' | 'loading' | 'done'

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/download/${fileId}`, {
          responseType: 'blob',
        });

        const blob = response.data;
        // Récupérer le nom du fichier depuis Content-Disposition si dispo
        const disposition = response.headers['content-disposition'];
        let name = fileId;
        if (disposition) {
          const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match) name = match[1].replace(/['"]/g, '');
        }

        const size =
          blob.size > 1024 * 1024
            ? `${(blob.size / 1024 / 1024).toFixed(1)} MB`
            : `${(blob.size / 1024).toFixed(0)} KB`;

        setFileBlob(blob);
        setFileName(name);
        setFileSize(size);
        setState('ready');
      } catch (err) {
        if (err.response?.status === 404) {
          setState('expired');
        } else {
          setState('error');
        }
      }
    };

    fetchFile();
  }, [fileId]);

  const handleDownload = async () => {
    if (dlState !== 'idle' || !fileBlob) return;
    setDlState('loading');
    await triggerDownload(fileBlob, fileName);
    setDlState('done');
    setTimeout(() => setDlState('idle'), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#0b1c30] font-sans">

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#f8f9ff]/80 backdrop-blur-md border-b border-[#e0e0f0]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src={logo} alt="ConvLocal" className="h-10 w-auto" />
          </a>
          <a
            href="/"
            className="text-sm text-[#4648d4] font-medium hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_photo_alternate</span>
            Convertir mes images
          </a>
        </div>
      </header>

      {/* Contenu */}
      <main className="flex-grow flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">

          {/* Chargement */}
          {state === 'loading' && (
            <div className="bg-white rounded-2xl border border-[#e0e0f0] shadow-sm p-10 flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-[#4648d4] text-5xl processing-pulse">cloud_download</span>
              <p className="text-base font-medium text-[#464554]">Récupération du fichier…</p>
            </div>
          )}

          {/* Prêt à télécharger */}
          {state === 'ready' && (
            <div className="bg-white rounded-2xl border border-[#e0e0f0] shadow-sm overflow-hidden">
              {/* Header vert */}
              <div className="bg-[#e8f5f3] border-b border-[#c0e0db] px-6 py-5 flex items-center gap-3">
                <div className="w-12 h-12 bg-[#006a61] rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>image</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#0b1c30] truncate">{fileName}</p>
                  <p className="text-xs text-[#464554]">{fileSize} · Disponible pendant 30 min</p>
                </div>
              </div>

              <div className="px-6 py-6 space-y-4">
                <p className="text-sm text-[#464554]">
                  Un fichier a été partagé avec vous via <span className="font-semibold text-[#4648d4]">ConvLocal</span>. Cliquez pour le télécharger.
                </p>

                <button
                  onClick={handleDownload}
                  className="w-full bg-[#4648d4] text-white py-3 rounded-xl text-base font-semibold hover:bg-[#6063ee] active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {dlState === 'idle' && (
                    <><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>download</span>Télécharger</>
                  )}
                  {dlState === 'loading' && (
                    <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '20px' }}>progress_activity</span>Téléchargement…</>
                  )}
                  {dlState === 'done' && (
                    <><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check</span>Téléchargé !</>
                  )}
                </button>

                <p className="text-xs text-[#767586] text-center">
                  Ce lien expire 30 minutes après sa création.
                </p>
              </div>
            </div>
          )}

          {/* Lien expiré */}
          {state === 'expired' && (
            <div className="bg-white rounded-2xl border border-[#e0e0f0] shadow-sm p-10 flex flex-col items-center gap-4 text-center">
              <span className="material-symbols-outlined text-[#767586] text-6xl">hourglass_disabled</span>
              <h1 className="text-xl font-bold text-[#0b1c30]">Lien expiré</h1>
              <p className="text-sm text-[#464554]">
                Ce fichier n'est plus disponible. Les fichiers partagés expirent après 30 minutes.
              </p>
              <a
                href="/"
                className="mt-2 bg-[#4648d4] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#6063ee] transition-colors"
              >
                Créer une nouvelle conversion
              </a>
            </div>
          )}

          {/* Erreur générique */}
          {state === 'error' && (
            <div className="bg-white rounded-2xl border border-[#e0e0f0] shadow-sm p-10 flex flex-col items-center gap-4 text-center">
              <span className="material-symbols-outlined text-[#ba1a1a] text-6xl">error</span>
              <h1 className="text-xl font-bold text-[#0b1c30]">Une erreur est survenue</h1>
              <p className="text-sm text-[#464554]">
                Impossible de récupérer le fichier. Vérifiez que le lien est correct ou réessayez plus tard.
              </p>
              <a
                href="/"
                className="mt-2 border border-[#4648d4] text-[#4648d4] px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#e1e0ff] transition-colors"
              >
                Retour à l'accueil
              </a>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e0e0f0] py-5 px-6 text-center text-xs text-[#767586]">
        <span className="font-semibold text-[#4648d4]">ConvLocal</span> · Conversion locale dans votre navigateur · Le partage par lien utilise un serveur temporaire (30 min) · © 2024
      </footer>
    </div>
  );
}
