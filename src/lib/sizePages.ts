// Landing pages for "compress image to X KB" searches.
// Common upload limits on job, exam, visa and government portals.
export interface SizePage {
  kb: number;
  slug: string;
  useCase: string;
}

export const sizePages: SizePage[] = [
  { kb: 10, slug: "compress-image-to-10kb", useCase: "signature and thumbprint uploads on exam and government forms" },
  { kb: 20, slug: "compress-image-to-20kb", useCase: "signature uploads and exam application forms" },
  { kb: 30, slug: "compress-image-to-30kb", useCase: "photo and signature uploads on recruitment and exam portals" },
  { kb: 50, slug: "compress-image-to-50kb", useCase: "passport-size photos on government and exam portals" },
  { kb: 100, slug: "compress-image-to-100kb", useCase: "job applications, visa forms and profile photos" },
  { kb: 150, slug: "compress-image-to-150kb", useCase: "application forms, ID uploads and profile pictures" },
  { kb: 200, slug: "compress-image-to-200kb", useCase: "online forms, email attachments and website uploads" },
  { kb: 300, slug: "compress-image-to-300kb", useCase: "document photos, scanned certificates and online forms" },
  { kb: 500, slug: "compress-image-to-500kb", useCase: "websites, email attachments and marketplace listings" },
];

export function getSizePage(kb: number): SizePage | undefined {
  return sizePages.find((p) => p.kb === kb);
}

// Landing pages for "compress PDF to X KB" searches.
export const pdfSizePages: SizePage[] = [
  { kb: 50, slug: "compress-pdf-to-50kb", useCase: "single-page certificates and exam or government forms" },
  { kb: 100, slug: "compress-pdf-to-100kb", useCase: "job applications, exam forms and university portals" },
  { kb: 200, slug: "compress-pdf-to-200kb", useCase: "government forms, visa applications and certificates" },
  { kb: 300, slug: "compress-pdf-to-300kb", useCase: "scanned documents, application packets and visa forms" },
  { kb: 500, slug: "compress-pdf-to-500kb", useCase: "email attachments, resumes and multi-page documents" },
];

export function getPdfSizePage(kb: number): SizePage | undefined {
  return pdfSizePages.find((p) => p.kb === kb);
}
