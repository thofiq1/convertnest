"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { validateFileSize } from "@/utils/fileValidation";
import { extFromMime, originalOutputMime, baseName, isImageFile, unsupportedFileMessage, decodeErrorMessage } from "@/lib/imageOutput";

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

type AspectRatio = "free" | "1:1" | "4:3" | "16:9" | "3:2" | "2:3";

const aspectRatioValues: Record<AspectRatio, number | null> = {
  "free": null,
  "1:1": 1,
  "4:3": 4 / 3,
  "16:9": 16 / 9,
  "3:2": 3 / 2,
  "2:3": 2 / 3,
};

export default function ImageCrop() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);
  const [displayWidth, setDisplayWidth] = useState(0);
  const [displayHeight, setDisplayHeight] = useState(0);
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 0, h: 0 });
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("free");
  const [outputFormat, setOutputFormat] = useState<"original" | "jpeg" | "png">("original");
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [sizeWarning, setSizeWarning] = useState<string | null>(null);

  // Drag state
  const [dragging, setDragging] = useState(false);
  const [dragType, setDragType] = useState<string | null>(null); // "move" | handle names
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropStart, setCropStart] = useState<CropRect>({ x: 0, y: 0, w: 0, h: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      if (croppedUrl) URL.revokeObjectURL(croppedUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Warn before leaving page with active work
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (file) { e.preventDefault(); }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [file]);

  // Recalculate display dimensions on resize
  useEffect(() => {
    if (!imageLoaded || !imgRef.current) return;
    const updateDisplay = () => {
      if (imgRef.current) {
        setDisplayWidth(imgRef.current.clientWidth);
        setDisplayHeight(imgRef.current.clientHeight);
      }
    };
    updateDisplay();
    const observer = new ResizeObserver(updateDisplay);
    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [imageLoaded]);

  const initCrop = useCallback((dispW: number, dispH: number, ratio: AspectRatio) => {
    const ar = aspectRatioValues[ratio];
    let cropW: number, cropH: number;

    if (ar) {
      // Fit the aspect ratio within the display area, covering 80%
      if (dispW / dispH > ar) {
        cropH = dispH * 0.8;
        cropW = cropH * ar;
      } else {
        cropW = dispW * 0.8;
        cropH = cropW / ar;
      }
    } else {
      cropW = dispW * 0.8;
      cropH = dispH * 0.8;
    }

    setCrop({
      x: (dispW - cropW) / 2,
      y: (dispH - cropH) / 2,
      w: cropW,
      h: cropH,
    });
  }, []);

  const handleFile = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!isImageFile(f)) { setSizeWarning(unsupportedFileMessage(f)); return; }

    const sizeCheck = validateFileSize(f, "image");
    if (!sizeCheck.valid) {
      setSizeWarning(sizeCheck.error);
      return;
    }
    if (sizeCheck.warning) setSizeWarning(sizeCheck.warning);
    else setSizeWarning(null);

    // Cleanup previous
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (croppedUrl) URL.revokeObjectURL(croppedUrl);
    setCroppedUrl(null);
    setCroppedBlob(null);

    const url = URL.createObjectURL(f);
    setFile(f);
    setImageUrl(url);
    setImageLoaded(false);
  }, [imageUrl, croppedUrl]);

  const onImageLoad = useCallback(() => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    if (img.clientWidth < 2 || img.clientHeight < 2) {
      // Extremely thin images can't be shown large enough to drag a crop box on.
      setSizeWarning(`This image is ${img.naturalWidth}×${img.naturalHeight} px, which is too thin to crop on screen. Use Image Resizer for it instead.`);
      setImageUrl(null);
      setFile(null);
      return;
    }
    setNaturalWidth(img.naturalWidth);
    setNaturalHeight(img.naturalHeight);
    setDisplayWidth(img.clientWidth);
    setDisplayHeight(img.clientHeight);
    setImageLoaded(true);
    initCrop(img.clientWidth, img.clientHeight, aspectRatio);
  }, [aspectRatio, initCrop]);

  const handleAspectChange = useCallback((ar: AspectRatio) => {
    setAspectRatio(ar);
    if (displayWidth > 0 && displayHeight > 0) {
      initCrop(displayWidth, displayHeight, ar);
    }
  }, [displayWidth, displayHeight, initCrop]);

  // Constrain crop to image bounds and aspect ratio
  const constrainCrop = useCallback((c: CropRect, type: string): CropRect => {
    const ar = aspectRatioValues[aspectRatio];
    let { x, y, w, h } = c;

    // Minimum size
    const minSize = 20;
    w = Math.max(w, minSize);
    h = Math.max(h, minSize);

    // Enforce aspect ratio
    if (ar && type !== "move") {
      if (type.includes("e") || type.includes("w") || type === "nw" || type === "ne" || type === "sw" || type === "se") {
        h = w / ar;
      } else {
        w = h * ar;
      }
    }

    // Clamp to image bounds
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x + w > displayWidth) {
      if (type === "move") {
        x = displayWidth - w;
      } else {
        w = displayWidth - x;
        if (ar) h = w / ar;
      }
    }
    if (y + h > displayHeight) {
      if (type === "move") {
        y = displayHeight - h;
      } else {
        h = displayHeight - y;
        if (ar) w = h * ar;
      }
    }

    return { x, y, w, h };
  }, [aspectRatio, displayWidth, displayHeight]);

  // Mouse/touch handlers
  const getEventPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0]?.clientX ?? ("changedTouches" in e ? e.changedTouches[0]?.clientX ?? 0 : 0) : e.clientX;
    const clientY = "touches" in e ? e.touches[0]?.clientY ?? ("changedTouches" in e ? e.changedTouches[0]?.clientY ?? 0 : 0) : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = getEventPos(e);
    setDragging(true);
    setDragType(type);
    setDragStart(pos);
    setCropStart({ ...crop });
  }, [crop]);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const pos = getEventPos(e);
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;

      let newCrop: CropRect;

      switch (dragType) {
        case "move":
          newCrop = { x: cropStart.x + dx, y: cropStart.y + dy, w: cropStart.w, h: cropStart.h };
          break;
        case "se":
          newCrop = { x: cropStart.x, y: cropStart.y, w: cropStart.w + dx, h: cropStart.h + dy };
          break;
        case "sw":
          newCrop = { x: cropStart.x + dx, y: cropStart.y, w: cropStart.w - dx, h: cropStart.h + dy };
          break;
        case "ne":
          newCrop = { x: cropStart.x, y: cropStart.y + dy, w: cropStart.w + dx, h: cropStart.h - dy };
          break;
        case "nw":
          newCrop = { x: cropStart.x + dx, y: cropStart.y + dy, w: cropStart.w - dx, h: cropStart.h - dy };
          break;
        case "n":
          newCrop = { x: cropStart.x, y: cropStart.y + dy, w: cropStart.w, h: cropStart.h - dy };
          break;
        case "s":
          newCrop = { x: cropStart.x, y: cropStart.y, w: cropStart.w, h: cropStart.h + dy };
          break;
        case "e":
          newCrop = { x: cropStart.x, y: cropStart.y, w: cropStart.w + dx, h: cropStart.h };
          break;
        case "w":
          newCrop = { x: cropStart.x + dx, y: cropStart.y, w: cropStart.w - dx, h: cropStart.h };
          break;
        default:
          return;
      }

      setCrop(constrainCrop(newCrop, dragType!));
    };

    const onEnd = () => {
      setDragging(false);
      setDragType(null);
    };

    window.addEventListener("mousemove", onMove, { passive: false });
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [dragging, dragType, dragStart, cropStart, constrainCrop]);

  // Calculate actual crop dimensions in original image coordinates
  const scaleX = naturalWidth / displayWidth;
  const scaleY = naturalHeight / displayHeight;
  const actualCropX = Math.round(crop.x * scaleX);
  const actualCropY = Math.round(crop.y * scaleY);
  const actualCropW = Math.round(crop.w * scaleX);
  const actualCropH = Math.round(crop.h * scaleY);

  const applyCrop = async () => {
    if (!file || !imageUrl || actualCropW <= 0 || actualCropH <= 0) return;

    const img = new Image();
    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(decodeErrorMessage(file)));
        img.src = imageUrl;
      });
    } catch (err) {
      setSizeWarning(err instanceof Error ? err.message : decodeErrorMessage(file));
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = actualCropW;
    canvas.height = actualCropH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Determine output mime
    let mime: string;
    if (outputFormat === "original") {
      mime = originalOutputMime(file.type);
    } else {
      mime = outputFormat === "png" ? "image/png" : "image/jpeg";
    }

    // Fill white background for JPEG
    if (mime === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, actualCropX, actualCropY, actualCropW, actualCropH, 0, 0, actualCropW, actualCropH);

    const qualityParam = mime === "image/png" ? undefined : 0.92;

    let blob: Blob;
    try {
      blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => { if (b) resolve(b); else reject(new Error("Failed to crop")); },
          mime,
          qualityParam
        );
      });
    } catch {
      setSizeWarning(`Couldn't crop ${file.name}. Try a smaller crop area or a different image.`);
      return;
    }

    if (croppedUrl) URL.revokeObjectURL(croppedUrl);
    const url = URL.createObjectURL(blob);
    setCroppedUrl(url);
    setCroppedBlob(blob);
    canvas.width = 0;
    canvas.height = 0;
  };

  const downloadCropped = () => {
    if (!croppedUrl || !croppedBlob || !file) return;
    // Name the file after the bytes we actually produced, not the current dropdown value.
    const ext = extFromMime(croppedBlob.type);
    const a = document.createElement("a");
    a.href = croppedUrl;
    a.download = baseName(file.name) + `-cropped.${ext}`;
    a.click();
  };

  const resetAll = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (croppedUrl) URL.revokeObjectURL(croppedUrl);
    setFile(null);
    setImageUrl(null);
    setImageLoaded(false);
    setCroppedUrl(null);
    setCroppedBlob(null);
    setAspectRatio("free");
    setSizeWarning(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // Handle styles
  const handleSize = 10;
  const handleStyle = (cursor: string): React.CSSProperties => ({
    position: "absolute",
    width: handleSize,
    height: handleSize,
    background: "#fff",
    border: "2px solid var(--primary)",
    borderRadius: "2px",
    cursor,
    zIndex: 10,
    touchAction: "none",
  });

  return (
    <ErrorBoundary>
    <ToolLayout
      slug="image-crop"
      title="Crop Image Online"
      description="Crop images to any size with an easy drag-and-drop interface. Aspect ratio presets for social media. Free online tool."
      faqs={[
        { question: "Which aspect ratios are available?", answer: "You can crop freely or lock the crop box to a preset ratio such as 1:1 for profile and Instagram photos or 16:9 for video thumbnails." },
        { question: "Will cropping reduce quality?", answer: "The cropped area is copied at its original pixel size. PNG output keeps full detail; JPG output is saved at high quality (92%)." },
        { question: "What output format do I get?", answer: "Choose Original, JPG or PNG. Original keeps PNG and WebP as they are and saves other formats as JPG." },
        { question: "Can I crop a photo to a passport or form size?", answer: "Crop to the shape you need here, then use the Image Resizer to set exact pixel dimensions or a compress-to-KB tool to get under a file size limit." },
      ]}
    >
      {sizeWarning && (
        <div style={{
          padding: "0.75rem 1rem", marginBottom: "1rem",
          background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.3)",
          borderRadius: "0.5rem", fontSize: "0.85rem", color: "#b45309",
        }}>
          {sizeWarning}
        </div>
      )}

      {!file ? (
        <div data-dropzone="true"
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files); }}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file"; input.accept = "image/*";
            input.onchange = () => handleFile(input.files); input.click();
          }}
          style={{
            border: `2px dashed ${dragOver ? "var(--primary)" : "var(--card-border)"}`,
            borderRadius: "1rem", padding: "3rem 2rem", textAlign: "center",
            cursor: "pointer", background: dragOver ? "rgba(37,99,235,0.04)" : "var(--card-bg)", transition: "all 0.2s",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>&#9986;</div>
          <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop an image here or click to browse</p>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>Supports JPG, PNG, WebP, BMP, GIF</p>
        </div>
      ) : (
        <div style={{ marginTop: "0" }}>
          {/* Controls */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem", marginBottom: "1rem",
            padding: "1rem", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "0.5rem",
          }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => handleAspectChange(e.target.value as AspectRatio)}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "0.3rem", border: "1px solid var(--card-border)", background: "var(--card-bg)", fontSize: "0.85rem" }}
              >
                <option value="free">Free</option>
                <option value="1:1">1:1 (Square)</option>
                <option value="4:3">4:3</option>
                <option value="16:9">16:9</option>
                <option value="3:2">3:2</option>
                <option value="2:3">2:3 (Portrait)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>Crop Size</label>
              <div style={{ fontSize: "0.85rem", padding: "0.5rem 0" }}>
                <span style={{ fontWeight: 600 }}>{actualCropW}</span>
                <span style={{ color: "var(--muted)" }}> x </span>
                <span style={{ fontWeight: 600 }}>{actualCropH}</span>
                <span style={{ color: "var(--muted)" }}> px</span>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>Output Format</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as "original" | "jpeg" | "png")}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "0.3rem", border: "1px solid var(--card-border)", background: "var(--card-bg)", fontSize: "0.85rem" }}
              >
                <option value="original">Keep Original</option>
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
              </select>
            </div>
          </div>

          {/* Image with crop overlay */}
          <div
            ref={containerRef}
            style={{
              position: "relative",
              display: "inline-block",
              maxWidth: "100%",
              cursor: dragging ? (dragType === "move" ? "grabbing" : "crosshair") : "default",
              userSelect: "none",
              touchAction: "none",
              lineHeight: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageUrl!}
              alt="Image to crop"
              onLoad={onImageLoad}
              onError={() => {
                const failed = file;
                resetAll();
                if (failed) setSizeWarning(decodeErrorMessage(failed));
              }}
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                display: "block",
              }}
            />

            {imageLoaded && displayWidth > 0 && (
              <>
                {/* Dark overlays outside crop area */}
                {/* Top */}
                <div style={{ position: "absolute", top: 0, left: 0, width: displayWidth, height: crop.y, background: "rgba(0,0,0,0.5)", pointerEvents: "none" }} />
                {/* Bottom */}
                <div style={{ position: "absolute", top: crop.y + crop.h, left: 0, width: displayWidth, height: displayHeight - crop.y - crop.h, background: "rgba(0,0,0,0.5)", pointerEvents: "none" }} />
                {/* Left */}
                <div style={{ position: "absolute", top: crop.y, left: 0, width: crop.x, height: crop.h, background: "rgba(0,0,0,0.5)", pointerEvents: "none" }} />
                {/* Right */}
                <div style={{ position: "absolute", top: crop.y, left: crop.x + crop.w, width: displayWidth - crop.x - crop.w, height: crop.h, background: "rgba(0,0,0,0.5)", pointerEvents: "none" }} />

                {/* Crop border */}
                <div
                  style={{
                    position: "absolute",
                    left: crop.x,
                    top: crop.y,
                    width: crop.w,
                    height: crop.h,
                    border: "2px solid #fff",
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.3)",
                    cursor: "grab",
                    touchAction: "none",
                  }}
                  onMouseDown={(e) => startDrag(e, "move")}
                  onTouchStart={(e) => startDrag(e, "move")}
                >
                  {/* Rule of thirds grid lines */}
                  <div style={{ position: "absolute", left: "33.33%", top: 0, width: "1px", height: "100%", background: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", left: "66.66%", top: 0, width: "1px", height: "100%", background: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", top: "33.33%", left: 0, width: "100%", height: "1px", background: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", top: "66.66%", left: 0, width: "100%", height: "1px", background: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
                </div>

                {/* Corner handles */}
                <div style={{ ...handleStyle("nw-resize"), left: crop.x - handleSize / 2, top: crop.y - handleSize / 2 }}
                  onMouseDown={(e) => startDrag(e, "nw")} onTouchStart={(e) => startDrag(e, "nw")} />
                <div style={{ ...handleStyle("ne-resize"), left: crop.x + crop.w - handleSize / 2, top: crop.y - handleSize / 2 }}
                  onMouseDown={(e) => startDrag(e, "ne")} onTouchStart={(e) => startDrag(e, "ne")} />
                <div style={{ ...handleStyle("sw-resize"), left: crop.x - handleSize / 2, top: crop.y + crop.h - handleSize / 2 }}
                  onMouseDown={(e) => startDrag(e, "sw")} onTouchStart={(e) => startDrag(e, "sw")} />
                <div style={{ ...handleStyle("se-resize"), left: crop.x + crop.w - handleSize / 2, top: crop.y + crop.h - handleSize / 2 }}
                  onMouseDown={(e) => startDrag(e, "se")} onTouchStart={(e) => startDrag(e, "se")} />

                {/* Edge handles */}
                <div style={{ ...handleStyle("n-resize"), left: crop.x + crop.w / 2 - handleSize / 2, top: crop.y - handleSize / 2 }}
                  onMouseDown={(e) => startDrag(e, "n")} onTouchStart={(e) => startDrag(e, "n")} />
                <div style={{ ...handleStyle("s-resize"), left: crop.x + crop.w / 2 - handleSize / 2, top: crop.y + crop.h - handleSize / 2 }}
                  onMouseDown={(e) => startDrag(e, "s")} onTouchStart={(e) => startDrag(e, "s")} />
                <div style={{ ...handleStyle("w-resize"), left: crop.x - handleSize / 2, top: crop.y + crop.h / 2 - handleSize / 2 }}
                  onMouseDown={(e) => startDrag(e, "w")} onTouchStart={(e) => startDrag(e, "w")} />
                <div style={{ ...handleStyle("e-resize"), left: crop.x + crop.w - handleSize / 2, top: crop.y + crop.h / 2 - handleSize / 2 }}
                  onMouseDown={(e) => startDrag(e, "e")} onTouchStart={(e) => startDrag(e, "e")} />
              </>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <button onClick={applyCrop} className="btn-primary"
              style={{ padding: "0.6rem 1.5rem", fontSize: "0.95rem", fontWeight: 700 }}>
              Apply Crop
            </button>
            <button onClick={() => {
              const input = document.createElement("input");
              input.type = "file"; input.accept = "image/*";
              input.onchange = () => handleFile(input.files); input.click();
            }} className="btn-secondary" style={{ padding: "0.6rem 1rem", fontSize: "0.85rem" }}>
              Change Image
            </button>
            <button onClick={resetAll}
              className="btn-secondary" style={{ padding: "0.6rem 1rem", fontSize: "0.85rem", color: "#ef4444" }}>
              Clear
            </button>
          </div>

          {/* Cropped result */}
          {croppedUrl && croppedBlob && (
            <div style={{
              marginTop: "1.5rem", padding: "1rem",
              background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "0.5rem",
            }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>Cropped Result</h3>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{
                  maxWidth: "300px", borderRadius: "0.25rem", overflow: "hidden",
                  background: "repeating-conic-gradient(#f0f0f0 0% 25%, #fff 0% 50%) 50% / 16px 16px",
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={croppedUrl} alt="Cropped result" style={{ maxWidth: "100%", display: "block" }} />
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                    <span style={{ color: "var(--muted)" }}>Dimensions: </span>
                    <span style={{ fontWeight: 600 }}>{actualCropW} x {actualCropH} px</span>
                  </div>
                  <div style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                    <span style={{ color: "var(--muted)" }}>Size: </span>
                    <span style={{ fontWeight: 600 }}>{formatSize(croppedBlob.size)}</span>
                    <span style={{ color: "var(--muted)" }}> (original: {formatSize(file?.size || 0)})</span>
                  </div>
                  <button onClick={downloadCropped}
                    style={{
                      padding: "0.6rem 1.5rem", border: "none", borderRadius: "0.5rem",
                      background: "#22c55e", color: "#fff", cursor: "pointer",
                      fontSize: "0.95rem", fontWeight: 700,
                    }}>
                    Download Cropped Image
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          How to Crop Images Online
        </h2>
        <p>
          Upload any image and use the interactive crop tool to select exactly the area you want. Drag the
          crop rectangle to reposition it, or drag the corner and edge handles to resize. Choose from aspect
          ratio presets like 1:1 for Instagram, 16:9 for YouTube thumbnails, or use free-form cropping for
          custom dimensions. The rule-of-thirds grid helps you compose your crop perfectly. Click
          &ldquo;Apply Crop&rdquo; to see the result and download it. All processing happens in your
          browser &mdash; your images are never uploaded to any server.
        </p>
      </section>
    </ToolLayout>
    </ErrorBoundary>
  );
}
