import { useState, useRef } from "react";
import { Camera, Upload, PawPrint } from "lucide-react";

interface AvatarDropzoneProps {
  initials: string;
  size?: number;
  onImageChange?: (dataUrl: string) => void;
  /** URL de imagem controlada externamente (ex: imageUrl do familiar salvo no estado global). */
  imageUrl?: string;
  /**
   * Quando true, o dropzone exibe o estado "sem familiar" (opacidade reduzida, ícone de pata).
   * Ainda é interativo — hover revela o overlay de câmera para indicar que é clicável.
   */
  dimmed?: boolean;
}

/**
 * Circular avatar that acts as a drag-and-drop / click-to-upload dropzone.
 * Shows initials when empty; renders the uploaded image when filled.
 *
 * Uses a depth counter instead of a boolean flag to avoid flickering when
 * the pointer moves over child elements inside the dropzone.
 */
export function AvatarDropzone({ initials, size = 96, onImageChange, imageUrl: externalImageUrl, dimmed = false }: AvatarDropzoneProps) {
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  const [dragDepth, setDragDepth] = useState(0);   // >0 means actively dragging over this zone
  const [isHovering, setIsHovering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Prefer the locally uploaded image; fall back to externally supplied URL
  const imageUrl = localImageUrl ?? externalImageUrl ?? null;

  const isDragging    = dragDepth > 0;
  const hasImage      = imageUrl !== null;
  const showOverlay   = isDragging || isHovering;
  const overlayIconSize = Math.max(14, Math.round(size * 0.24));
  const hintIconSize    = Math.max(8,  Math.round(size * 0.16));
  const initialsSize    = Math.round(size * 0.3);
  const showCornerHint  = !hasImage && !showOverlay && size >= 56;

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setLocalImageUrl(url);
      onImageChange?.(url);
    };
    reader.readAsDataURL(file);
  };

  // Border style encodes the drag / hover / empty states clearly
  const borderStyle: React.CSSProperties = isDragging
    ? { border: "2px dashed #c8102e", opacity: 0.9 }
    : isHovering
    ? { border: "2px solid rgba(200, 16, 46, 0.55)" }
    : hasImage
    ? { border: "2px solid #262626" }
    : dimmed
    ? { border: "2px dashed #3a3a3a", opacity: isHovering ? 1 : 0.3 }
    : { border: "2px dashed #3a3a3a" };

  return (
    <div
      style={{ width: size, height: size, ...borderStyle, borderRadius: "9999px" }}
      className="relative cursor-pointer flex-shrink-0 overflow-hidden transition-all duration-150 select-none"
      role="button"
      aria-label="Clique ou arraste uma imagem"
      onDragEnter={(e) => { e.preventDefault(); setDragDepth((d) => d + 1); }}
      onDragOver={(e)  => { e.preventDefault(); }}
      onDragLeave={()  => { setDragDepth((d) => Math.max(0, d - 1)); }}
      onDrop={(e) => {
        e.preventDefault();
        setDragDepth(0);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => inputRef.current?.click()}
    >
      {/* Base background */}
      <div className="absolute inset-0" style={{ background: "#1c1c1c" }} />

      {/* Uploaded image */}
      {hasImage && (
        <img src={imageUrl!} alt="avatar" className="absolute inset-0 w-full h-full object-cover" />
      )}

      {/* Initials fallback */}
      {!hasImage && (
        <div className="absolute inset-0 flex items-center justify-center">
          {dimmed && !showOverlay ? (
            <PawPrint
              size={Math.max(10, Math.round(size * 0.32))}
              strokeWidth={1.5}
              style={{ color: "#6a6a6a" }}
            />
          ) : (
            <span
              className="text-foreground"
              style={{ fontFamily: "var(--font-display)", fontSize: initialsSize, fontWeight: 700, letterSpacing: "0.04em" }}
            >
              {initials}
            </span>
          )}
        </div>
      )}

      {/* Hover / drag overlay */}
      {showOverlay && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-1 transition-all duration-150"
          style={{ background: isDragging ? "rgba(200,16,46,0.28)" : "rgba(0,0,0,0.60)" }}
        >
          {isDragging ? (
            <Upload size={overlayIconSize} strokeWidth={1.5} style={{ color: "#c8102e" }} />
          ) : (
            <Camera size={overlayIconSize} strokeWidth={1.5} style={{ color: "#ffffff" }} />
          )}
        </div>
      )}

      {/* Persistent upload hint at bottom-center */}
      {showCornerHint && (
        <div
          className="absolute flex items-center justify-center"
          style={{ bottom: Math.round(size * 0.06), left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }}
        >
          <Camera size={hintIconSize} strokeWidth={1.5} style={{ color: "#4a4a4a", opacity: 0.85 }} />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
