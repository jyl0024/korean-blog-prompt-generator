/**
 * 사용 내역 관리 (localStorage 기반)
 *
 * - 서버 컴포넌트에서 호출하면 안 됨 (반드시 클라이언트에서만)
 * - 키: "kbg.history.v1"
 * - 최신순 정렬 보장 (createdAt DESC)
 */

import type { CategoryId, HistoryEntry } from "./types";

const STORAGE_KEY = "kbg.history.v1";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readRaw(): HistoryEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as HistoryEntry[];
  } catch (e) {
    console.warn("history 읽기 실패", e);
    return [];
  }
}

function writeRaw(entries: HistoryEntry[]) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    // 동일 탭에서 페이지 간 이벤트 전파용
    window.dispatchEvent(new Event("kbg:history-changed"));
  } catch (e) {
    console.error("history 저장 실패", e);
    alert("저장 용량이 부족하거나 저장에 실패했습니다.");
  }
}

/** 새 ID 생성 */
export function newHistoryId(): string {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 8);
  return `${ts}-${rnd}`;
}

/** 전체 내역 (최신순) */
export function listHistory(): HistoryEntry[] {
  return readRaw().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/** 단일 항목 조회 */
export function getHistoryById(id: string): HistoryEntry | undefined {
  return readRaw().find((e) => e.id === id);
}

/** 신규 저장 (id 가 이미 있으면 갱신) */
export function upsertHistory(entry: HistoryEntry) {
  const all = readRaw();
  const idx = all.findIndex((e) => e.id === entry.id);
  if (idx >= 0) {
    all[idx] = entry;
  } else {
    all.push(entry);
  }
  writeRaw(all);
}

/** 결과(result) 만 갱신 */
export function updateHistoryResult(id: string, result: string) {
  const all = readRaw();
  const idx = all.findIndex((e) => e.id === id);
  if (idx < 0) return;
  all[idx] = { ...all[idx], result };
  writeRaw(all);
}

/** 제목 갱신 */
export function updateHistoryTitle(id: string, title: string) {
  const all = readRaw();
  const idx = all.findIndex((e) => e.id === id);
  if (idx < 0) return;
  all[idx] = { ...all[idx], title };
  writeRaw(all);
}

/** 삭제 */
export function deleteHistory(id: string) {
  const all = readRaw().filter((e) => e.id !== id);
  writeRaw(all);
}

/** 전체 삭제 */
export function clearAllHistory() {
  writeRaw([]);
}

/**
 * 카테고리 / 검색어 필터링
 *
 * @param query 제목/입력값/결과에 대한 부분일치 (소문자 비교)
 * @param category 카테고리 id (없으면 전체)
 */
export function searchHistory(opts: {
  query?: string;
  category?: CategoryId | "all";
}): HistoryEntry[] {
  const q = (opts.query ?? "").trim().toLowerCase();
  const cat = opts.category ?? "all";

  return listHistory().filter((e) => {
    if (cat !== "all" && e.category !== cat) return false;
    if (!q) return true;

    // 제목
    if (e.title.toLowerCase().includes(q)) return true;
    // 결과 본문
    if (e.result && e.result.toLowerCase().includes(q)) return true;
    // 입력값 (직렬화해서 검색)
    try {
      const inputsStr = JSON.stringify(e.inputs).toLowerCase();
      if (inputsStr.includes(q)) return true;
    } catch {
      /* noop */
    }
    return false;
  });
}

/** 폼 입력값에서 자동으로 제목을 뽑아옴 */
export function deriveTitle(
  category: CategoryId,
  inputs: Record<string, unknown>
): string {
  // 흔히 쓰는 키들을 순회하며 적당한 값 찾기
  const candidateKeys = [
    "title", // 영화/드라마/게임 제목
    "name",
    "movieTitle",
    "dramaTitle",
    "gameTitle",
    "topic",
    "subject",
    "month", // 이달의 *
  ];
  for (const k of candidateKeys) {
    const v = inputs[k];
    if (typeof v === "string" && v.trim()) {
      return v.trim().slice(0, 80);
    }
  }
  // 폴백: 카테고리명 + 날짜
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${categoryLabel(category)} ${now.getFullYear()}-${m}-${d}`;
}

function categoryLabel(c: CategoryId): string {
  switch (c) {
    case "movie-review":
      return "영화 리뷰";
    case "drama-review":
      return "드라마 리뷰";
    case "game-review":
      return "게임 리뷰";
    case "monthly-movies":
      return "이달의 영화";
    case "monthly-dramas":
      return "이달의 드라마";
    case "monthly-games":
      return "이달의 게임";
  }
}
