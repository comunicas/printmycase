import { PHONE_W, PHONE_H } from "./customize-types";

export function compressImage(
  dataUrl: string,
  maxW = 1200,
  maxH = 2400,
  quality = 0.75
): Promise<{ url: string; compressed: boolean }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      if (w <= maxW && h <= maxH) {
        resolve({ url: dataUrl, compressed: false });
        return;
      }
      const ratio = Math.min(maxW / w, maxH / h);
      const nw = Math.round(w * ratio);
      const nh = Math.round(h * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = nw;
      canvas.height = nh;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, nw, nh);
      resolve({ url: canvas.toDataURL("image/jpeg", quality), compressed: true });
    };
    img.src = dataUrl;
  });
}

/** Compress image with smaller limits optimized for AI processing (filters/upscale) */
export function compressForAI(
  dataUrl: string,
  maxW = 800,
  maxH = 1600,
  quality = 0.80
): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      if (w <= maxW && h <= maxH) {
        resolve(dataUrl);
        return;
      }
      const ratio = Math.min(maxW / w, maxH / h);
      const nw = Math.round(w * ratio);
      const nh = Math.round(h * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = nw;
      canvas.height = nh;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, nw, nh);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = dataUrl;
  });
}

/** Load an image URL and return as a data URL (for Fal.ai temporary URLs) */
export function urlToDataUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

export function renderSnapshot(
  imgSrc: string,
  scale: number,
  position: { x: number; y: number },
  rotation: number,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = PHONE_W;
      canvas.height = PHONE_H;
      const ctx = canvas.getContext("2d")!;
      const oversize = Math.max(150, scale * 1.25);
      const drawW = (scale / oversize) * PHONE_W * (oversize / 100);
      const drawH = (scale / oversize) * PHONE_H * (oversize / 100);
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const cellAspect = PHONE_W / PHONE_H;
      let srcW: number, srcH: number;
      if (imgAspect > cellAspect) {
        srcH = img.naturalHeight;
        srcW = srcH * cellAspect;
      } else {
        srcW = img.naturalWidth;
        srcH = srcW / cellAspect;
      }
      const maxOffX = img.naturalWidth - srcW;
      const maxOffY = img.naturalHeight - srcH;
      const srcX = (position.x / 100) * maxOffX;
      const srcY = (position.y / 100) * maxOffY;

      ctx.save();
      ctx.translate(PHONE_W / 2, PHONE_H / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-PHONE_W / 2, -PHONE_H / 2);
      ctx.drawImage(
        img,
        srcX, srcY, srcW, srcH,
        (PHONE_W - drawW) / 2, (PHONE_H - drawH) / 2, drawW, drawH
      );
      ctx.restore();

      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = imgSrc;
  });
}
