"use client";

// QR generation is 100% client-side: a QR code is just text encoded as an
// image, so no API call (and no cost) is ever needed here.

import QRCode from "qrcode";

let cached: { text: string; dataUrl: string } | null = null;

export async function qrDataUrl(text: string, width = 1024): Promise<string> {
  if (cached && cached.text === text) return cached.dataUrl;
  const dataUrl = await QRCode.toDataURL(text, {
    errorCorrectionLevel: "M",
    width,
    margin: 2,
    color: { dark: "#0b0d12", light: "#ffffff" },
  });
  cached = { text, dataUrl };
  return dataUrl;
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
