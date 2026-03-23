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
