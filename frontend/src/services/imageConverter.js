// Formats nativement supportés par canvas.toBlob dans tous les navigateurs modernes.
// GIF et BMP ne sont pas supportés par canvas.toBlob de manière universelle :
//   - image/gif  : non supporté (aucun navigateur ne l'encode via Canvas)
//   - image/bmp  : non supporté sur Firefox et Safari
// Pour ces deux formats, on produit un PNG et on ajuste l'extension du fichier.
const FORMATS = ['jpeg', 'png', 'webp', 'gif', 'bmp'];

// Résout le vrai MIME type utilisable par canvas.toBlob pour chaque format demandé,
// ainsi que l'extension réelle du fichier de sortie.
const resolveFormat = (targetFormat) => {
  switch (targetFormat.toLowerCase()) {
    case 'jpeg':
      return { mimeType: 'image/jpeg', ext: 'jpeg' };
    case 'png':
      return { mimeType: 'image/png', ext: 'png' };
    case 'webp':
      return { mimeType: 'image/webp', ext: 'webp' };
    case 'gif':
      // Canvas ne peut pas encoder GIF — on produit un PNG lisible par tous les navigateurs.
      return { mimeType: 'image/png', ext: 'png' };
    case 'bmp':
      // image/bmp n'est pas supporté sur Firefox/Safari — fallback PNG.
      return { mimeType: 'image/png', ext: 'png' };
    default:
      return { mimeType: 'image/png', ext: 'png' };
  }
};

const isHeicFile = (file) => {
  const ext = file.name.split('.').pop().toLowerCase();
  return (
    ext === 'heic' ||
    ext === 'heif' ||
    file.type === 'image/heic' ||
    file.type === 'image/heif'
  );
};

const convertHeicToImageData = async (file) => {
  try {
    const heic2any = (await import('heic2any')).default;
    const blob = await heic2any({ blob: file, toType: 'image/png' });
    return blob;
  } catch (err) {
    throw new Error('Failed to decode HEIC file');
  }
};

const processImageData = (img, targetFormat, baseName) => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const { mimeType, ext } = resolveFormat(targetFormat);
      const outputFileName = `${baseName}.${ext}`;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error(`Conversion failed for format: ${targetFormat}`));
            return;
          }
          resolve({ blob, format: ext, fileName: outputFileName });
        },
        mimeType,
        1.0,
      );
    } catch (err) {
      reject(err);
    }
  });
};

export const convertImage = (file, targetFormat) => {
  return new Promise(async (resolve, reject) => {
    if (!FORMATS.includes(targetFormat.toLowerCase())) {
      reject(new Error(`Format not supported: ${targetFormat}`));
      return;
    }

    // Nom de base sans extension (gère les fichiers avec plusieurs points dans le nom)
    const baseName = file.name.replace(/\.[^.]+$/, '');

    try {
      let imageBlob;

      if (isHeicFile(file)) {
        imageBlob = await convertHeicToImageData(file);
      } else {
        imageBlob = file;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          processImageData(img, targetFormat, baseName).then(resolve).catch(reject);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(imageBlob);
    } catch (err) {
      reject(err);
    }
  });
};
