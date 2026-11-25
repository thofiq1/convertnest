// Portal-specific pages: exact dimensions + KB range presets, with the
// requirements quoted from an official source and a verification date.
import type { SizePreset } from "./exactSize";

export interface ExamPage {
  slug: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  presets: SizePreset[];
  requirements: { item: string; spec: string }[];
  sources: { label: string; url: string }[];
  verified: string;
  caveat: string;
  steps: string[];
  tips: string[];
  faqs: { question: string; answer: string }[];
  related: string[];
  guides: string[];
  navLabel: string;
}

export const examPages: ExamPage[] = [
  {
    slug: "us-visa-photo-resizer",
    navLabel: "US visa photo",
    h1: "US Visa Photo Resizer: 600×600 px, Under 240KB",
    metaTitle: "US Visa Photo Resizer — 600×600, Under 240KB (DS-160)",
    metaDescription:
      "Make a square US visa photo at 600×600 pixels and under 240KB for the DS-160 and other uploads. Free, private, done in your browser.",
    intro:
      "The online US visa application (DS-160) and the Diversity Visa entry need a square JPEG photo of a set size and file size. Drop your photo below and you'll get a 600 × 600 pixel JPEG under 240KB, at the highest quality that fits.",
    presets: [
      { id: "us-visa-600", label: "Visa photo · 600 × 600 px", width: 600, height: 600, maxKb: 240, fit: "cover" },
      { id: "us-visa-1200", label: "Larger · 1200 × 1200 px", width: 1200, height: 1200, maxKb: 240, fit: "cover" },
    ],
    requirements: [
      { item: "Shape", spec: "Square (height equal to width)" },
      { item: "Dimensions", spec: "Minimum 600 × 600 pixels, maximum 1200 × 1200 pixels" },
      { item: "File size", spec: "240 kB or less" },
      { item: "Format", spec: "JPEG" },
      { item: "Colour", spec: "24 bits per pixel, sRGB" },
    ],
    sources: [
      {
        label: "U.S. Department of State: Digital image requirements",
        url: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos/digital-image-requirements.html",
      },
    ],
    verified: "Verified against the official page in November 2026",
    caveat:
      "This tool handles size, shape and file size only. Your photo also has to meet the State Department's rules on pose, background, lighting and recency, and must not be digitally altered to change your appearance, so check those on the official photo requirements page before you submit.",
    steps: [
      "Start with a straight-on photo against a plain white or off-white background, with your head centred.",
      "Choose 600 × 600 (the minimum, and the safest choice) or 1200 × 1200.",
      "Drop the photo in. It's centred and cropped to a square, then saved at the best quality under 240KB.",
      "Check the preview, especially that your full head and the top of your shoulders are in frame, then download.",
    ],
    tips: [
      "Leave space around your head in the original photo; the square crop removes the sides of a tall photo.",
      "Use even lighting with no shadows on your face or the background.",
      "Start from the original camera photo, not a screenshot or an already-compressed copy.",
    ],
    faqs: [
      {
        question: "What size should a US visa photo be for the DS-160?",
        answer:
          "According to the State Department, a square JPEG between 600 × 600 and 1200 × 1200 pixels, no larger than 240 kB. This tool produces exactly 600 × 600 or 1200 × 1200 under 240KB.",
      },
      {
        question: "Will 600 × 600 be accepted?",
        answer:
          "600 × 600 pixels is the minimum allowed size, so it meets the dimension rule. It also leaves plenty of room under the 240KB limit for good quality.",
      },
      {
        question: "Is my photo uploaded anywhere?",
        answer: "No. Resizing and compression happen in your browser, so your photo never leaves your device.",
      },
    ],
    related: ["image-crop", "heic-to-jpg", "image-resizer"],
    guides: ["how-to-compress-image-to-50kb"],
  },
  {
    slug: "ibps-photo-signature-resizer",
    navLabel: "IBPS photo & signature",
    h1: "IBPS & Bank Exam Photo and Signature Resizer",
    metaTitle: "IBPS Photo & Signature Resizer — 200×230, 140×60 px",
    metaDescription:
      "Resize your photo to 200×230 px (20–50KB), signature to 140×60 px (10–20KB), thumb and declaration for IBPS and bank exam forms. Free, private.",
    intro:
      "IBPS and many bank recruitment forms ask for four images, each with preferred pixel dimensions and a file size range. Pick the item you're uploading, drop your image, and you'll get a JPEG at exactly those dimensions and inside the allowed KB range.",
    presets: [
      { id: "photo-200x230", label: "Photo · 200 × 230 px · 20–50 KB", width: 200, height: 230, minKb: 20, maxKb: 50, fit: "cover" },
      { id: "signature-140x60", label: "Signature · 140 × 60 px · 10–20 KB", width: 140, height: 60, minKb: 10, maxKb: 20, fit: "contain" },
      { id: "thumb-240x240", label: "Left thumb · 240 × 240 px · 20–50 KB", width: 240, height: 240, minKb: 20, maxKb: 50, fit: "contain" },
      { id: "declaration-800x400", label: "Declaration · 800 × 400 px · 50–100 KB", width: 800, height: 400, minKb: 50, maxKb: 100, fit: "contain" },
    ],
    requirements: [
      { item: "Photograph", spec: "200 × 230 pixels (preferred), 20–50 KB" },
      { item: "Signature", spec: "140 × 60 pixels (preferred), 10–20 KB" },
      { item: "Left thumb impression", spec: "240 × 240 pixels at 200 DPI (preferred), 20–50 KB, JPG/JPEG" },
      { item: "Hand-written declaration", spec: "800 × 400 pixels at 200 DPI (preferred), 50–100 KB, JPG/JPEG" },
    ],
    sources: [
      {
        label: "Punjab & Sind Bank recruitment notice: Guidelines for scanning the photograph, signature, thumb impression and declaration",
        url: "https://punjabandsind.bank.in/system/uploads/document/2150_2024101518104187881.pdf",
      },
    ],
    verified: "Checked against an official bank recruitment notice in November 2026",
    caveat:
      "These are the standard specifications used in IBPS-style bank recruitment notices, but each notice can differ. Always compare with the annexure of the exact notification you're applying to, and follow its rules on background, ink colour and handwriting.",
    steps: [
      "Choose what you're uploading: photo, signature, left thumb impression or declaration.",
      "Drop in a clear photo or scan. Photos are centred and cropped to fit; signatures, thumbs and declarations are fitted on white so nothing is cut off.",
      "The tool saves a JPEG at the exact pixel size and inside the KB range, then shows the final size.",
      "Download, then repeat for the next item.",
    ],
    tips: [
      "Signature and declaration: write with a black pen on plain white paper, then crop close to the writing before you start.",
      "Photo: use a light, plain background with your face clearly visible.",
      "Small images like a 140 × 60 signature can be under the 10 KB minimum even at top quality. If so, the tool adds empty metadata to reach it (the picture isn't changed) and tells you.",
    ],
    faqs: [
      {
        question: "What is the IBPS photo and signature size?",
        answer:
          "In the standard bank recruitment specification, the photograph is 200 × 230 pixels and 20–50 KB, and the signature is 140 × 60 pixels and 10–20 KB, both JPG/JPEG. Check your own notification, as details can change.",
      },
      {
        question: "My signature comes out under 10 KB. Will it be rejected?",
        answer:
          "Many portals reject files below the minimum. A 140 × 60 signature is a tiny image, so even at top quality it can be under 10 KB. This tool then pads the file with harmless metadata so it reaches the minimum without changing the image.",
      },
      {
        question: "Will my signature be cut off?",
        answer:
          "No. Signatures, thumb impressions and declarations are fitted inside the frame on a white background rather than cropped. For the best result, crop your image close to the writing first.",
      },
      {
        question: "Are my photo and signature uploaded to a server?",
        answer: "No. Everything runs in your browser, so your images never leave your device.",
      },
    ],
    related: ["image-crop", "image-resizer", "heic-to-jpg"],
    guides: ["how-to-resize-signature-for-online-form", "how-to-compress-image-to-50kb"],
  },
];

export function getExamPage(slug: string) {
  return examPages.find((p) => p.slug === slug);
}
