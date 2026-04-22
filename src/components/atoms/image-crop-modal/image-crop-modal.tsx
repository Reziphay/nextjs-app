"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/atoms/button";
import styles from "./image-crop-modal.module.css";

type ImageCropModalProps = {
  file: File;
  aspectRatio: "1:1" | "16:9";
  onCrop: (croppedFile: File) => void;
  onCancel: () => void;
};

const VP_W = 360;
const OUTPUT = { "1:1": [400, 400], "16:9": [1280, 720] } as const;

export function ImageCropModal({ file, aspectRatio, onCrop, onCancel }: ImageCropModalProps) {
  const vpH = aspectRatio === "1:1" ? VP_W : Math.round(VP_W * 9 / 16);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  const [src] = useState(() => URL.createObjectURL(file));
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(1);

  useEffect(() => () => URL.revokeObjectURL(src), [src]);

  const clamp = useCallback(
    (x: number, y: number, s: number, nw: number, nh: number) => ({
      x: Math.min(0, Math.max(VP_W - nw * s, x)),
      y: Math.min(0, Math.max(vpH - nh * s, y)),
    }),
    [vpH],
  );

  const handleLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    const s = Math.max(VP_W / nw, vpH / nh);
    setNat({ w: nw, h: nh });
    setMinScale(s);
    setScale(s);
    setPos({ x: (VP_W - nw * s) / 2, y: (vpH - nh * s) / 2 });
  }, [vpH]);

  // Mouse drag
  useEffect(() => {
    if (!nat) return;
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { sx, sy, px, py } = dragRef.current;
      setPos(clamp(px + e.clientX - sx, py + e.clientY - sy, scale, nat.w, nat.h));
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [nat, scale, clamp]);

  // Touch drag (passive: false to allow preventDefault)
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || !nat) return;
    const onTouchMove = (e: TouchEvent) => {
      if (!touchRef.current) return;
      e.preventDefault();
      const t = e.touches[0];
      const dx = t.clientX - touchRef.current.x;
      const dy = t.clientY - touchRef.current.y;
      touchRef.current = { x: t.clientX, y: t.clientY };
      setPos((prev) => clamp(prev.x + dx, prev.y + dy, scale, nat.w, nat.h));
    };
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", onTouchMove);
  }, [nat, scale, clamp]);

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y };
  }

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  }

  function onZoom(e: React.ChangeEvent<HTMLInputElement>) {
    if (!nat) return;
    const s = parseFloat(e.target.value);
    setScale(s);
    setPos((prev) => clamp(prev.x, prev.y, s, nat.w, nat.h));
  }

  function handleCrop() {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !nat) return;

    const [outW, outH] = OUTPUT[aspectRatio];
    canvas.width = outW;
    canvas.height = outH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const srcX = -pos.x / scale;
    const srcY = -pos.y / scale;
    const srcW = VP_W / scale;
    const srcH = vpH / scale;

    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outW, outH);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const baseName = file.name.replace(/\.[^.]+$/, "");
        onCrop(new File([blob], `${baseName}.jpg`, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92,
    );
  }

  const portal = typeof document !== "undefined" ? document.body : null;
  if (!portal) return null;

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <p className={styles.title}>Crop Image</p>
          <p className={styles.subtitle}>
            {aspectRatio === "1:1" ? "Square 1:1" : "Widescreen 16:9"} — drag to reposition, slider to zoom
          </p>
        </div>

        <div
          ref={viewportRef}
          className={styles.viewport}
          style={{ width: VP_W, height: vpH }}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={src}
            alt=""
            draggable={false}
            onLoad={handleLoad}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: nat ? nat.w * scale : "auto",
              height: nat ? nat.h * scale : "auto",
              transform: `translate(${pos.x}px, ${pos.y}px)`,
              transformOrigin: "top left",
              userSelect: "none",
              pointerEvents: "none",
              opacity: nat ? 1 : 0,
              transition: nat ? "none" : "opacity 0.2s",
            }}
          />
        </div>

        <div className={styles.zoomRow}>
          <span className={styles.zoomLabel}>Zoom</span>
          <input
            type="range"
            className={styles.slider}
            min={minScale}
            max={minScale * 3}
            step={0.001}
            value={scale}
            disabled={!nat}
            onChange={onZoom}
          />
        </div>

        <div className={styles.footer}>
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" type="button" disabled={!nat} onClick={handleCrop}>
            Crop & Save
          </Button>
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>,
    portal,
  );
}
