// Opening PDFs that carry encryption (an "owner" restriction or a known password).
// pdf-lib can't read encrypted files, but pdf.js can. pdf.js's page-extraction
// writes a clean, unencrypted copy whenever more than one source document is
// involved, so we combine the file with a throwaway one-page PDF and then drop
// that page again. Text, fonts, form fields and page rotation are all preserved.
import type { PDFDocument as PDFDocumentType } from "pdf-lib";

type PdfJsDoc = { numPages: number; extractPages(infos: { document: Uint8Array | null }[]): Promise<Uint8Array> };

/** Returns an unencrypted copy of an already-opened pdf.js document. */
export async function unencryptedCopy(pdfJsDoc: PdfJsDoc): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const filler = await PDFDocument.create();
  filler.addPage([10, 10]);
  const fillerBytes = await filler.save({ useObjectStreams: false });
  const combined = await pdfJsDoc.extractPages([{ document: null }, { document: fillerBytes }]);
  const doc = await PDFDocument.load(combined);
  if (doc.getPageCount() !== pdfJsDoc.numPages + 1) throw new Error("Unexpected page count after decrypting");
  doc.removePage(doc.getPageCount() - 1);
  return doc.save();
}

/** Decrypts PDF bytes. Without a password this only works for files that open without one. */
export async function decryptPdfBytes(bytes: Uint8Array, password?: string): Promise<Uint8Array> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const task = pdfjsLib.getDocument(password ? { data: bytes.slice(), password } : { data: bytes.slice() });
  try {
    return await unencryptedCopy((await task.promise) as unknown as PdfJsDoc);
  } finally {
    await task.destroy().catch(() => {});
  }
}

/**
 * PDFDocument.load that also accepts PDFs with editing restrictions (no password
 * needed to open). A PDF that needs a password to open still throws, with
 * "password" in the message.
 */
export async function loadPdf(data: ArrayBuffer | Uint8Array): Promise<PDFDocumentType> {
  const { PDFDocument } = await import("pdf-lib");
  try {
    return await PDFDocument.load(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message.toLowerCase() : "";
    if (!msg.includes("encrypt")) throw err;
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    let clean: Uint8Array;
    try {
      clean = await decryptPdfBytes(bytes);
    } catch {
      throw new Error("This PDF is password-protected (encrypted).");
    }
    return PDFDocument.load(clean);
  }
}
