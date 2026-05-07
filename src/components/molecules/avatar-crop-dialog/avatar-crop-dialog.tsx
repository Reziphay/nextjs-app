"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  Button,
} from "@/components/atoms";
import { Icon } from "@/components/icon";
import { useLocale } from "@/components/providers/locale-provider";
import styles from "./avatar-crop-dialog.module.css";

type AvatarCropDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (file: File) => Promise<void> | void;
  aspectRatio?: "1:1" | "16:9";
  // Profile avatar variant — pass imageSrc + imageName
  imageName?: string;
  imageSrc?: string | null;
  onChooseDifferentPicture?: () => void;
  // General variant — pass file directly (URL lifecycle managed internally)
  file?: File;
};

type Offset = { x: number; y: number };

const OUTPUT = {
  "1:1": { width: 512, height: 512 },
  "16:9": { width: 1280, height: 720 },
} as const;

const minimumZoom = 1;
const maximumZoom = 3;
const zoomStep = 0.01;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getImageNaturalSize(image: HTMLImageElement) {
  return {
    width: image.naturalWidth || 1,
    height: image.naturalHeight || 1,
  };
}

function getDisplaySize(
  frameWidth: number,
  frameHeight: number,
  imageWidth: number,
  imageHeight: number,
  zoom: number,
) {
  const baseScale = Math.max(frameWidth / imageWidth, frameHeight / imageHeight);
  return {
    width: imageWidth * baseScale * zoom,
    height: imageHeight * baseScale * zoom,
  };
}

function constrainOffset(
  nextOffset: Offset,
  frameWidth: number,
  frameHeight: number,
  imageWidth: number,
  imageHeight: number,
  zoom: number,
): Offset {
  const displaySize = getDisplaySize(frameWidth, frameHeight, imageWidth, imageHeight, zoom);
  const maxX = Math.max(0, (displaySize.width - frameWidth) / 2);
  const maxY = Math.max(0, (displaySize.height - frameHeight) / 2);
  return {
    x: clamp(nextOffset.x, -maxX, maxX),
    y: clamp(nextOffset.y, -maxY, maxY),
  };
}

function makeOutputFileName(name: string, aspectRatio: "1:1" | "16:9") {
  const base = name.replace(/\.[^/.]+$/, "").trim() || "image";
  const ext = aspectRatio === "1:1" ? "png" : "jpg";
  return `${base}-crop.${ext}`;
}

