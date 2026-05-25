"use client";

import { useState } from "react";
import { Check, ClipboardCopy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { markdownToPlainText } from "@/lib/markdown";

interface Props {
  markdown: string;
  disabled?: boolean;
}

export function CopyButtons({ markdown, disabled }: Props) {
  const [copied, setCopied] = useState<"md" | "txt" | null>(null);

  const copy = async (mode: "md" | "txt") => {
    if (!markdown) return;
    const payload = mode === "md" ? markdown : markdownToPlainText(markdown);
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(mode);
      setTimeout(() => setCopied((curr) => (curr === mode ? null : curr)), 1500);
    } catch (e) {
      console.error("복사 실패", e);
      alert("복사에 실패했습니다.");
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => copy("md")}
        disabled={disabled || !markdown}
      >
        {copied === "md" ? (
          <Check className="h-4 w-4" />
        ) : (
          <ClipboardCopy className="h-4 w-4" />
        )}
        마크다운 복사
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => copy("txt")}
        disabled={disabled || !markdown}
      >
        {copied === "txt" ? (
          <Check className="h-4 w-4" />
        ) : (
          <ClipboardCopy className="h-4 w-4" />
        )}
        텍스트만 복사
      </Button>
    </div>
  );
}
