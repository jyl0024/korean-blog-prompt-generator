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

/** API 요청 body */
export interface GenerateRequestBody {
  category: CategoryId;
  inputs: GenerateInputs;
}

/** 웹 검색 citation */
export interface Citation {
  url: string;
  title?: string;
  /** 인용된 페이지 내 인용 영역(있을 경우) */
  cited_text?: string;
}

/**
 * /api/generate 가 NDJSON 으로 흘려보내는 이벤트들.
 * 각 줄은 하나의 JSON 객체.
 */
export type StreamEvent =
  | { type: "text"; delta: string }
  | { type: "tool_use"; name: string; status: "start" | "end" }
  | { type: "citation"; citation: Citation }
  | { type: "done" }
  | { type: "error"; message: string };
