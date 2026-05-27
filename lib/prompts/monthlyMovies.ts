import {
  COMMON_WRITING_RULES,
  orNone,
  lengthInstruction,
  parseLength,
  parseRecommendCount,
} from "./common";
import type { GenerateInputs } from "../types";

export interface MonthlyMoviesInputs {
  month: string; // "YYYY-MM"
  region: "kr_focus" | "global"; // 한국 개봉작 위주 / 해외 포함
  keywords?: string;
  focus?: string; // 특히 다루고 싶은 작품
  length?: number | string; // 글자수 (1000/2000/.../5000)
  count?: number | string; // 추천 개수 (1~10)
}

/** 지역 옵션 */
export const MOVIE_REGION_OPTIONS: { value: "kr_focus" | "global"; label: string }[] = [
  { value: "kr_focus", label: "한국 개봉작 위주" },
  { value: "global", label: "해외 포함" },
];

function formatMonth(month: string | undefined): string {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) return "(월 정보 없음)";
  const [y, m] = month.split("-");
  return `${y}년 ${Number(m)}월`;
}

const regionDescription = (r: string | undefined): string => {
  if (r === "global")
    return "전 세계 주요 개봉작을 포함합니다. 한국 개봉 일정과 해외 개봉 일정을 함께 다뤄도 좋습니다.";
  return "한국 극장 개봉작을 중심으로 다룹니다. 해외 동시 개봉작은 한국 개봉일 기준으로 정리하세요.";
};

/**
 * monthly-movies 프롬프트 빌더.
 * TODO: 여기 다듬을 것
 *  - 박스오피스/예매율 정보 인용 가이드 강화
 *  - 한국 영화 vs 해외 영화 비중 가이드
 */
export function buildPrompt(rawInputs: GenerateInputs): {
  system: string;
  user: string;
} {
  const inputs = rawInputs as unknown as MonthlyMoviesInputs;
  const monthLabel = formatMonth(inputs.month);
  const length = parseLength(inputs.length);
  const count = parseRecommendCount(inputs.count);

  const system = `${COMMON_WRITING_RULES}

[이번 글 유형]
- 카테고리: ${monthLabel} 영화 큐레이션 (이달의 영화 정보 정리 블로그 글)
- 분량: ${lengthInstruction(length)}
- 독자: 한국 영화 관객 (한국 개봉일/등급/상영관 정보를 중요하게 봄)

[지역 정책]
- ${regionDescription(inputs.region)}

[웹 검색 활용 — 반드시 지키세요]
- 당신은 web_search 도구를 사용할 수 있습니다.
- ${monthLabel} 의 영화 개봉작/주요 이슈를 찾기 위해 web_search 를 적극적으로 사용하세요.
- 검색 쿼리는 한국어와 영어를 섞어 다양하게 시도하세요.
  예) "${monthLabel} 개봉 영화", "${monthLabel} 한국 영화 개봉",
      "${monthLabel} movies release", "${monthLabel} 박스오피스",
      "${monthLabel} 기대작"
- 검색해서 얻은 정보 안에서만 사실(개봉일, 감독, 출연, 줄거리 키워드)을 다루세요.
- 출처가 모호한 정보는 추측해서 적지 마세요.

[작성 시 주의]
- 한국 정식 제목 + 원제 병기 권장. 예: "노스페라투 (Nosferatu)"
- 개봉일은 한국 기준이 기본. 해외 개봉작은 "(국내 미정)" 또는 해외 개봉일을 명시.
- 단정형보다 "개봉 예정", "예매 진행 중" 같은 부드러운 표현이 자연스럽습니다.
- 표(table) 사용 가능 — 작품 정리에 유용.

[권장 구성]
1) # 제목 — "${monthLabel} 극장에서 만날 영화들" 같은 한 줄
2) 짧은 도입(1~2문단): 이번 달 극장가의 흐름, 주목할 분위기
3) ## 주목할 신작 — 핵심 개봉작 ${count}편을 각각 짧은 단락으로 소개
   - 각 작품: 한국제목/원제, 감독, 주요 출연, 개봉일, 한 줄 코멘트
4) (선택) ## 이번 달 개인적으로 가장 기대되는 작품 — 한 작품 골라 짧은 코멘트
5) (선택) ## 함께 보면 좋은 재개봉/특별상영 정보
6) 마무리 한 단락

[금지]
- 검색하지 않은 채로 "5월 15일 개봉" 같은 단정형 사실을 적지 마세요. 반드시 web_search 로 확인 후 인용.
- 모든 개봉작을 망라하지 마세요. 정확히 ${count}편으로 큐레이션하세요.
`;

  const focusLine = inputs.focus?.trim()
    ? `\n[특별히 다루고 싶은 작품]\n${inputs.focus.trim()}\n위 작품들은 본문에 반드시 포함하고, 다른 신작들과 균형 있게 배치하세요.`
    : "";

  const user = `다음 조건으로 ${monthLabel} 의 영화 큐레이션 블로그 글을 써주세요.

- 대상 월: ${monthLabel}
- 지역: ${
    inputs.region === "global" ? "해외 포함" : "한국 개봉작 위주"
  }
- 추천 작품 수: ${count}편 (반드시 이 개수로 큐레이션)
- 추가 키워드: ${orNone(inputs.keywords)}
${focusLine}

먼저 web_search 로 위 조건에 맞는 ${monthLabel} 영화 정보를 충분히 검색한 다음, 그 결과만 사용해 한국어 블로그 글로 정리해주세요.
주목할 신작 섹션에는 정확히 ${count}편을 다뤄주세요.
바로 본문(# 제목)부터 시작하세요.`;

  return { system, user };
}
