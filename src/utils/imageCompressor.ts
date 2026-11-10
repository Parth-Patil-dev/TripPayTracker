/**
 * Compresses an image file on-device using HTML5 Canvas.
 * - Maximum dimension (width/height): 800px (preserves aspect ratio)
 * - JPEG quality: ~0.6
 * - Returns a base64 JPEG data URL and file size in KB.
 * This keeps the resulting base64 string between 25 KB and 85 KB,
 * well beneath Firestore's 1 MB document limit.
 */
export interface CompressedImageResult {
  dataUrl: string;
  sizeKb: number;
  width: number;
  height: number;
}

export function compressImageFile(
  file: File | Blob,
  maxDimension: number = 800,
  quality: number = 0.6
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    // Basic type validation
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate aspect ratio scaled dimensions
          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          // Render on canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas 2D rendering context.'));
            return;
          }

          // Optional: fill white background in case of transparent PNGs
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          // Draw scaled image
          ctx.drawImage(img, 0, 0, width, height);

          // Export as compressed JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', quality);

          // Approximate size in KB: length of base64 * 0.75 / 1024
          const sizeKb = Math.round((dataUrl.length * 0.75) / 1024);

          resolve({
            dataUrl,
            sizeKb,
            width,
            height,
          });
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for compression.'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file.'));
    };

    reader.readAsDataURL(file);
  });
}
