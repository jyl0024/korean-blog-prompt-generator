"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, ClipboardCopy, Eye, Pencil, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { markdownToPlainText } from "@/lib/markdown";

type Mode = "edit" | "preview";

interface Props {
  value: string;
  onChange: (next: string) => void;
  onSave: () => void;
  canSave: boolean;
  /** 저장된 직후 보여줄 메시지 */
  savedFlag: boolean;
}

/**
 * AI 사이트에서 받아온 응답을 붙여넣고 미리보기 + 저장.
 */
export function ResultPastePanel({
  value,
  onChange,
  onSave,
  canSave,
  savedFlag,
}: Props) {
  const [mode, setMode] = useState<Mode>("edit");
  const [copied, setCopied] = useState<"md" | "txt" | null>(null);

  const copy = async (kind: "md" | "txt") => {
    if (!value) return;
    const payload = kind === "md" ? value : markdownToPlainText(value);
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(kind);
      setTimeout(() => setCopied((c) => (c === kind ? null : c)), 1500);
    } catch (e) {
      console.error("복사 실패", e);
      alert("복사에 실패했습니다.");
    }
  };

  return (
    <div className="rounded-lg border bg-card shadow-sm flex flex-col">
      <div className="p-4 border-b flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-sm font-semibold">AI 응답 결과</h3>
        <div className="flex items-center gap-2">
          {/* 모드 토글 */}
          <div className="inline-flex rounded-md border bg-background p-0.5">
            <button
              type="button"
              onClick={() => setMode("edit")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-sm transition-colors ${
                mode === "edit"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Pencil className="h-3 w-3" />
              편집
            </button>
            <button
              type="button"
              onClick={() => setMode("preview")}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-sm transition-colors ${
                mode === "preview"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="h-3 w-3" />
              미리보기
            </button>
          </div>

          {/* 복사 */}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => copy("md")}
            disabled={!value}
          >
            {copied === "md" ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
            MD
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => copy("txt")}
            disabled={!value}
          >
            {copied === "txt" ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
            TXT
          </Button>
        </div>
      </div>

      <div className="p-4">
        {mode === "edit" ? (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="외부 AI 사이트에서 받아온 글을 여기에 붙여넣으세요. (마크다운 그대로 OK)"
            className="min-h-[260px] sm:min-h-[320px] font-mono text-sm leading-relaxed"
          />
        ) : (
          <div className="min-h-[260px] sm:min-h-[320px] max-h-[60vh] overflow-auto rounded-md border bg-background p-4">
            {value ? (
              <article className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
              </article>
            ) : (
              <p className="text-sm text-muted-foreground">
                붙여넣은 내용이 없습니다.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-muted/20 rounded-b-lg flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs text-muted-foreground">
          {savedFlag ? "✓ 사용 내역에 저장되었습니다." : "내용 확인 후 저장하세요."}
        </p>
        <Button type="button" size="sm" onClick={onSave} disabled={!canSave}>
          <Save className="h-4 w-4" />
          내역에 저장
        </Button>
      </div>
    </div>
  );
}
