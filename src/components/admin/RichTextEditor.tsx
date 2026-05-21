import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useState } from "react";
import {
  Bold, Italic, Strikethrough, Code, Heading2, Heading3, List, ListOrdered,
  Quote, Link as LinkIcon, Image as ImageIcon, Undo2, Redo2, Minus, Loader2,
  Ship, Heart, MapPin, Plus, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EmbedCardNode } from "@/components/admin/editor/EmbedCardNode";
import { InsertCruiseCardDialog } from "@/components/admin/editor/InsertCruiseCardDialog";
import { InsertWeddingVenueDialog } from "@/components/admin/editor/InsertWeddingVenueDialog";
import { InsertListingDialog } from "@/components/admin/editor/InsertListingDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  uploadFolder?: string;
}

function ToolbarButton({
  active, onClick, title, children,
}: {
  active?: boolean; onClick: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`h-8 w-8 inline-flex items-center justify-center rounded-md text-sm transition ${
        active ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({
  editor, onImage, uploading, onInsertCruise, onInsertVenue, onInsertListing,
}: {
  editor: Editor; onImage: () => void; uploading: boolean;
  onInsertCruise: () => void; onInsertVenue: () => void; onInsertListing: () => void;
}) {
  const promptLink = () => {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 p-1.5">
      <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Strike" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-6 w-px bg-border" />
      <ToolbarButton title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Bulleted list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Ordered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="h-4 w-4" />
      </ToolbarButton>
      <span className="mx-1 h-6 w-px bg-border" />
      <ToolbarButton title="Link" active={editor.isActive("link")} onClick={promptLink}>
        <LinkIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Insert image" onClick={onImage}>
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
      </ToolbarButton>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title="Embed a card"
            className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-foreground transition hover:bg-secondary"
          >
            <Plus className="h-3.5 w-3.5" />
            Embed
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuItem onSelect={onInsertListing}>
            <MapPin className="mr-2 h-4 w-4 text-accent" />
            Listing card
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onInsertCruise}>
            <Ship className="mr-2 h-4 w-4 text-accent" />
            Cruise card
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onInsertVenue}>
            <Heart className="mr-2 h-4 w-4 text-accent" />
            Wedding venue
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <span className="mx-1 h-6 w-px bg-border" />
      <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({ value, onChange, placeholder, uploadFolder }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [cruiseDialogOpen, setCruiseDialogOpen] = useState(false);
  const [venueDialogOpen, setVenueDialogOpen] = useState(false);
  const [listingDialogOpen, setListingDialogOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { class: "text-accent underline underline-offset-2" } }),
      Image.configure({ HTMLAttributes: { class: "rounded-xl my-4" } }),
      Placeholder.configure({ placeholder: placeholder || "Start writing your story…" }),
      EmbedCardNode,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral max-w-none min-h-[400px] focus:outline-none px-4 py-4 text-foreground prose-headings:font-display prose-a:text-accent",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    if (value && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  const uploadAndInsert = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8 MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${uploadFolder || "inline"}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("article-media").upload(path, file, {
        cacheControl: "31536000",
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      const { data } = supabase.storage.from("article-media").getPublicUrl(path);
      editor?.chain().focus().setImage({ src: data.publicUrl }).run();
    } finally {
      setUploading(false);
    }
  };

  if (!editor) {
    return <div className="rounded-lg border border-border bg-background h-[460px] animate-pulse" />;
  }

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <Toolbar
        editor={editor}
        uploading={uploading}
        onImage={() => fileRef.current?.click()}
        onInsertCruise={() => setCruiseDialogOpen(true)}
        onInsertVenue={() => setVenueDialogOpen(true)}
        onInsertListing={() => setListingDialogOpen(true)}
      />
      <EditorContent editor={editor} />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadAndInsert(file);
          e.target.value = "";
        }}
      />
      <InsertCruiseCardDialog
        open={cruiseDialogOpen}
        onOpenChange={setCruiseDialogOpen}
        onSelect={(slug, variant) => {
          editor.chain().focus().insertEmbedCard({ kind: "cruise", slug, variant }).run();
        }}
      />
      <InsertWeddingVenueDialog
        open={venueDialogOpen}
        onOpenChange={setVenueDialogOpen}
        onSelect={(slug, variant) => {
          editor.chain().focus().insertEmbedCard({ kind: "venue", slug, variant }).run();
        }}
      />
      <InsertListingDialog
        open={listingDialogOpen}
        onOpenChange={setListingDialogOpen}
        onSelect={(slug, variant) => {
          editor.chain().focus().insertEmbedCard({ kind: "listing", slug, variant }).run();
        }}
      />
    </div>
  );
}
