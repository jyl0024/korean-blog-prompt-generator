"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Inbox, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, CATEGORY_LIST } from "@/lib/categories";
import {
  clearAllHistory,
  deleteHistory,
  listHistory,
  searchHistory,
} from "@/lib/history";
import type { CategoryId, HistoryEntry } from "@/lib/types";
import { HistoryDetailDialog } from "./HistoryDetailDialog";

type CategoryFilter = "all" | CategoryId;

export function HistoryPageClient() {
  const [mounted, setMounted] = useState(false);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [activeId, setActiveId] = useState<string | null>(null);

  const reload = useCallback(() => {
    setEntries(listHistory());
  }, []);

  useEffect(() => {
    setMounted(true);
    reload();
    const onChange = () => reload();
    window.addEventListener("kbg:history-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("kbg:history-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [reload]);

  const filtered = useMemo(() => {
    if (!query.trim() && category === "all") return entries;
    return searchHistory({ query, category });
  }, [entries, query, category]);

  const handleDelete = useCallback(
    (id: string) => {
      if (!confirm("이 항목을 삭제하시겠습니까?")) return;
      deleteHistory(id);
      reload();
    },
    [reload]
  );

  const handleClearAll = useCallback(() => {
    if (
      !confirm(
        `정말 사용 내역 전체(${entries.length}개)를 삭제하시겠습니까?\n복구할 수 없습니다.`
      )
    )
      return;
    clearAllHistory();
    reload();
  }, [entries.length, reload]);

  const activeEntry = activeId ? entries.find((e) => e.id === activeId) : null;

  return (
    <main className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
      {/* 상단 네비 */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          홈으로
        </Link>
      </div>

      {/* 타이틀 */}
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          사용 내역
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          이 브라우저에 저장된 생성 기록입니다. (총 {mounted ? entries.length : 0}개)
        </p>
      </header>

      {/* 필터 바 */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="제목 / 입력값 / 결과에서 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as CategoryFilter)}
          >
            <SelectTrigger>
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 카테고리</SelectItem>
              {CATEGORY_LIST.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleClearAll}
          disabled={!mounted || entries.length === 0}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          전체 삭제
        </Button>
      </div>

      {/* 목록 */}
      {!mounted ? (
        <div className="rounded-lg border bg-card p-12 text-center text-sm text-muted-foreground">
          불러오는 중...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasFilter={!!query.trim() || category !== "all"} />
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((e) => (
            <li key={e.id}>
              <HistoryCard
                entry={e}
                onOpen={() => setActiveId(e.id)}
                onDelete={() => handleDelete(e.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {/* 상세 모달 */}
      {activeEntry && (
        <HistoryDetailDialog
          entry={activeEntry}
          onClose={() => setActiveId(null)}
          onChanged={reload}
        />
      )}
    </main>
  );
}

function HistoryCard({
  entry,
  onOpen,
  onDelete,
}: {
  entry: HistoryEntry;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const meta = CATEGORIES[entry.category];
  const dt = new Date(entry.createdAt);
  const dateStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")} ${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
  const preview =
    entry.result?.slice(0, 100).replace(/\s+/g, " ").trim() ?? "";
  const hasResult = !!entry.result?.trim();

  return (
    <div className="group rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="text-left flex-1 min-w-0"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-flex items-center text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {meta.label}
            </span>
            <span className="text-[11px] text-muted-foreground">{dateStr}</span>
          </div>
          <h3 className="text-sm font-semibold truncate">{entry.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {hasResult ? preview : "(아직 결과가 저장되지 않음)"}
          </p>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="opacity-50 group-hover:opacity-100 hover:text-destructive transition-opacity p-1 shrink-0"
          aria-label="삭제"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span
          className={`text-[11px] inline-flex items-center gap-1 ${
            hasResult ? "text-emerald-600" : "text-amber-600"
          }`}
        >
          <FileText className="h-3 w-3" />
          {hasResult ? "결과 저장됨" : "프롬프트만 있음"}
        </span>
        <button
          type="button"
          onClick={onOpen}
          className="text-xs text-foreground/70 hover:text-foreground"
        >
          자세히 →
        </button>
      </div>
    </div>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="rounded-lg border bg-card p-12 text-center">
      <Inbox className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">
        {hasFilter
          ? "조건에 맞는 항목이 없습니다."
          : "아직 저장된 사용 내역이 없습니다."}
      </p>
      {!hasFilter && (
        <Link
          href="/"
          className="mt-4 inline-block text-sm font-medium text-foreground underline underline-offset-2 hover:no-underline"
        >
          글 생성하러 가기 →
        </Link>
      )}
    </div>
  );
}
