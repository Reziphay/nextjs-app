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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/atoms";
import { useLocale } from "@/components/providers/locale-provider";
import styles from "./avatar-crop-dialog.module.css";

type AvatarCropDialogProps = {
  imageName: string;
  imageSrc: string | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (file: File) => Promise<void> | void;
};

type Offset = {
  x: number;
  y: number;
};

const outputSize = 512;
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
  frameSize: number,
  imageWidth: number,
  imageHeight: number,
  zoom: number,
) {
  const baseScale = Math.max(frameSize / imageWidth, frameSize / imageHeight);

  return {
    width: imageWidth * baseScale * zoom,
    height: imageHeight * baseScale * zoom,
  };
}

function constrainOffset(
  nextOffset: Offset,
  frameSize: number,
  imageWidth: number,
  imageHeight: number,
  zoom: number,
) {
  const displaySize = getDisplaySize(frameSize, imageWidth, imageHeight, zoom);
  const maxX = Math.max(0, (displaySize.width - frameSize) / 2);
  const maxY = Math.max(0, (displaySize.height - frameSize) / 2);

  return {
    x: clamp(nextOffset.x, -maxX, maxX),
    y: clamp(nextOffset.y, -maxY, maxY),
  };
}

function makeAvatarFileName(imageName: string) {
  const baseName = imageName.replace(/\.[^/.]+$/, "").trim() || "avatar";
  return `${baseName}-avatar.png`;
}

function canvasToFile(canvas: HTMLCanvasElement, fileName: string) {
  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("AVATAR_CROP_EXPORT_FAILED"));
          return;
        }

        resolve(
          new File([blob], fileName, {
            type: "image/png",
            lastModified: Date.now(),
          }),
        );
      },
      "image/png",
      0.95,
    );
  });
}

export function AvatarCropDialog({
  imageName,
  imageSrc,
  open,
  onClose,
  onConfirm,
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

  useEffect(() => {
    if (!open) {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setIsDragging(false);
      setIsProcessing(false);
      pointerStartRef.current = null;
    }
  }, [open, imageSrc]);

  const zoomLabel = useMemo(() => `${Math.round(zoom * 100)}%`, [zoom]);

  function getFrameSize() {
    return cropFrameRef.current?.clientWidth ?? outputSize;
  }

  function handleImageLoad() {
    if (!imageRef.current) {
      return;
    }

    setImageSize(getImageNaturalSize(imageRef.current));
    setOffset({ x: 0, y: 0 });
    setZoom(1);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!imageSrc || isProcessing) {
      return;
    }

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

    if (!state || state.pointerId !== event.pointerId) {
      return;
    }

    const frameSize = getFrameSize();
    const nextOffset = constrainOffset(
      {
        x: state.offset.x + (event.clientX - state.startX),
        y: state.offset.y + (event.clientY - state.startY),
      },
      frameSize,
      imageSize.width,
      imageSize.height,
      zoom,
    );

    setOffset(nextOffset);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (pointerStartRef.current?.pointerId !== event.pointerId) {
      return;
    }

    pointerStartRef.current = null;
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function handleZoomChange(nextZoom: number) {
    const frameSize = getFrameSize();
    const constrainedOffset = constrainOffset(
      offset,
      frameSize,
      imageSize.width,
      imageSize.height,
      nextZoom,
    );

    setZoom(nextZoom);
    setOffset(constrainedOffset);
  }

  async function handleConfirm() {
    if (!imageSrc || !imageRef.current || !cropFrameRef.current) {
      return;
    }

    setIsProcessing(true);

    try {
      const frameSize = cropFrameRef.current.clientWidth;
      const displaySize = getDisplaySize(
        frameSize,
        imageSize.width,
        imageSize.height,
        zoom,
      );
      const ratio = outputSize / frameSize;
      const canvas = document.createElement("canvas");
      canvas.width = outputSize;
      canvas.height = outputSize;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("AVATAR_CROP_EXPORT_FAILED");
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";

      context.drawImage(
        imageRef.current,
        ((outputSize - displaySize.width * ratio) / 2) + offset.x * ratio,
        ((outputSize - displaySize.height * ratio) / 2) + offset.y * ratio,
        displaySize.width * ratio,
        displaySize.height * ratio,
      );

      const file = await canvasToFile(canvas, makeAvatarFileName(imageName));
      await onConfirm(file);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <AlertDialogContent className={styles.content}>
        <AlertDialogHeader>
          <AlertDialogTitle>{p.cropPhotoTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {p.cropPhotoDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className={styles.body}>
          <div className={styles.cropAreaShell}>
            <div
              ref={cropFrameRef}
              className={styles.cropArea}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  ref={imageRef}
                  className={`${styles.cropImage} ${isDragging ? styles.dragging : ""}`}
                  src={imageSrc}
                  alt={p.photoAlt}
                  draggable={false}
                  onLoad={handleImageLoad}
                  style={{
                    transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                  }}
                />
              ) : null}
            </div>

            <p className={styles.hint}>{p.cropPhotoHint}</p>
          </div>

          <div className={styles.controls}>
            <div className={styles.rangeLabelRow}>
              <span className={styles.rangeLabel}>{p.cropPhotoZoom}</span>
              <span className={styles.zoomValue}>{zoomLabel}</span>
            </div>

            <input
              className={styles.rangeInput}
              type="range"
              min={minimumZoom}
              max={maximumZoom}
              step={zoomStep}
              value={zoom}
              onChange={(event) => handleZoomChange(Number(event.target.value))}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>
            {p.cropPhotoCancel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!imageSrc || isProcessing}
            onClick={(event) => {
              event.preventDefault();
              void handleConfirm();
            }}
          >
            {isProcessing ? p.cropPhotoProcessing : p.cropPhotoConfirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
