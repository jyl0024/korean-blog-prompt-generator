/**
 * 공통 타입 정의
 */

export type CategoryId =
  | "movie-review"
  | "drama-review"
  | "game-review"
  | "monthly-movies"
  | "monthly-dramas"
  | "monthly-games";

/** 폼에서 받는 입력값 (자유 형태 객체) */
export type GenerateInputs = Record<string, unknown>;

/** 프롬프트 빌더 결과 */
export interface BuiltPrompt {
  system: string;
  user: string;
}

/**
 * 사용 내역 항목 (localStorage 저장 단위).
 *
 * 사용자가 폼을 채워 "프롬프트 생성"을 누른 시점에 1차로 저장되고,
 * AI 응답을 붙여넣어 "내역에 저장"을 누른 시점에 `result` 가 채워집니다.
 */
export interface HistoryEntry {
  /** 고유 id (timestamp + random) */
  id: string;
  /** 카테고리 id */
  category: CategoryId;
  /** 사용자 정의 제목 (없으면 자동 추출) */
  title: string;
  /** 생성/저장 시각 (ISO) */
  createdAt: string;
  /** 폼 입력값 원본 */
  inputs: GenerateInputs;
  /** 생성된 프롬프트 (system + user) */
  prompt: BuiltPrompt;
  /** AI 가 응답한 본문 (마크다운) — 비어있을 수 있음 */
  result?: string;
}
