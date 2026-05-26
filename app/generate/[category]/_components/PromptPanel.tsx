"use client";

import { useState } from "react";
import { Check, ClipboardCopy, ExternalLink, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AI_TARGETS } from "@/lib/aiLinks";

interface Props {
  /** 합쳐진 최종 프롬프트 (system + user) */
  prompt: string;
}

/**
 * 생성된 프롬프트를 보여주고, 복사 / 외부 AI 사이트로 보내기를 제공.
 */
export function PromptPanel({ prompt }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error("복사 실패", e);
      alert("복사에 실패했습니다.");
    }
  };

  const openWith = async (targetId: string) => {
    const target = AI_TARGETS.find((t) => t.id === targetId);
    if (!target) return;

    // 클립보드에는 항상 먼저 복사 (URL 자동입력 실패 대비)
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      /* noop */
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

      <div className="p-4">
        <pre className="max-h-[320px] overflow-auto rounded-md border bg-muted/40 p-3 text-xs leading-relaxed whitespace-pre-wrap break-words font-mono text-foreground/80">
{prompt}
        </pre>
      </div>

      <div className="p-4 border-t bg-muted/20 rounded-b-lg">
        <p className="text-xs text-muted-foreground mb-2">
          외부 AI 사이트로 보내기 (열기 전에 클립보드에 자동 복사됩니다)
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
