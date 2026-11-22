// File size limits (in bytes)
const MB = 1024 * 1024;

export const FILE_LIMITS = {
  pdf: { warn: 50 * MB, reject: 100 * MB },
  image: { warn: 20 * MB, reject: 50 * MB },
  word: { warn: 20 * MB, reject: 50 * MB },
};

export type FileCategory = keyof typeof FILE_LIMITS;

export interface ValidationResult {
  valid: boolean;
  warning: string | null;
  error: string | null;
}

export function validateFileSize(file: File, category: FileCategory): ValidationResult {
  const limits = FILE_LIMITS[category];
  const sizeMB = (file.size / MB).toFixed(1);

  if (file.size > limits.reject) {
    return {
      valid: false,
      warning: null,
      error: `"${file.name}" (${sizeMB} MB) exceeds the ${limits.reject / MB} MB limit and cannot be processed.`,
    };
  }

  if (file.size > limits.warn) {
    return {
      valid: true,
      warning: `"${file.name}" (${sizeMB} MB) is a large file. Processing may be slow.`,
      error: null,
    };
  }

  return { valid: true, warning: null, error: null };
}

export function isDuplicateFile(file: File, existingFiles: File[]): boolean {
  return existingFiles.some(
    (f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}
