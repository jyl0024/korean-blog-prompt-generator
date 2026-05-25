"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ResultPanel, type GenerationStatus } from "./ResultPanel";
import { MovieReviewForm } from "./forms/MovieReviewForm";
import { DramaReviewForm } from "./forms/DramaReviewForm";
import { GameReviewForm } from "./forms/GameReviewForm";
import { MonthlyMoviesForm } from "./forms/MonthlyMoviesForm";
import { MonthlyDramasForm } from "./forms/MonthlyDramasForm";
import { MonthlyGamesForm } from "./forms/MonthlyGamesForm";

import type { CategoryMeta } from "@/lib/categories";
import type { Citation, StreamEvent } from "@/lib/types";

interface Props {
  category: CategoryMeta;
}

export function GeneratePageClient({ category }: Props) {
  // 현재 입력값 + 검증 상태
  const [inputs, setInputs] = useState<Record<string, unknown>>({});
  const [isValid, setIsValid] = useState(false);

  // 결과 상태
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [markdown, setMarkdown] = useState("");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // 진행 중인 요청 abort용
  const abortRef = useRef<AbortController | null>(null);

  const handleFormChange = useCallback(
    (next: Record<string, unknown>, valid: boolean) => {
      setInputs(next);
      setIsValid(valid);
    },
    []
  );

  const startGeneration = useCallback(async () => {
    if (!isValid) return;

    // 기존 요청 취소
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    // 상태 초기화
    setMarkdown("");
    setCitations([]);
    setErrorMessage("");
    setStatus("starting");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: category.id, inputs }),
        signal: ac.signal,
      });

      if (!res.ok || !res.body) {
        // 에러 JSON 파싱 시도
        let msg = `요청 실패 (HTTP ${res.status})`;
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch {
          /* noop */
        }
        setStatus("error");
        setErrorMessage(msg);
        return;
      }

      // NDJSON 스트림 파싱
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      // 텍스트가 한 번이라도 들어오면 generating 으로 전환
      let switchedToGenerating = false;
      // 활성 검색 카운터 (start/end 매칭)
      let searchActive = 0;

      const applyStatus = () => {
        if (searchActive > 0) {
          setStatus("searching");
        } else if (switchedToGenerating) {
          setStatus("generating");
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // 줄 단위로 분리
        let nlIdx;
        while ((nlIdx = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, nlIdx).trim();
          buffer = buffer.slice(nlIdx + 1);
          if (!line) continue;

          let evt: StreamEvent;
          try {
            evt = JSON.parse(line) as StreamEvent;
          } catch (e) {
            console.warn("스트림 라인 파싱 실패:", line);
            continue;
          }

          switch (evt.type) {
            case "text":
              switchedToGenerating = true;
              setMarkdown((prev) => prev + evt.delta);
              applyStatus();
              break;
            case "tool_use":
              if (evt.name === "web_search") {
                if (evt.status === "start") searchActive++;
                else if (evt.status === "end")
                  searchActive = Math.max(0, searchActive - 1);
                applyStatus();
              }
              break;
            case "citation":
              setCitations((prev) => {
                // 중복 url 방지
                if (prev.some((c) => c.url === evt.citation.url)) return prev;
                return [...prev, evt.citation];
              });
              break;
            case "done":
              setStatus("done");
              break;
            case "error":
              setStatus("error");
              setErrorMessage(evt.message);
              break;
          }
        }
      }

      // 스트림 끝났는데 status 가 아직 done 이 아니면 done 으로
      setStatus((s) => (s === "error" ? s : "done"));
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        // 사용자가 재생성 등으로 취소한 경우 — 무시
        return;
      }
      console.error(err);
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "네트워크 오류가 발생했습니다."
      );
    }
  }, [category.id, inputs, isValid]);

  const handleRegenerate = useCallback(() => {
    startGeneration();
  }, [startGeneration]);

  const isStreaming =
    status === "starting" || status === "generating" || status === "searching";

  return (
    <main className="container mx-auto max-w-7xl px-4 py-6 sm:py-8">
      {/* 상단 네비 */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          카테고리 선택으로 돌아가기
        </Link>
      </div>

      {/* 타이틀 */}
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          {category.label}
          {category.webSearch && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 text-xs font-medium">
              <Search className="h-3 w-3" />
              웹 검색
            </span>
          )}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
      </header>

      {/* 좌(폼) / 우(결과) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 좌: 폼 */}
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-5 sm:p-6 border-b">
            <h2 className="text-base font-semibold">정보 입력</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              필요한 항목만 채워주세요.
            </p>
          </div>

          <div className="p-5 sm:p-6">
            {renderForm(category, handleFormChange, isStreaming)}
          </div>

          <div className="p-5 sm:p-6 border-t bg-muted/20 flex items-center justify-end gap-2 rounded-b-lg">
            <Button
              type="button"
              onClick={startGeneration}
              disabled={!isValid || isStreaming}
              size="lg"
            >
              {isStreaming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  생성하기
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 우: 결과 */}
        <div className="min-h-[400px] lg:min-h-0 lg:h-[calc(100vh-180px)] lg:sticky lg:top-6">
          <ResultPanel
            status={status}
            markdown={markdown}
            citations={citations}
            errorMessage={errorMessage}
            onRegenerate={handleRegenerate}
            canRegenerate={isValid && markdown.length > 0}
          />
        </div>
      </div>
    </main>
  );
}

function renderForm(
  category: CategoryMeta,
  onChange: (inputs: Record<string, unknown>, valid: boolean) => void,
  _disabled: boolean
) {
  switch (category.id) {
    case "movie-review":
      return <MovieReviewForm onChange={onChange} />;
    case "drama-review":
      return <DramaReviewForm onChange={onChange} />;
    case "game-review":
      return <GameReviewForm onChange={onChange} />;
    case "monthly-movies":
      return <MonthlyMoviesForm onChange={onChange} />;
    case "monthly-dramas":
      return <MonthlyDramasForm onChange={onChange} />;
    case "monthly-games":
      return <MonthlyGamesForm onChange={onChange} />;
  }
}
