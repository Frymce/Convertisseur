const convertHeic = async (file) => {
  const heic2any = (await import('heic2any')).default;

  return heic2any({
    blob: file,
    toType: 'image/jpeg'
  });
};

const FORMATS = ['jpeg', 'png', 'webp', 'gif', 'bmp'];

const isHeicFile = (file) => {
  const ext = file.name.split('.').pop().toLowerCase();
  return ext === 'heic' || ext === 'heif' || file.type === 'image/heic' || file.type === 'image/heif';
};

const convertHeicToImageData = async (file) => {
  try {
    const heic2any = (await import('heic2any')).default;

    const blob = await heic2any({
      blob: file,
      toType: 'image/png',
    });
    return blob;
  } catch (err) {
    throw new Error('Failed to decode HEIC file');
  }
};

const processImageData = (img, targetFormat, fileName) => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      let mimeType;
      switch(targetFormat.toLowerCase()) {
        case 'jpeg':
          mimeType = 'image/jpeg';
          break;
        case 'png':
          mimeType = 'image/png';
          break;
        case 'webp':
          mimeType = 'image/webp';
          break;
        case 'gif':
          mimeType = 'image/png';
          canvas.toBlob((blob) => {
            resolve({
              blob: blob,
              format: targetFormat,
              fileName: fileName
            });
          }, mimeType, 1.0);
          return;
        case 'bmp':
          mimeType = 'image/bmp';
          break;
        default:
          mimeType = 'image/png';
      }

      canvas.toBlob((blob) => {
        resolve({
          blob: blob,
          format: targetFormat,
          fileName: fileName
        });
      }, mimeType, 1.0);
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

    const outputFileName = `${file.name.split('.')[0]}.${targetFormat}`;

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
          processImageData(img, targetFormat, outputFileName)
            .then(resolve)
            .catch(reject);
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
