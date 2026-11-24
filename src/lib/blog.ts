export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  keywords: string[];
  relatedTool: string;
  relatedToolName: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-compress-pdf-without-losing-quality",
    title: "How to Compress PDF Without Losing Quality — 2026 Guide",
    description:
      "Learn three proven ways to reduce PDF file size without losing quality. Free online tools, Mac Preview, and more.",
    date: "2026-11-24",
    readTime: "5 min read",
    keywords: [
      "compress pdf without losing quality",
      "reduce pdf size free",
      "make pdf smaller",
    ],
    relatedTool: "compress-pdf",
    relatedToolName: "Compress PDF",
  },
  {
    slug: "how-to-add-page-numbers-to-pdf-free",
    title: "How to Add Page Numbers to PDF — 3 Free Methods",
    description:
      "Add page numbers to any PDF for free. Choose from online tools, desktop apps, and browser-based solutions.",
    date: "2026-11-24",
    readTime: "4 min read",
    keywords: [
      "add page numbers to pdf",
      "pdf page numbering free",
      "number pdf pages",
    ],
    relatedTool: "pdf-page-numbers",
    relatedToolName: "PDF Page Numbers",
  },
  {
    slug: "heic-vs-jpg-difference-how-to-convert",
    title: "HEIC vs JPG: What's the Difference & How to Convert",
    description:
      "Understand the difference between HEIC and JPG formats, why iPhones use HEIC, and how to convert HEIC to JPG for free.",
    date: "2026-11-24",
    readTime: "5 min read",
    keywords: [
      "heic vs jpg",
      "what is heic",
      "convert heic to jpg",
      "iphone photo format",
    ],
    relatedTool: "heic-to-jpg",
    relatedToolName: "HEIC to JPG Converter",
  },
  {
    slug: "how-to-merge-pdf-files-free",
    title: "How to Merge PDF Files Into One — Free & Easy",
    description:
      "Combine multiple PDF files into a single document for free. No signup, no watermarks — works right in your browser.",
    date: "2026-11-24",
    readTime: "4 min read",
    keywords: ["merge pdf files", "combine pdf free", "join pdf documents"],
    relatedTool: "merge-pdf",
    relatedToolName: "Merge PDF",
  },
  {
    slug: "how-to-password-protect-pdf-free",
    title: "How to Password Protect a PDF — Free Online Tool",
    description:
      "Lock your PDF with a password for free. Learn about user vs. owner passwords and how to set permissions.",
    date: "2026-11-24",
    readTime: "5 min read",
    keywords: [
      "password protect pdf",
      "encrypt pdf free",
      "lock pdf with password",
    ],
    relatedTool: "pdf-protect",
    relatedToolName: "Protect PDF",
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getRelatedPosts(
  currentSlug: string,
  limit = 3
): BlogPost[] {
  return blogPosts
    .filter((p) => p.slug !== currentSlug)
    .slice(0, limit);
}
