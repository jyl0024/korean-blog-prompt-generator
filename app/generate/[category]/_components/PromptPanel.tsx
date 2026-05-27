"use client";

import { useRef, useState } from "react";
import { Check, ClipboardCopy, ExternalLink, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AI_TARGETS } from "@/lib/aiLinks";
import { copyToClipboard } from "@/lib/clipboard";

interface Props {
  /** 합쳐진 최종 프롬프트 (system + user) */
  prompt: string;
}

/**
 * 생성된 프롬프트를 보여주고, 복사 / 외부 AI 사이트로 보내기를 제공.
 *
 * 보안 컨텍스트 (iframe 내부 등) 에서 navigator.clipboard 가 거부되면
 *  - document.execCommand("copy") 로 폴백
 *  - 그것마저 실패하면 본문 텍스트를 자동 선택해서 사용자가 Ctrl+C 로 복사 가능하도록 안내
 */
export function PromptPanel({ prompt }: Props) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const selectAll = () => {
    const el = preRef.current;
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  const copy = async () => {
    if (!prompt) return;
    const ok = await copyToClipboard(prompt);
    if (ok) {
      setCopied(true);
      setCopyFailed(false);
      setTimeout(() => setCopied(false), 1500);
    } else {
      // 폴백: 텍스트 자동 선택 + 안내 메시지
      setCopyFailed(true);
      selectAll();
    }
  };

  const openWith = async (targetId: string) => {
    const target = AI_TARGETS.find((t) => t.id === targetId);
    if (!target) return;

    // 클립보드에 먼저 복사 시도 (실패해도 사이트는 연다)
    const ok = await copyToClipboard(prompt);
    if (!ok) {
      // 사용자에게 알림 + 텍스트 자동 선택
      setCopyFailed(true);
      selectAll();
    }

    const link = target.build(prompt);
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="p-4 border-b flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-amber-500" />
          생성된 프롬프트
        </h3>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={copy}
          disabled={!prompt}
        >
          {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
          복사
        </Button>
      </div>

      <div className="p-4 space-y-2">
        {copyFailed && (
          <div className="rounded-md border border-amber-400/40 bg-amber-50 text-amber-900 px-3 py-2 text-xs leading-relaxed">
            <strong>자동 복사가 차단된 환경입니다.</strong> 아래 박스의 내용이 이미 선택되어 있으니{" "}
            <kbd className="px-1 py-0.5 rounded border bg-white text-[10px] font-mono">Ctrl</kbd>{" "}
            +{" "}
            <kbd className="px-1 py-0.5 rounded border bg-white text-[10px] font-mono">C</kbd>{" "}
            (Mac:{" "}
            <kbd className="px-1 py-0.5 rounded border bg-white text-[10px] font-mono">⌘</kbd>{" "}
            +{" "}
            <kbd className="px-1 py-0.5 rounded border bg-white text-[10px] font-mono">C</kbd>
            ) 로 복사해주세요.
            <button
              type="button"
              onClick={selectAll}
              className="ml-2 underline underline-offset-2 hover:no-underline"
            >
              다시 전체 선택
            </button>
          </div>
        )}
        <pre
          ref={preRef}
          onClick={selectAll}
          className="max-h-[320px] overflow-auto rounded-md border bg-muted/40 p-3 text-xs leading-relaxed whitespace-pre-wrap break-words font-mono text-foreground/80 cursor-text select-text"
        >
{prompt}
        </pre>
        <p className="text-[11px] text-muted-foreground/70">
          ※ 박스를 클릭하면 전체 텍스트가 선택됩니다.
        </p>
      </div>

      <div className="p-4 border-t bg-muted/20 rounded-b-lg">
        <p className="text-xs text-muted-foreground mb-2">
          외부 AI 사이트로 보내기 (열기 전에 클립보드에 자동 복사 시도)
        </p>
        <div className="flex flex-wrap gap-2">
          {AI_TARGETS.map((t) => (
            <Button
              key={t.id}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => openWith(t.id)}
              disabled={!prompt}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t.label}
            </Button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground/80 mt-2 leading-relaxed">
          ※ ChatGPT / Perplexity 는 프롬프트가 URL 로 자동 입력됩니다. Claude / Gemini 는 사이트가 열리면 입력창에 직접 붙여넣어 주세요.
        </p>
      </div>
    </div>
  );
}
