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
  {
    slug: "india-visa-photo-resizer",
    navLabel: "India visa photo",
    h1: "India Visa Photo Resizer: Square JPEG, 10–300KB",
    metaTitle: "India Visa Photo Resizer — Square JPEG, 10KB to 300KB",
    metaDescription:
      "Make a square India visa photo as a JPEG between 350×350 and 1000×1000 pixels and 10–300KB for the online visa form. Free, private, in your browser.",
    intro:
      "The Indian online visa application only accepts a square JPEG photo between 10 KB and 300 KB, from 350 × 350 up to 1000 × 1000 pixels. Drop your photo below and you'll get a square JPEG inside those limits, at the best quality that fits.",
    presets: [
      { id: "india-visa-600", label: "Visa photo · 600 × 600 px · 10–300 KB", width: 600, height: 600, minKb: 10, maxKb: 300, fit: "cover" },
      { id: "india-visa-350", label: "Smallest allowed · 350 × 350 px", width: 350, height: 350, minKb: 10, maxKb: 300, fit: "cover" },
      { id: "india-visa-1000", label: "Largest allowed · 1000 × 1000 px", width: 1000, height: 1000, minKb: 10, maxKb: 300, fit: "cover" },
    ],
    requirements: [
      { item: "Format", spec: "JPEG" },
      { item: "File size", spec: "Minimum 10 KB, maximum 300 KB" },
      { item: "Shape", spec: "Height and width must be equal (square)" },
      { item: "Dimensions", spec: "Minimum 350 × 350 pixels, maximum 1000 × 1000 pixels" },
    ],
    sources: [
      {
        label: "Indian Visa Online (Government of India): Online visa photo upload process",
        url: "https://indianvisaonline.gov.in/visa/VSS_IMAGE.pdf",
      },
    ],
    verified: "Verified against the official document in November 2026",
    caveat:
      "This tool handles format, shape, pixel size and file size only. Your photo also has to meet the visa rules on pose, background, lighting and recency, and the e-Visa form states its own limits on its upload page, so read the instructions on the form you are filling in before you submit.",
    steps: [
      "Start with a straight-on photo against a plain light background, with your head centred.",
      "Choose 600 × 600 (a safe middle size), or the smallest or largest size the form allows.",
      "Drop the photo in. It's centred and cropped to a square, then saved as a JPEG between 10 KB and 300 KB.",
      "Check the preview, especially that your full head and shoulders are in frame, then download.",
    ],
    tips: [
      "Leave space around your head in the original; the square crop removes the sides of a tall photo.",
      "If the form rejects the photo for size, the usual cause is a photo that is not exactly square.",
      "Start from the original camera photo, not a screenshot or a copy sent through a chat app.",
    ],
    faqs: [
      {
        question: "What size photo does the Indian visa application need?",
        answer:
          "According to the official upload guide, a square JPEG between 350 × 350 and 1000 × 1000 pixels, with a file size from 10 KB to 300 KB. This tool produces exactly that.",
      },
      {
        question: "Why does the visa form reject my photo?",
        answer:
          "The form checks four things: JPEG format, a file between 10 KB and 300 KB, equal height and width, and pixel size within 350–1000. A phone photo usually fails on shape and file size, which this tool fixes.",
      },
      {
        question: "Is my photo uploaded anywhere?",
        answer: "No. Resizing and compression happen in your browser, so your photo never leaves your device.",
      },
    ],
    related: ["image-crop", "heic-to-jpg", "image-resizer"],
    guides: ["india-visa-photo-size-requirements", "how-to-compress-image-to-50kb"],
  },
  {
    slug: "pan-card-photo-signature-resizer",
    navLabel: "PAN card photo & signature",
    h1: "PAN Card Photo and Signature Resizer (Protean / NSDL)",
    metaTitle: "PAN Card Photo & Signature Resizer — 200 DPI, 20KB / 10KB",
    metaDescription:
      "Resize your PAN card photo to 3.5 × 2.5 cm (under 20KB) and signature to 2 × 4.5 cm (under 10KB) at 200 DPI for the Protean (NSDL) online form. Free, private.",
    intro:
      "The Protean (formerly NSDL) online PAN application asks for a scanned photo and signature at 200 DPI, each with a set size in centimetres and a small file-size limit. Pick the item, drop your image, and you'll get a JPEG at that size, marked 200 DPI and under the limit.",
    presets: [
      { id: "pan-photo", label: "Photo · 3.5 × 2.5 cm · under 20 KB", width: 197, height: 276, maxKb: 20, fit: "cover", dpi: 200 },
      { id: "pan-signature", label: "Signature · 2 × 4.5 cm · under 10 KB", width: 354, height: 157, maxKb: 10, fit: "contain", dpi: 200 },
    ],
    requirements: [
      { item: "Photograph", spec: "Colour JPEG, 200 DPI, 3.5 × 2.5 cm, maximum 20 KB" },
      { item: "Signature", spec: "Colour JPEG, 200 DPI, 2 × 4.5 cm, maximum 10 KB" },
      { item: "Supporting documents", spec: "Black & white PDF/A or JPEG, 200 DPI, maximum 300 KB per page" },
    ],
    sources: [
      {
        label: "Protean (NSDL) TIN: Guidelines for online PAN applications, scanning specifications",
        url: "https://tin.tin.proteantech.in/pan/InstructionDSC.html",
      },
    ],
    verified: "Verified against the official page in November 2026",
    caveat:
      "At 200 DPI, 3.5 × 2.5 cm works out to 276 × 197 pixels and 2 × 4.5 cm to 157 × 354 pixels; this tool makes the photo upright (197 wide × 276 tall) and the signature wide (354 × 157). Protean's e-Sign upload screen may show a higher size limit than the figures above; a file under these limits fits either way. UTIITSL uses different sizes, so check the form you are filling in.",
    steps: [
      "Choose what you're uploading: photo or signature.",
      "Drop in a clear photo or scan. The photo is centred and cropped to fit; the signature is fitted on white so nothing is cut off.",
      "The tool saves a JPEG at the exact size, marked as 200 DPI, under the file-size limit.",
      "Download, then repeat for the other item.",
    ],
    tips: [
      "Signature: sign with a black pen on plain white paper and crop close to the writing before you start.",
      "Photo: use a recent passport-style photo with a plain light background.",
      "10 KB is very small. If your signature looks rough, crop tighter around it first so more of the limit goes to the ink.",
    ],
    faqs: [
      {
        question: "What is the PAN card photo and signature size for the online form?",
        answer:
          "Protean's scanning specification asks for a colour JPEG photo at 200 DPI, 3.5 × 2.5 cm and at most 20 KB, and a colour JPEG signature at 200 DPI, 2 × 4.5 cm and at most 10 KB.",
      },
      {
        question: "What is 3.5 × 2.5 cm in pixels?",
        answer:
          "At 200 DPI it is about 276 × 197 pixels. The signature, 2 × 4.5 cm, is about 157 × 354 pixels. This tool sets those pixel sizes and writes 200 DPI into the file.",
      },
      {
        question: "Does this work for UTIITSL PAN applications?",
        answer:
          "No. UTIITSL publishes different photo and signature sizes. This page follows the Protean (NSDL) specification only.",
      },
      {
        question: "Are my photo and signature uploaded to a server?",
        answer: "No. Everything runs in your browser, so your images never leave your device.",
      },
    ],
    related: ["image-crop", "image-resizer", "heic-to-jpg"],
    guides: ["pan-card-photo-signature-size", "how-to-resize-signature-for-online-form"],
  },
];

export function getExamPage(slug: string) {
  return examPages.find((p) => p.slug === slug);
}
