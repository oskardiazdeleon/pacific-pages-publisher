import { useRef, useState } from "react";
import { Upload, Loader2, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  bucket: "listing-media" | "article-media" | "avatars";
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export function ImageUpload({ bucket, value, onChange, folder, label }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image must be under 8 MB");
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safe = file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9-]+/gi, "-").slice(0, 40).toLowerCase();
      const path = `${folder ? folder + "/" : ""}${Date.now()}-${safe || "image"}.${ext}`;

      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Image uploaded");
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  return (
    <div>
      {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
      <div className={label ? "mt-1" : ""}>
        {value ? (
          <div className="relative group rounded-lg overflow-hidden border border-border aspect-[16/9] bg-muted">
            <img src={value} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-full bg-background px-3 py-1.5 text-xs font-medium"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-full bg-background px-3 py-1.5 text-xs font-medium inline-flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Remove
              </button>
            </div>
            {busy && (
              <div className="absolute inset-0 grid place-items-center bg-background/70">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`w-full rounded-lg border-2 border-dashed transition aspect-[16/9] grid place-items-center text-center px-4 ${
              dragOver ? "border-accent bg-accent/5" : "border-border bg-background hover:bg-secondary"
            }`}
          >
            {busy ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-xs">Uploading…</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="rounded-full bg-secondary p-3"><Upload className="h-5 w-5" /></div>
                <div className="text-sm font-medium text-foreground">Drop an image or click to upload</div>
                <div className="text-xs">PNG, JPG, WEBP · up to 8 MB</div>
              </div>
            )}
          </button>
        )}
        <div className="mt-2 flex items-center gap-2">
          <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste an image URL"
            className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs focus:border-accent focus:outline-none"
          />
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
