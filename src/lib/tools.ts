export interface Tool {
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  keywords: string[];
}

export const tools: Tool[] = [
  {
    name: "Compress PDF",
    slug: "compress-pdf",
    description:
      "Reduce PDF file size while keeping quality. Free online PDF compressor — no signup, no watermarks.",
    category: "PDF",
    icon: "📦",
    keywords: ["compress pdf", "pdf compressor", "reduce pdf size", "shrink pdf"],
  },
  {
    name: "Merge PDF",
    slug: "merge-pdf",
    description:
      "Combine multiple PDF files into one document. Drag and drop to reorder pages easily.",
    category: "PDF",
    icon: "📎",
    keywords: ["merge pdf", "combine pdf", "join pdf files", "pdf merger"],
  },
  {
    name: "Split PDF",
    slug: "split-pdf",
    description:
      "Extract pages from a PDF or split it into separate files. Select the pages you need.",
    category: "PDF",
    icon: "✂️",
    keywords: ["split pdf", "extract pdf pages", "separate pdf", "pdf splitter"],
  },
  {
    name: "JPG to PDF",
    slug: "jpg-to-pdf",
    description:
      "Convert JPG images to PDF. Combine multiple images into a single PDF document.",
    category: "PDF",
    icon: "🖼️",
    keywords: ["jpg to pdf", "image to pdf", "convert jpg to pdf", "photo to pdf"],
  },
  {
    name: "PDF to JPG",
    slug: "pdf-to-jpg",
    description:
      "Convert PDF pages to high-quality JPG images. Download each page as a separate image.",
    category: "PDF",
    icon: "📄",
    keywords: ["pdf to jpg", "pdf to image", "convert pdf to jpg", "pdf to png"],
  },
  {
    name: "Image Compressor",
    slug: "image-compressor",
    description:
      "Compress JPEG, PNG, and WebP images without losing quality. Reduce image file size instantly.",
    category: "Image",
    icon: "🗜️",
    keywords: ["compress image", "image compressor", "reduce image size", "compress jpg"],
  },
  {
    name: "Image Converter",
    slug: "image-converter",
    description:
      "Convert images between JPG, PNG, WebP, and BMP formats. Free and fast format conversion.",
    category: "Image",
    icon: "🔄",
    keywords: [
      "webp to jpg",
      "png to jpg",
      "jpg to png",
      "heic to jpg",
      "image converter",
    ],
  },
  {
    name: "Image Resizer",
    slug: "image-resizer",
    description:
      "Resize images to any dimension. Set custom width and height or choose from social media presets.",
    category: "Image",
    icon: "📐",
    keywords: ["resize image", "image resizer", "resize photo online", "change image size"],
  },
  {
    name: "Word to PDF",
    slug: "word-to-pdf",
    description:
      "Convert Word documents (.docx) to PDF. Text, headings, lists and tables carry over; complex layouts may shift.",
    category: "Document",
    icon: "📝",
    keywords: ["word to pdf", "docx to pdf", "convert word to pdf", "doc to pdf"],
  },
  {
    name: "Rotate PDF",
    slug: "rotate-pdf",
    description:
      "Rotate PDF pages 90, 180, or 270 degrees. Fix scanned documents with wrong orientation.",
    category: "PDF",
    icon: "🔃",
    keywords: ["rotate pdf", "rotate pdf pages", "pdf rotation", "turn pdf"],
  },
  {
    name: "PDF Watermark",
    slug: "pdf-watermark",
    description:
      "Add text watermarks to your PDF files. Customize font size, opacity, position, and color.",
    category: "PDF",
    icon: "💧",
    keywords: ["pdf watermark", "add watermark to pdf", "watermark pdf", "stamp pdf"],
  },
  {
    name: "PDF Page Numbers",
    slug: "pdf-page-numbers",
    description:
      "Add page numbers to your PDF. Choose position, format, and starting number. Free and easy.",
    category: "PDF",
    icon: "🔢",
    keywords: ["add page numbers pdf", "pdf page numbers", "number pdf pages", "pdf numbering"],
  },
  // Protect PDF ("pdf-protect") is unlisted until real encryption ships —
  // pdf-lib 1.17.1 can't encrypt. Re-add here once the output is verified.
  {
    name: "HEIC to JPG",
    slug: "heic-to-jpg",
    description:
      "Convert iPhone HEIC photos to JPG or PNG format. Batch convert multiple files at once.",
    category: "Image",
    icon: "📱",
    keywords: ["heic to jpg", "heic to png", "heic converter", "iphone photo converter"],
  },
  {
    name: "Image Crop",
    slug: "image-crop",
    description:
      "Crop images with an interactive drag-and-drop editor. Aspect ratio presets for social media.",
    category: "Image",
    icon: "✂️",
    keywords: ["crop image", "image cropper", "crop photo online", "resize crop"],
  },
  {
    name: "SVG to PNG",
    slug: "svg-to-png",
    description:
      "Convert SVG vector files to PNG or JPG at any resolution. Scale up to 4x for high-res output.",
    category: "Image",
    icon: "🎨",
    keywords: ["svg to png", "svg to jpg", "svg converter", "vector to raster"],
  },
  {
    name: "HTML to PDF",
    slug: "html-to-pdf",
    description:
      "Convert HTML code or web content to PDF. Paste your HTML and download a clean PDF document.",
    category: "Document",
    icon: "🌐",
    keywords: ["html to pdf", "webpage to pdf", "convert html to pdf", "web to pdf"],
  },
  {
    name: "PDF Unlock",
    slug: "pdf-unlock",
    description:
      "Remove password from PDF files. Enter the password you know and download an unlocked copy.",
    category: "PDF",
    icon: "🔓",
    keywords: ["unlock pdf", "remove pdf password", "pdf unlocker", "decrypt pdf"],
  },
];

export const categories = [...new Set(tools.map((t) => t.category))];

export function getToolsByCategory(category: string): Tool[] {
  return tools.filter((t) => t.category === category);
}

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}
