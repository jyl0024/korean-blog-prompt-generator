"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PromptPanel } from "./PromptPanel";
import { ResultPastePanel } from "./ResultPastePanel";
import { MovieReviewForm } from "./forms/MovieReviewForm";
import { DramaReviewForm } from "./forms/DramaReviewForm";
import { GameReviewForm } from "./forms/GameReviewForm";
import { MonthlyMoviesForm } from "./forms/MonthlyMoviesForm";
import { MonthlyDramasForm } from "./forms/MonthlyDramasForm";
import { MonthlyGamesForm } from "./forms/MonthlyGamesForm";

import type { CategoryMeta } from "@/lib/categories";
import { getPromptBuilder } from "@/lib/prompts";
import {
  deriveTitle,
  newHistoryId,
  updateHistoryResult,
  upsertHistory,
} from "@/lib/history";
import type { BuiltPrompt } from "@/lib/types";

interface Props {
  category: CategoryMeta;
}

export function GeneratePageClient({ category }: Props) {
  // 현재 입력값 + 검증 상태
  const [inputs, setInputs] = useState<Record<string, unknown>>({});
  const [isValid, setIsValid] = useState(false);

  // 생성된 프롬프트
  const [prompt, setPrompt] = useState<BuiltPrompt | null>(null);
  // 현재 히스토리 엔트리 id (저장 갱신용)
  const [entryId, setEntryId] = useState<string | null>(null);
  // AI 응답 (사용자가 붙여넣음)
  const [aiResult, setAiResult] = useState("");
  // 저장 표시 플래그
  const [savedFlag, setSavedFlag] = useState(false);

  const handleFormChange = useCallback(
    (next: Record<string, unknown>, valid: boolean) => {
      setInputs(next);
      setIsValid(valid);
    },
    []
  );

  const handleBuildPrompt = useCallback(() => {
    if (!isValid) return;

    const builder = getPromptBuilder(category.id);
    const built = builder(inputs);
    setPrompt(built);
    setAiResult("");
    setSavedFlag(false);

    // 히스토리에 1차 저장 (result 없이)
    const id = newHistoryId();
    setEntryId(id);
    upsertHistory({
      id,
      category: category.id,
      title: deriveTitle(category.id, inputs),
      createdAt: new Date().toISOString(),
      inputs,
      prompt: built,
    });
  }, [category.id, inputs, isValid]);

  const handleSaveResult = useCallback(() => {
    if (!entryId || !aiResult.trim()) return;
    updateHistoryResult(entryId, aiResult);
    setSavedFlag(true);
    setTimeout(() => setSavedFlag(false), 3000);
  }, [entryId, aiResult]);

  // 프롬프트 문자열 합치기 (system + user)
  const fullPromptText = prompt
    ? buildFullPromptText(prompt)
    : "";

  return (
    <main className="container mx-auto max-w-7xl px-4 py-6 sm:py-8">
      {/* 상단 네비 */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          카테고리 선택으로 돌아가기
        </Link>
        <Link
          href="/history"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          사용 내역 →
        </Link>
      </div>

      {/* 타이틀 */}
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          {category.label}
          {category.webSearch && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 text-xs font-medium">
              <Search className="h-3 w-3" />
              웹 검색 권장
            </span>
          )}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
      </header>

      {/* 좌(폼+프롬프트) / 우(AI 응답 붙여넣기) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 좌측 컬럼 */}
        <div className="space-y-4">
          {/* 폼 카드 */}
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-5 sm:p-6 border-b">
              <h2 className="text-base font-semibold">1. 정보 입력</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                필요한 항목만 채워주세요.
              </p>
            </div>

            <div className="p-5 sm:p-6">
              {renderForm(category, handleFormChange)}
            </div>

            <div className="p-5 sm:p-6 border-t bg-muted/20 flex items-center justify-end rounded-b-lg">
              <Button
                type="button"
                onClick={handleBuildPrompt}
                disabled={!isValid}
                size="lg"
              >
                <Sparkles className="h-4 w-4" />
                프롬프트 생성하기
              </Button>
            </div>
          </div>

          {/* 프롬프트 패널 (있을 때만) */}
          {prompt && (
            <div>
              <div className="mb-2">
                <h2 className="text-base font-semibold">2. 프롬프트 복사 → AI 에 붙여넣기</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  아래 프롬프트를 외부 AI(ChatGPT, Claude, Gemini 등)에 보내세요.
                </p>
              </div>
              <PromptPanel prompt={fullPromptText} />
            </div>
          )}
        </div>

        {/* 우측 컬럼 — AI 응답 받기 */}
        <div>
          <div className="mb-2">
            <h2 className="text-base font-semibold">3. AI 응답 붙여넣기 → 저장</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              AI 가 답변한 글을 여기에 붙여넣고 사용 내역에 저장하세요.
            </p>
          </div>
          <ResultPastePanel
            value={aiResult}
            onChange={setAiResult}
            onSave={handleSaveResult}
            canSave={!!entryId && aiResult.trim().length > 0}
            savedFlag={savedFlag}
          />
        </div>
      </div>
    </main>
  );
}

function renderForm(
  category: CategoryMeta,
  onChange: (inputs: Record<string, unknown>, valid: boolean) => void
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

/**
 * system + user 를 하나의 텍스트로 합쳐 외부 AI 에 보낼 프롬프트로 만든다.
 */
function buildFullPromptText(p: BuiltPrompt): string {
  return `${p.system.trim()}\n\n---\n\n${p.user.trim()}`;
}