export function AvatarCropDialog({
  open,
  onClose,
  onConfirm,
  aspectRatio = "1:1",
  imageName,
  imageSrc,
  onChooseDifferentPicture,
  file,
}: AvatarCropDialogProps) {
  const { messages } = useLocale();
  const p = messages.profile;

  const cropFrameRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const pointerStartRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    offset: Offset;
  } | null>(null);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Manage object URL when a File is passed directly
  const [fileSrc, setFileSrc] = useState<string | null>(null);
  useEffect(() => {
    if (!file) { setFileSrc(null); return; }
    const url = URL.createObjectURL(file);
    setFileSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const effectiveSrc = file ? fileSrc : (imageSrc ?? null);
  const effectiveName = file ? (file.name) : (imageName ?? "image");

  useEffect(() => {
    if (!open) {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setIsDragging(false);
      setIsProcessing(false);
      pointerStartRef.current = null;
    }
  }, [open, effectiveSrc]);

  const zoomLabel = useMemo(() => `${Math.round(zoom * 100)}%`, [zoom]);

  function getFrameDimensions() {
    const el = cropFrameRef.current;
    return {
      width: el?.clientWidth ?? OUTPUT[aspectRatio].width,
      height: el?.clientHeight ?? OUTPUT[aspectRatio].height,
    };
  }

  function handleImageLoad() {
    if (!imageRef.current) return;
    setImageSize(getImageNaturalSize(imageRef.current));
    setOffset({ x: 0, y: 0 });
    setZoom(1);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!effectiveSrc || isProcessing) return;
    pointerStartRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offset,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const state = pointerStartRef.current;
    if (!state || state.pointerId !== event.pointerId) return;
    const { width, height } = getFrameDimensions();
    const nextOffset = constrainOffset(
      {
        x: state.offset.x + (event.clientX - state.startX),
        y: state.offset.y + (event.clientY - state.startY),
      },
      width,
      height,
      imageSize.width,
      imageSize.height,
      zoom,
    );
    setOffset(nextOffset);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (pointerStartRef.current?.pointerId !== event.pointerId) return;
    pointerStartRef.current = null;
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function handleZoomChange(nextZoom: number) {
    const { width, height } = getFrameDimensions();
    const constrainedOffset = constrainOffset(
      offset,
      width,
      height,
      imageSize.width,
      imageSize.height,
      nextZoom,
    );
    setZoom(nextZoom);
    setOffset(constrainedOffset);
  }

  function handleZoomStep(direction: -1 | 1) {
    const nextZoom = clamp(
      Number((zoom + direction * 0.1).toFixed(2)),
      minimumZoom,
      maximumZoom,
    );
    handleZoomChange(nextZoom);
  }

  async function handleConfirm() {
    if (!effectiveSrc || !imageRef.current || !cropFrameRef.current) return;
    setIsProcessing(true);
    try {
      const { width: frameWidth, height: frameHeight } = getFrameDimensions();
      const output = OUTPUT[aspectRatio];
      const displaySize = getDisplaySize(frameWidth, frameHeight, imageSize.width, imageSize.height, zoom);
      const ratioX = output.width / frameWidth;
      const ratioY = output.height / frameHeight;

      const canvas = document.createElement("canvas");
      canvas.width = output.width;
      canvas.height = output.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("CROP_EXPORT_FAILED");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(
        imageRef.current,
        ((output.width - displaySize.width * ratioX) / 2) + offset.x * ratioX,
        ((output.height - displaySize.height * ratioY) / 2) + offset.y * ratioY,
        displaySize.width * ratioX,
        displaySize.height * ratioY,
      );

      const mimeType = aspectRatio === "1:1" ? "image/png" : "image/jpeg";
      const quality = aspectRatio === "1:1" ? 0.95 : 0.92;
      const fileName = makeOutputFileName(effectiveName, aspectRatio);

      await new Promise<void>((resolve, reject) => {
        canvas.toBlob(
          async (blob) => {
            if (!blob) { reject(new Error("CROP_EXPORT_FAILED")); return; }
            const outFile = new File([blob], fileName, { type: mimeType, lastModified: Date.now() });
            try { await onConfirm(outFile); resolve(); }
            catch (e) { reject(e); }
          },
          mimeType,
          quality,
        );
      });

      onClose();
    } finally {
      setIsProcessing(false);
    }
  }

  const isWide = aspectRatio === "16:9";

  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <AlertDialogContent className={styles.content}>
        <div className={styles.header}>
          <Button
            variant="unstyled"
            type="button"
            className={styles.closeButton}
            aria-label={p.cropPhotoCancel}
            onClick={onClose}
          >
            <Icon icon="close" size={18} color="white" />
          </Button>
          <AlertDialogTitle className={styles.title}>
            {p.cropPhotoTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className={styles.description}>
            {p.cropPhotoDescription}
          </AlertDialogDescription>
        </div>

        <div className={styles.body}>
          <div className={styles.cropStage}>
            <div className={styles.cropAreaShell}>
              <div
                ref={cropFrameRef}
                className={`${styles.cropArea} ${isWide ? styles.cropAreaWide : ""}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                {effectiveSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    ref={imageRef}
                    className={`${styles.cropImage} ${isDragging ? styles.dragging : ""}`}
                    src={effectiveSrc}
                    alt={p.photoAlt}
                    draggable={false}
                    onLoad={handleImageLoad}
                    style={{
                      transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                    }}
                  />
                ) : null}
                <div className={styles.cropGrid} />
              </div>
            </div>
          </div>

          <div className={styles.controls}>
            <p className={styles.hint}>{p.cropPhotoHint}</p>
            <div className={styles.rangeLabelRow}>
              <span className={styles.rangeLabel}>{p.cropPhotoZoom}</span>
              <span className={styles.zoomValue}>{zoomLabel}</span>
            </div>

            <div className={styles.rangeControls}>
              <Button
                variant="unstyled"
                type="button"
                className={styles.zoomButton}
                aria-label={`${p.cropPhotoZoom} -`}
                onClick={() => handleZoomStep(-1)}
              >
                <Icon icon="remove" size={16} color="white" />
              </Button>
              <input
                className={styles.rangeInput}
                type="range"
                min={minimumZoom}
                max={maximumZoom}
                step={zoomStep}
                value={zoom}
                onChange={(event) => handleZoomChange(Number(event.target.value))}
              />
              <Button
                variant="unstyled"
                type="button"
                className={styles.zoomButton}
                aria-label={`${p.cropPhotoZoom} +`}
                onClick={() => handleZoomStep(1)}
              >
                <Icon icon="add" size={16} color="white" />
              </Button>
            </div>
          </div>

          {onChooseDifferentPicture && (
            <Button
              variant="unstyled"
              type="button"
              className={styles.changePicture}
              onClick={onChooseDifferentPicture}
            >
              {p.changePhoto}
            </Button>
          )}
        </div>

        <div className={styles.footer}>
          <Button
            variant="outline"
            type="button"
            className={styles.cancelButton}
            disabled={isProcessing}
            onClick={onClose}
          >
            {p.cropPhotoCancel}
          </Button>
          <Button
            variant="primary"
            disabled={!effectiveSrc || isProcessing}
            className={styles.confirmButton}
            onClick={(event) => {
              event.preventDefault();
              void handleConfirm();
            }}
          >
            {isProcessing ? p.cropPhotoProcessing : p.cropPhotoConfirm}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
