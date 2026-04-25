import { useState } from "react";
import { Upload, X } from "lucide-react";
import { uploadCmsImage } from "@/lib/cms";

export function CmsImageUpload({
  value,
  onChange,
  label = "Image",
}: {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setBusy(true);
    setErr(null);
    try {
      const url = await uploadCmsImage(file);
      onChange(url);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-foreground/70">{label}</label>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="h-32 w-auto rounded-md border border-border object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-background border border-border shadow"
            aria-label="Remove"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <label className="inline-flex items-center gap-2 text-xs font-medium border border-border rounded-md px-3 py-2 cursor-pointer hover:bg-secondary">
          <Upload className="h-3.5 w-3.5" />
          {busy ? "Uploading…" : value ? "Replace" : "Upload"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>
        <input
          type="url"
          placeholder="…or paste URL"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-xs rounded-md border border-border bg-background px-3 py-2"
        />
      </div>
      {err && <div className="text-xs text-destructive">{err}</div>}
    </div>
  );
}
