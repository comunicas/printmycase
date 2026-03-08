import { PHONE_W, PHONE_H } from "./customize-types";

/** Load image dimensions from a src URL or data URL */
export function getImageResolution(src: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => reject(new Error("Failed to load image for resolution"));
    img.src = src;
  });
}

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

const FRAME_BORDER = 5;
const FRAME_RADIUS = 36;
const FRAME_COLOR = "rgba(30, 30, 30, 0.85)";
const SCREEN_BG = "rgba(240, 240, 240, 0.08)";

export function renderSnapshot(
  imgSrc: string,
  scale: number,
  position: { x: number; y: number },
  rotation: number,
  quality = 0.92
): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const totalW = PHONE_W + FRAME_BORDER * 2;
      const totalH = PHONE_H + FRAME_BORDER * 2;
      const canvas = document.createElement("canvas");
      canvas.width = totalW;
      canvas.height = totalH;
      const ctx = canvas.getContext("2d")!;

      // 1. Draw outer frame (rounded rect)
      ctx.beginPath();
      ctx.roundRect(0, 0, totalW, totalH, FRAME_RADIUS);
      ctx.fillStyle = FRAME_COLOR;
      ctx.fill();

      // 2. Draw inner screen background
      const innerR = FRAME_RADIUS - FRAME_BORDER;
      ctx.beginPath();
      ctx.roundRect(FRAME_BORDER, FRAME_BORDER, PHONE_W, PHONE_H, innerR);
      ctx.fillStyle = SCREEN_BG;
      ctx.fill();

      // 3. Clip to inner screen area and draw user image
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(FRAME_BORDER, FRAME_BORDER, PHONE_W, PHONE_H, innerR);
      ctx.clip();

      // Replicate PhonePreview CSS logic exactly
      const oversize = Math.max(150, scale * 1.25);
      const offset = -(oversize - 100) / 2;

      const divW = PHONE_W * oversize / 100;
      const divH = PHONE_H * oversize / 100;
      const divLeft = FRAME_BORDER + PHONE_W * offset / 100;
      const divTop = FRAME_BORDER + PHONE_H * offset / 100;

      const bgSizePct = scale * (100 / oversize) / 100;

      const imgAspect = img.naturalWidth / img.naturalHeight;
      const divAspect = divW / divH;

      let imgW: number, imgH: number;
      if (imgAspect > divAspect) {
        imgH = divH * bgSizePct;
        imgW = imgH * imgAspect;
      } else {
        imgW = divW * bgSizePct;
        imgH = imgW / imgAspect;
      }

      const imgLeft = divLeft + (divW - imgW) * position.x / 100;
      const imgTop = divTop + (divH - imgH) * position.y / 100;

      // Apply rotation around screen center
      const cx = FRAME_BORDER + PHONE_W / 2;
      const cy = FRAME_BORDER + PHONE_H / 2;
      ctx.translate(cx, cy);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);

      ctx.drawImage(img, imgLeft, imgTop, imgW, imgH);
      ctx.restore();

      resolve(canvas.toDataURL("image/png"));
    };
    img.src = imgSrc;
  });
}
