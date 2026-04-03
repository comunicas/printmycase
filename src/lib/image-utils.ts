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

/** Render a preview image with the device mockup frame overlaid */
export function renderPreviewWithMockup(
  imgSrc: string,
  deviceImageSrc: string,
  scale: number,
  position: { x: number; y: number },
  rotation: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const userImg = new window.Image();
    userImg.crossOrigin = "anonymous";

    const deviceImg = new window.Image();
    deviceImg.crossOrigin = "anonymous";

    let loaded = 0;
    const onReady = () => {
      loaded++;
      if (loaded < 2) return;

      // Canvas at 2x for quality
      const cw = PHONE_W * 2;
      const ch = PHONE_H * 2;
      const canvas = document.createElement("canvas");
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext("2d")!;

      // Draw user image (same logic as renderSnapshot but at 2x)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, cw, ch);

      const oversize = Math.max(150, scale * 1.25);
      const offset = -(oversize - 100) / 2;
      const divW = cw * oversize / 100;
      const divH = ch * oversize / 100;
      const divLeft = cw * offset / 100;
      const divTop = ch * offset / 100;
      const bgSizePct = scale * (100 / oversize) / 100;
      const imgAspect = userImg.naturalWidth / userImg.naturalHeight;
      const divAspect = divW / divH;
      let imgW: number, imgH: number;
      if (imgAspect > divAspect) { imgH = divH * bgSizePct; imgW = imgH * imgAspect; }
      else { imgW = divW * bgSizePct; imgH = imgW / imgAspect; }
      const imgLeft = divLeft + (divW - imgW) * position.x / 100;
      const imgTop = divTop + (divH - imgH) * position.y / 100;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, cw, ch);
      ctx.clip();
      const cx = cw / 2;
      const cy = ch / 2;
      ctx.translate(cx, cy);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);
      ctx.drawImage(userImg, imgLeft, imgTop, imgW, imgH);
      ctx.restore();

      // Overlay device frame
      ctx.drawImage(deviceImg, 0, 0, cw, ch);

      resolve(canvas.toDataURL("image/png"));
    };

    userImg.onload = onReady;
    deviceImg.onload = onReady;
    userImg.onerror = () => reject(new Error("Failed to load user image for preview"));
    deviceImg.onerror = () => {
      // If device image fails, just resolve without frame
      loaded++;
      onReady();
    };
    userImg.src = imgSrc;
    deviceImg.src = deviceImageSrc;
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
