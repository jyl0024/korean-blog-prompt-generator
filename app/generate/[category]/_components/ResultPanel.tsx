"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, Search, RotateCcw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CopyButtons } from "./CopyButtons";
import { CitationsList } from "./CitationsList";
import type { Citation } from "@/lib/types";

export type GenerationStatus =
  | "idle"
  | "starting"
  | "generating"
  | "searching"
  | "done"
  | "error";

interface Props {
  status: GenerationStatus;
  markdown: string;
  citations: Citation[];
  errorMessage?: string;
  onRegenerate: () => void;
  canRegenerate: boolean;
}

export function ResultPanel({
  status,
  markdown,
  citations,
  errorMessage,
  onRegenerate,
  canRegenerate,
}: Props) {
  const isStreaming =
    status === "starting" || status === "generating" || status === "searching";

  return (
    <div className="rounded-lg border bg-card shadow-sm flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-2 p-4 border-b">
        <div className="flex items-center gap-2 min-w-0">
          <StatusIndicator status={status} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <CopyButtons markdown={markdown} disabled={isStreaming} />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onRegenerate}
            disabled={!canRegenerate || isStreaming}
          >
            <RotateCcw className="h-4 w-4" />
            재생성
          </Button>
        </div>
      </div>

      {/* 본문 */}
      <div className="p-5 sm:p-6 overflow-auto flex-1">
        {status === "idle" && !markdown && <EmptyState />}

        {status === "error" && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <p className="font-medium mb-1">오류가 발생했습니다.</p>
            <p className="text-destructive/80 whitespace-pre-wrap">
              {errorMessage || "알 수 없는 오류"}
            </p>
          </div>
        )}

        {markdown && (
          <article className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            {/* 스트리밍 중 커서 */}
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-0.5 bg-foreground/60 align-middle animate-pulse" />
            )}
          </article>
        )}

        {/* 인용 자료 */}
        <CitationsList citations={citations} />
      </div>
    </div>
  );
}

function StatusIndicator({ status }: { status: GenerationStatus }) {
  switch (status) {
    case "idle":
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          준비됨
        </div>
      );
    case "starting":
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          요청 보내는 중...
        </div>
      );
    case "searching":
      return (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Search className="h-4 w-4 animate-pulse" />
          정보 검색 중...
        </div>
      );
    case "generating":
      return (
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          글 생성 중...
        </div>
      );
    case "done":
      return (
        <div className="flex items-center gap-2 text-sm text-emerald-600">
          <Sparkles className="h-4 w-4" />
          완료
        </div>
      );
    case "error":
      return (
        <div className="flex items-center gap-2 text-sm text-destructive">
          오류
        </div>
      );
  }
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground">
      <Sparkles className="h-8 w-8 mb-3 opacity-40" />
      <p className="text-sm">
        왼쪽에서 정보를 입력하고 <span className="font-medium text-foreground">생성</span> 버튼을 눌러주세요.
      </p>
    </div>
  );
}
