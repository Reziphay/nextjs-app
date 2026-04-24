"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/atoms/button";
import styles from "./image-crop-modal.module.css";

type ImageCropModalProps = {
  file: File;
  aspectRatio: "1:1" | "16:9";
  onCrop: (croppedFile: File) => void;
  onCancel: () => void;
};

type Offset = {
  x: number;
  y: number;
};

const VIEWPORT_WIDTH = 360;
const OUTPUT = {
  "1:1": { width: 400, height: 400 },
  "16:9": { width: 1280, height: 720 },
} as const;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.01;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getViewportHeight(aspectRatio: ImageCropModalProps["aspectRatio"]) {
  return aspectRatio === "1:1"
    ? VIEWPORT_WIDTH
    : Math.round((VIEWPORT_WIDTH * 9) / 16);
}

function getImageNaturalSize(image: HTMLImageElement) {
  return {
    width: image.naturalWidth || 1,
    height: image.naturalHeight || 1,
  };
}

function getDisplaySize(
  viewportWidth: number,
  viewportHeight: number,
  imageWidth: number,
  imageHeight: number,
  zoom: number,
) {
  const baseScale = Math.max(
    viewportWidth / imageWidth,
    viewportHeight / imageHeight,
  );

  return {
    width: imageWidth * baseScale * zoom,
    height: imageHeight * baseScale * zoom,
    scale: baseScale * zoom,
  };
}

function constrainOffset(
  nextOffset: Offset,
  viewportWidth: number,
  viewportHeight: number,
  imageWidth: number,
  imageHeight: number,
  zoom: number,
) {
  const displaySize = getDisplaySize(
    viewportWidth,
    viewportHeight,
    imageWidth,
    imageHeight,
    zoom,
  );
  const maxX = Math.max(0, (displaySize.width - viewportWidth) / 2);
  const maxY = Math.max(0, (displaySize.height - viewportHeight) / 2);

  return {
    x: clamp(nextOffset.x, -maxX, maxX),
    y: clamp(nextOffset.y, -maxY, maxY),
  };
}

export function ImageCropModal({
  file,
  aspectRatio,
  onCrop,
  onCancel,
}: ImageCropModalProps) {
  const viewportHeight = getViewportHeight(aspectRatio);
  const outputSize = OUTPUT[aspectRatio];
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerStartRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    offset: Offset;
  } | null>(null);
  const [src] = useState(() => URL.createObjectURL(file));
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => () => URL.revokeObjectURL(src), [src]);

  const displaySize = useMemo(
    () =>
      getDisplaySize(
        VIEWPORT_WIDTH,
        viewportHeight,
        imageSize.width,
        imageSize.height,
        zoom,
      ),
    [imageSize.height, imageSize.width, viewportHeight, zoom],
  );

  function handleImageLoad() {
    if (!imageRef.current) {
      return;
    }

    setImageSize(getImageNaturalSize(imageRef.current));
    setOffset({ x: 0, y: 0 });
    setZoom(MIN_ZOOM);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
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

    const nextOffset = constrainOffset(
      {
        x: state.offset.x + (event.clientX - state.startX),
        y: state.offset.y + (event.clientY - state.startY),
      },
      VIEWPORT_WIDTH,
      viewportHeight,
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
    const constrainedOffset = constrainOffset(
      offset,
      VIEWPORT_WIDTH,
      viewportHeight,
      imageSize.width,
      imageSize.height,
      nextZoom,
    );

    setZoom(nextZoom);
    setOffset(constrainedOffset);
  }

  function handleZoomInput(event: ChangeEvent<HTMLInputElement>) {
    handleZoomChange(parseFloat(event.target.value));
  }

  function handleCrop() {
    const image = imageRef.current;
    const canvas = canvasRef.current;

    if (!image || !canvas) {
      return;
    }

    canvas.width = outputSize.width;
    canvas.height = outputSize.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const left = (VIEWPORT_WIDTH - displaySize.width) / 2 + offset.x;
    const top = (viewportHeight - displaySize.height) / 2 + offset.y;
    const srcX = -left / displaySize.scale;
    const srcY = -top / displaySize.scale;
    const srcWidth = VIEWPORT_WIDTH / displaySize.scale;
    const srcHeight = viewportHeight / displaySize.scale;

    ctx.drawImage(
      image,
      srcX,
      srcY,
      srcWidth,
      srcHeight,
      0,
      0,
      outputSize.width,
      outputSize.height,
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          return;
        }

        const baseName = file.name.replace(/\.[^.]+$/, "");
        onCrop(new File([blob], `${baseName}.jpg`, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92,
    );
  }

  const portal = typeof document !== "undefined" ? document.body : null;
  if (!portal) {
    return null;
  }

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <p className={styles.title}>Crop Image</p>
          <p className={styles.subtitle}>
            {aspectRatio === "1:1" ? "Square 1:1" : "Widescreen 16:9"} - drag to
            reposition, slider to zoom
          </p>
        </div>

        <div
          ref={viewportRef}
          className={styles.viewport}
          style={{ width: VIEWPORT_WIDTH, height: viewportHeight }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            src={src}
            alt=""
            draggable={false}
            onLoad={handleImageLoad}
            className={`${styles.image} ${isDragging ? styles.imageDragging : ""}`}
            style={{
              width: `${displaySize.width}px`,
              height: `${displaySize.height}px`,
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
            }}
          />
        </div>

        <div className={styles.zoomRow}>
          <span className={styles.zoomLabel}>Zoom</span>
          <input
            type="range"
            className={styles.slider}
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={ZOOM_STEP}
            value={zoom}
            onChange={handleZoomInput}
          />
        </div>

        <div className={styles.footer}>
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" type="button" onClick={handleCrop}>
            Crop & Save
          </Button>
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>,
    portal,
  );
}
