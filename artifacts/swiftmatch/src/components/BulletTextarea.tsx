import { useRef } from "react";
import { List } from "lucide-react";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full border border-slate-200 rounded-xl bg-white text-sm placeholder:text-slate-400 " +
  "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all px-4 py-3";

interface BulletTextareaProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function BulletTextarea({
  value, onChange, placeholder, rows = 6, className,
}: BulletTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function insertBullet() {
    const ta = ref.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const before = value.slice(0, pos);
    const after = value.slice(pos);
    const prefix = before.length > 0 && !before.endsWith("\n") ? "\n• " : "• ";
    const newValue = before + prefix + after;
    onChange(newValue);
    const newCursor = pos + prefix.length;
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = newCursor;
      ta.focus();
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Enter") return;
    const ta = ref.current!;
    const pos = ta.selectionStart;
    const lineStart = value.lastIndexOf("\n", pos - 1) + 1;
    const currentLine = value.slice(lineStart, pos);
    if (currentLine.startsWith("• ")) {
      if (currentLine.trim() === "•") {
        // Empty bullet — remove it and stop
        e.preventDefault();
        const newValue = value.slice(0, lineStart - 1) + value.slice(pos);
        onChange(newValue.endsWith("\n") ? newValue.slice(0, -1) : newValue);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = Math.max(0, lineStart - 1);
          ta.focus();
        });
      } else {
        // Continue bullet on next line
        e.preventDefault();
        const before = value.slice(0, pos);
        const after = value.slice(pos);
        const newValue = before + "\n• " + after;
        onChange(newValue);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = pos + 3;
          ta.focus();
        });
      }
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={insertBullet}
          title="Insert bullet point"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-primary/10 hover:text-primary border border-slate-200 hover:border-primary/30 transition-colors"
        >
          <List className="w-3.5 h-3.5" /> Add Bullet
        </button>
        <span className="text-[11px] text-slate-400">or press Enter on a bullet line to continue</span>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={cn(inputCls, "resize-none leading-relaxed", className)}
      />
    </div>
  );
}
