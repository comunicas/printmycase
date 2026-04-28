import { useSearchParams } from "react-router-dom";
import { getSafeZonePreset } from "@/lib/safe-zone-presets";

/** Standalone page that displays an image with the device safe-zone overlay.
 *  Used by the admin order preview "Nova aba" link. */
const AdminSafeZonePreview = () => {
  const [params] = useSearchParams();
  const url = params.get("url") || "";
  const slug = params.get("slug") || undefined;
  const label = params.get("label") || "Imagem com safezone";
  const preset = getSafeZonePreset(slug);

  if (!url) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Parâmetro <code>url</code> ausente.</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col items-center justify-center gap-3 p-4">
      <p className="text-sm font-medium">{label}</p>
      <div className="relative max-h-[90dvh]" style={{ aspectRatio: "260 / 532" }}>
        <img
          src={url}
          alt={label}
          className="h-full w-auto rounded-lg object-contain block"
        />
        <div
          className="pointer-events-none absolute z-10 border-2 border-foreground box-border"
          aria-hidden="true"
          style={{
            left: preset.width ? (preset.insetX ?? "5%") : preset.insetX,
            right: preset.width ? "auto" : preset.insetX,
            width: preset.width,
            top: preset.top,
            height: preset.height,
            borderTopLeftRadius: preset.radius,
            borderTopRightRadius: preset.radius,
            borderBottomLeftRadius: preset.width ? preset.radius : preset.bottomRadius,
            borderBottomRightRadius: preset.width ? preset.radius : preset.bottomRadius,
            borderColor: "hsl(var(--foreground))",
            backgroundColor: "rgba(255, 255, 255, 0.55)",
          }}
        />
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-muted-foreground underline"
      >
        Abrir imagem original
      </a>
    </div>
  );
};

export default AdminSafeZonePreview;
