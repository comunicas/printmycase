import { PHONE_W, PHONE_H } from "./customize-types";

/** Transform a Supabase Storage public URL into an on-the-fly optimized URL.
 *  Uses Supabase Image Transformation (render/image) for resize + WebP. */
export function getOptimizedUrl(url: string, width = 400, quality = 80): string {
  if (!url || !url.includes("/storage/v1/object/public/")) return url;
  return (
    url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/") +
    `?width=${width}&resize=contain&quality=${quality}`
  );
}

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
  maxW = 640,
  maxH = 1136,
  quality = 0.70
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
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
    img.onerror = () => reject(new Error("Failed to load image for compression"));
    img.src = dataUrl;
  });
}


/** Compress image, upload to Supabase Storage, and return a signed URL for AI processing.
 *  If src is already an HTTP URL (e.g. from a previous filter result in storage), skip compress+upload. */
export async function uploadForAI(
  src: string,
  userId: string,
  supabaseClient: { storage: { from: (bucket: string) => any } },
  maxW = 640,
  maxH = 1136,
  quality = 0.70,
): Promise<{ path: string; signedUrl: string }> {
  // If already an HTTP URL (previous filter result stored in bucket), reuse directly
  if (src.startsWith("http")) {
    return { path: "", signedUrl: src };
  }

  // Compress data URL
  const compressed = await compressForAI(src, maxW, maxH, quality);

  // Convert data URL to blob
  const res = await fetch(compressed);
  const blob = await res.blob();

  // Upload to storage
  const path = `${userId}/ai_source_${Date.now()}.jpg`;
  const { error } = await supabaseClient.storage
    .from("customizations")
    .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  // Generate signed URL (5 min)
  const { data: signedData, error: signedError } = await supabaseClient.storage
    .from("customizations")
    .createSignedUrl(path, 300);
  if (signedError || !signedData?.signedUrl) throw new Error("Failed to create signed URL");

  return { path, signedUrl: signedData.signedUrl };
}

/** Optimize an image File for upload: resize to max dimension and convert to WebP */
export function optimizeForUpload(
  file: File,
  maxSize = 800,
  quality = 0.80
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      let nw = w;
      let nh = h;
      if (w > maxSize || h > maxSize) {
        const ratio = Math.min(maxSize / w, maxSize / h);
        nw = Math.round(w * ratio);
        nh = Math.round(h * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = nw;
      canvas.height = nh;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, nw, nh);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to convert to WebP"));
        },
        "image/webp",
        quality
      );
    };
    img.onerror = () => reject(new Error("Failed to load image for optimization"));
    img.src = URL.createObjectURL(file);
  });
}

/** Render a phone mockup entirely via canvas — no DOM capture needed.
 *  Draws the user image inside a rounded-rect phone frame with dark border. */
export function renderPhoneMockup(
  imgSrc: string,
  scale: number,
  position: { x: number; y: number },
  rotation: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const userImg = new window.Image();
    userImg.crossOrigin = "anonymous";

    userImg.onload = () => {
      // 2x for quality
      const BORDER = 10;
      const RADIUS = 48;
      const cw = PHONE_W * 2 + BORDER * 2;
      const ch = PHONE_H * 2 + BORDER * 2;
      const canvas = document.createElement("canvas");
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext("2d")!;

      // Transparent background
      ctx.clearRect(0, 0, cw, ch);

      // Draw dark phone border (outer rounded rect)
      ctx.fillStyle = "#333333";
      ctx.beginPath();
      ctx.roundRect(0, 0, cw, ch, RADIUS + BORDER / 2);
      ctx.fill();

      // Inner area dimensions
      const innerX = BORDER;
      const innerY = BORDER;
      const innerW = PHONE_W * 2;
      const innerH = PHONE_H * 2;

      // Clip to inner rounded rect
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(innerX, innerY, innerW, innerH, RADIUS);
      ctx.clip();

      // White background inside phone
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(innerX, innerY, innerW, innerH);

      // Draw user image with same logic as renderSnapshot but offset by border
      const oversize = Math.max(150, scale * 1.25);
      const offset = -(oversize - 100) / 2;
      const divW = innerW * oversize / 100;
      const divH = innerH * oversize / 100;
      const divLeft = innerX + innerW * offset / 100;
      const divTop = innerY + innerH * offset / 100;
      const bgSizePct = scale * (100 / oversize) / 100;
      const imgAspect = userImg.naturalWidth / userImg.naturalHeight;
      const divAspect = divW / divH;
      let imgW: number, imgH: number;
      if (imgAspect > divAspect) { imgH = divH * bgSizePct; imgW = imgH * imgAspect; }
      else { imgW = divW * bgSizePct; imgH = imgW / imgAspect; }
      const imgLeft = divLeft + (divW - imgW) * position.x / 100;
      const imgTop = divTop + (divH - imgH) * position.y / 100;

      const cx = innerX + innerW / 2;
      const cy = innerY + innerH / 2;
      ctx.translate(cx, cy);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);
      ctx.drawImage(userImg, imgLeft, imgTop, imgW, imgH);
      ctx.restore();

      resolve(canvas.toDataURL("image/png"));
    };

    userImg.onerror = () => reject(new Error("Failed to load user image for mockup"));
    userImg.src = imgSrc;
  });
}

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
      const canvas = document.createElement("canvas");
      canvas.width = PHONE_W;
      canvas.height = PHONE_H;
      const ctx = canvas.getContext("2d")!;

      // White background for clarity
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, PHONE_W, PHONE_H);

      // Replicate PhonePreview CSS logic exactly
      const oversize = Math.max(150, scale * 1.25);
      const offset = -(oversize - 100) / 2;

      const divW = PHONE_W * oversize / 100;
      const divH = PHONE_H * oversize / 100;
      const divLeft = PHONE_W * offset / 100;
      const divTop = PHONE_H * offset / 100;

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

      // Clip to canvas area
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, PHONE_W, PHONE_H);
      ctx.clip();

      // Apply rotation around center
      const cx = PHONE_W / 2;
      const cy = PHONE_H / 2;
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
