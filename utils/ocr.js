"use client";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { createWorker } from "tesseract.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export async function extractTextFromFile(file) {
  if (file.type.startsWith("image/")) {
    return await imageOCR(file);
  }

  if (file.type === "application/pdf") {
    return await pdfOCR(file);
  }

  throw new Error("Unsupported file type");
}

async function imageOCR(file) {
  const worker = await createWorker("eng");
  const { data } = await worker.recognize(file);
  await worker.terminate();
  return data.text;
}

async function pdfOCR(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const worker = await createWorker("eng");
  let fullText = "";

  const MAX_PAGES = pdf.numPages;

  for (let i = 1; i <= Math.min(pdf.numPages, MAX_PAGES); i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));

    const { data } = await worker.recognize(blob);
    fullText += data.text + "\n";
  }

  await worker.terminate();
  return fullText.trim();
}
