import type { UploadedImageItem } from "../types/stylist.ts";

const MAX_IMAGE_DIMENSION = 1600;

export function readAndNormalizeImage(file: File): Promise<UploadedImageItem> {
  return new Promise((resolve, reject) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      reject(new Error("Please upload a JPG, PNG, or WebP photograph."));
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      reject(new Error("Image must be smaller than 12 MB."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the selected image file."));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error("Unsupported or corrupted image file."));
      img.onload = () => {
        const scale = Math.min(
          1,
          MAX_IMAGE_DIMENSION / Math.max(img.width, img.height)
        );
        const targetWidth = Math.round(img.width * scale);
        const targetHeight = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            base64: dataUrl,
            mimeType: file.type || "image/jpeg",
            previewUrl: dataUrl,
            fileName: file.name,
          });
          return;
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const outputMime =
          file.type === "image/png" || file.type === "image/webp"
            ? file.type
            : "image/jpeg";
        const compressedUrl = canvas.toDataURL(outputMime, 0.88);
        resolve({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          base64: compressedUrl,
          mimeType: outputMime,
          previewUrl: compressedUrl,
          fileName: file.name,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
