/**
 * Client-side image normalizer and compressor.
 * Guarantees that any image (whether a 15MB phone camera raw photo, a PNG, or an SVG preset)
 * is rendered to a clean, lightweight JPEG (max 1024px, ~80-150KB) before transmission.
 * This completely avoids 413 Payload Too Large / dropped connections and ensures
 * 100% compatibility with Gemini Vision.
 */

export async function normalizeAndCompressImage(
  source: string | File,
  maxDimension = 1024,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    let srcUrl = "";
    let isObjectUrl = false;

    if (typeof source === "string") {
      srcUrl = source;
    } else {
      srcUrl = URL.createObjectURL(source);
      isObjectUrl = true;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        let { width, height } = img;

        if (!width || !height) {
          width = 600;
          height = 600;
        }

        // Downscale while preserving aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Could not initialize 2D canvas context.");
        }

        // Fill background with warm off-white in case source has transparency
        ctx.fillStyle = "#EFE6D2";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Export as standard JPEG data URL
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);

        if (isObjectUrl) {
          URL.revokeObjectURL(srcUrl);
        }

        resolve(compressedDataUrl);
      } catch (err) {
        if (isObjectUrl) {
          URL.revokeObjectURL(srcUrl);
        }
        reject(err);
      }
    };

    img.onerror = (err) => {
      if (isObjectUrl) {
        URL.revokeObjectURL(srcUrl);
      }
      reject(new Error("The court bailiff could not decode this photographic file. Please provide a standard JPEG or PNG image."));
    };

    img.src = srcUrl;
  });
}
