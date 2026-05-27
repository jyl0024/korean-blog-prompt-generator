"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Check,
  ClipboardCopy,
  Eye,
  Pencil,
  Save,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES } from "@/lib/categories";
import { copyToClipboard } from "@/lib/clipboard";
import {
  updateHistoryResult,
  updateHistoryTitle,
} from "@/lib/history";
import { markdownToPlainText } from "@/lib/markdown";
import type { HistoryEntry } from "@/lib/types";

type Tab = "result" | "prompt" | "inputs";

interface Props {
  entry: HistoryEntry;
  onClose: () => void;
  onChanged: () => void;
}

export function HistoryDetailDialog({ entry, onClose, onChanged }: Props) {
  const [tab, setTab] = useState<Tab>(entry.result ? "result" : "prompt");
  const [title, setTitle] = useState(entry.title);
  const [resultDraft, setResultDraft] = useState(entry.result ?? "");
  const [resultMode, setResultMode] = useState<"preview" | "edit">(
    entry.result ? "preview" : "edit"
  );
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // body 스크롤 잠금
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const meta = CATEGORIES[entry.category];
  const dt = new Date(entry.createdAt);
  const dateStr = dt.toLocaleString("ko-KR");

  const fullPrompt = `${entry.prompt.system.trim()}\n\n---\n\n${entry.prompt.user.trim()}`;

  const doCopy = async (key: string, text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
    } else {
      alert(
        "자동 복사가 차단된 환경입니다.\n해당 탭에서 텍스트를 직접 드래그한 뒤 Ctrl+C 로 복사해주세요."
      );
    }
  };

  const saveTitle = () => {
    const trimmed = title.trim() || "제목 없음";
    if (trimmed !== entry.title) {
      updateHistoryTitle(entry.id, trimmed);
      onChanged();
    }
  };

  const saveResult = () => {
    updateHistoryResult(entry.id, resultDraft);
    onChanged();
    setResultMode("preview");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-card border rounded-lg shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="p-4 sm:p-5 border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="inline-flex items-center text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {meta.label}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {dateStr}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={saveTitle}
                  className="text-base font-semibold h-9"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0"
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 탭 */}
          <div className="mt-3 flex gap-1 border-b -mb-px">
            <TabButton active={tab === "result"} onClick={() => setTab("result")}>
              결과
            </TabButton>
            <TabButton active={tab === "prompt"} onClick={() => setTab("prompt")}>
              프롬프트
            </TabButton>
            <TabButton active={tab === "inputs"} onClick={() => setTab("inputs")}>
              입력값
            </TabButton>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-4 sm:p-5 overflow-auto flex-1">
          {tab === "result" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="inline-flex rounded-md border bg-background p-0.5">
                  <button
                    type="button"
                    onClick={() => setResultMode("edit")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-sm transition-colors ${
                      resultMode === "edit"
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Pencil className="h-3 w-3" />
                    편집
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultMode("preview")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-sm transition-colors ${
                      resultMode === "preview"
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Eye className="h-3 w-3" />
                    미리보기
                  </button>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => doCopy("md", resultDraft)}
                    disabled={!resultDraft}
                  >
                    {copied === "md" ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                    MD
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => doCopy("txt", markdownToPlainText(resultDraft))}
                    disabled={!resultDraft}
                  >
                    {copied === "txt" ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                    TXT
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={saveResult}
                    disabled={resultDraft === (entry.result ?? "")}
                  >
                    <Save className="h-4 w-4" />
                    저장
                  </Button>
                </div>
              </div>

              {resultMode === "edit" ? (
                <Textarea
                  value={resultDraft}
                  onChange={(e) => setResultDraft(e.target.value)}
                  placeholder="AI 응답을 여기에 붙여넣으세요."
                  className="min-h-[300px] font-mono text-sm"
                />
              ) : resultDraft ? (
                <article className="markdown-body rounded-md border bg-background p-4">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{resultDraft}</ReactMarkdown>
                </article>
              ) : (
                <div className="rounded-md border bg-background p-8 text-center text-sm text-muted-foreground">
                  아직 결과가 저장되지 않았습니다. 편집 모드에서 붙여넣어 보세요.
                </div>
              )}
            </div>
          )}

          {tab === "prompt" && (
            <div className="space-y-3">
              <div className="flex items-center justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => doCopy("prompt", fullPrompt)}
                >
                  {copied === "prompt" ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                  프롬프트 복사
                </Button>
              </div>
              <pre className="rounded-md border bg-muted/40 p-3 text-xs leading-relaxed whitespace-pre-wrap break-words font-mono">
{fullPrompt}
              </pre>
            </div>
          )}

          {tab === "inputs" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                이 글을 생성할 때 폼에 입력한 값
              </p>
              <pre className="rounded-md border bg-muted/40 p-3 text-xs leading-relaxed whitespace-pre-wrap break-words font-mono">
{JSON.stringify(entry.inputs, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-sm border-b-2 transition-colors -mb-px ${
        active
          ? "border-foreground text-foreground font-medium"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
