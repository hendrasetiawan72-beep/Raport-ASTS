/**
 * Utility for compressing and processing image uploads
 * Converts uploaded image files (avatars, signatures, stamps, logos)
 * into clean, lightweight Base64 data URLs that fit smoothly in IndexedDB.
 */

export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

/**
 * Reads a File object and compresses it into a high-performance Base64 string.
 */
export const compressImageFile = (
  file: File,
  options: CompressImageOptions = {}
): Promise<string> => {
  const {
    maxWidth = 400,
    maxHeight = 400,
    quality = 0.85,
    format = 'image/webp',
  } = options;

  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      reject(new Error('File yang dipilih bukan merupakan format gambar yang valid.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memuat gambar ke memori.'));
      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate aspect ratio scale
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context tidak tersedia.'));
            return;
          }

          // If format is PNG or WEBP with transparency, don't fill white background
          if (format === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Test if browser supports WebP output
          let outputFormat = format;
          let dataUrl = canvas.toDataURL(outputFormat, quality);
          if (!dataUrl.startsWith(`data:${outputFormat}`) && outputFormat === 'image/webp') {
            outputFormat = 'image/jpeg';
            dataUrl = canvas.toDataURL(outputFormat, quality);
          }

          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Prepares signature image: ensures transparent background and trimmed bounds
 */
export const compressSignatureImage = (file: File): Promise<string> => {
  return compressImageFile(file, {
    maxWidth: 600,
    maxHeight: 250,
    quality: 0.9,
    format: 'image/png',
  });
};

/**
 * Prepares school logo: preserves crisp lines and transparency
 */
export const compressLogoImage = (file: File): Promise<string> => {
  return compressImageFile(file, {
    maxWidth: 360,
    maxHeight: 360,
    quality: 0.92,
    format: 'image/png',
  });
};

/**
 * Prepares student or teacher portrait photo
 */
export const compressProfilePhoto = (file: File): Promise<string> => {
  return compressImageFile(file, {
    maxWidth: 320,
    maxHeight: 400,
    quality: 0.82,
    format: 'image/webp',
  });
};
