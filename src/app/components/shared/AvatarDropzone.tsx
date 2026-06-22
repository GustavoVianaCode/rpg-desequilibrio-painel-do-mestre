import { useState, useRef } from "react";
import { Camera } from "lucide-react";

interface AvatarDropzoneProps {
  initials: string;
  size?: number;
  onImageChange?: (dataUrl: string) => void;
}

/**
 * Circular avatar that acts as a drag-and-drop / click-to-upload dropzone.
 * Shows initials when empty; renders the uploaded image when filled.
 */
export function AvatarDropzone({ initials, size = 96, onImageChange }: AvatarDropzoneProps) {
  const [imageUrl, setImageUrl]     = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasImage   = imageUrl !== null;
  const showOverlay = isDragging || isHovering;
  const overlayIconSize = Math.max(14, Math.round(size * 0.24));
  const hintIconSize    = Math.max(8,  Math.round(size * 0.16));
  const initialsSize    = Math.round(size * 0.3);
  const showCornerHint  = !hasImage && !showOverlay && size >= 56;

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setImageUrl(url);
      onImageChange?.(url);
    };
    reader.readAsDataURL(file);
  };

  const borderStyle: React.CSSProperties = isDragging
    ? { border: "2px dashed #c8102e" }
    : isHovering
    ? { border: "2px solid rgba(200, 16, 46, 0.55)" }
    : hasImage
    ? { border: "2px solid #262626" }
    : { border: "2px dashed #3a3a3a" };

  return (
    <div
      style={{ width: size, height: size, ...borderStyle, borderRadius: "9999px" }}
      className="relative cursor-pointer flex-shrink-0 overflow-hidden transition-all duration-150 select-none"
      role="button"
      aria-label="Clique ou arraste uma imagem"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
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
          <span
            className="text-foreground"
            style={{ fontFamily: "var(--font-display)", fontSize: initialsSize, fontWeight: 700, letterSpacing: "0.04em" }}
          >
            {initials}
          </span>
        </div>
      )}

      {/* Hover / drag overlay */}
      {showOverlay && (
        <div
          className="absolute inset-0 flex items-center justify-center transition-all duration-150"
          style={{ background: isDragging ? "rgba(200,16,46,0.30)" : "rgba(0,0,0,0.60)" }}
        >
          <Camera size={overlayIconSize} strokeWidth={1.5} style={{ color: isDragging ? "#c8102e" : "#ffffff" }} />
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
