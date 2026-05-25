import { COMMON_WRITING_RULES, orNone } from "./common";
import type { GenerateInputs } from "../types";
import { DRAMA_PLATFORM_OPTIONS } from "./dramaReview";

export interface MonthlyDramasInputs {
  month: string;
  platforms: string[];
  keywords?: string;
  focus?: string;
}

/** monthly-dramas 폼이 쓰는 플랫폼 옵션 — dramaReview 의 것을 재사용 (단일 소스) */
export const MONTHLY_DRAMA_PLATFORM_OPTIONS = DRAMA_PLATFORM_OPTIONS;

const platformLabel = (v: string) =>
  DRAMA_PLATFORM_OPTIONS.find((o) => o.value === v)?.label ?? v;

function formatMonth(month: string | undefined): string {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) return "(월 정보 없음)";
  const [y, m] = month.split("-");
  return `${y}년 ${Number(m)}월`;
}

/**
 * monthly-dramas 프롬프트 빌더.
 * TODO: 여기 다듬을 것
 *  - 신작 공개 일정과 종영 임박작 정리 가이드 분리
 *  - 시청률/화제성 지표 인용 가이드 추가
 */
export function buildPrompt(rawInputs: GenerateInputs): {
  system: string;
  user: string;
} {
  const inputs = rawInputs as unknown as MonthlyDramasInputs;
  const monthLabel = formatMonth(inputs.month);
  const platforms = (inputs.platforms ?? []).map(platformLabel);
  const platformsLine =
    platforms.length > 0 ? platforms.join(", ") : "전체 OTT/방송 플랫폼";

  const system = `${COMMON_WRITING_RULES}

[이번 글 유형]
- 카테고리: ${monthLabel} 드라마 큐레이션 (이달의 드라마 정보 정리 블로그 글)
- 분량: 한국어 기준 약 1,800~2,800자
- 독자: 한국 시청자 (OTT 가입 여부, 한국 공개일을 중요하게 봄)

[웹 검색 활용 — 반드시 지키세요]
- 당신은 web_search 도구를 사용할 수 있습니다.
- ${monthLabel} 의 한국·해외 드라마 신작 및 이슈를 찾기 위해 web_search 를 적극적으로 사용하세요.
- 검색 쿼리는 한국어와 영어를 섞어 다양하게 시도하세요.
  예) "${monthLabel} 드라마 신작", "${monthLabel} 넷플릭스 한국 드라마",
      "${monthLabel} 티빙 오리지널", "${monthLabel} K-drama release",
      "${monthLabel} 디즈니플러스 드라마"
- 사용자가 "관심 플랫폼" 을 지정했다면 해당 플랫폼 위주로 검색하세요.
- 검색해서 얻은 정보 안에서만 사실(공개일, 출연, 감독/작가, 회차 수)을 다루세요.
- 출처가 모호한 정보는 추측해서 적지 마세요.

[작성 시 주의]
- 한국 정식 제목 + 원제 병기. 예: "삼체 (3 Body Problem)"
- 공개일은 한국 시간 기준. 글로벌 동시 공개작이라면 그 점을 명시.
- 단정형보다 "공개 예정", "방영 중" 같은 표현이 자연스럽습니다.
- 표 사용 가능 — 작품/플랫폼/공개일 정리에 유용.

[권장 구성]
1) # 제목 — "${monthLabel} 챙겨볼 드라마 라인업" 같은 한 줄
2) 짧은 도입(1~2문단): 이번 달 드라마씬 분위기, 주목할 흐름
3) ## 플랫폼별 주목작 — 사용자가 지정한 플랫폼 단위로 섹션 나누기
   - 각 플랫폼 내 2~3편씩, 핵심 정보 + 짧은 코멘트
4) (선택) ## 이번 달 가장 기대되는 드라마 — 한 작품 골라 코멘트
5) 마무리 한 단락

[금지]
- 검색하지 않은 채로 "5월 10일 공개" 같은 단정형 사실을 적지 마세요. 반드시 web_search 로 확인 후 인용.
- 모든 드라마를 망라하지 마세요. 사용자가 지정한 플랫폼 범위 안에서 큐레이션하세요.
`;

  const focusLine = inputs.focus?.trim()
    ? `\n[특별히 다루고 싶은 작품]\n${inputs.focus.trim()}\n위 작품들은 본문에 반드시 포함하고, 다른 신작들과 균형 있게 배치하세요.`
    : "";

  const user = `다음 조건으로 ${monthLabel} 의 드라마 큐레이션 블로그 글을 써주세요.

- 대상 월: ${monthLabel}
- 관심 플랫폼: ${platformsLine}
- 추가 키워드: ${orNone(inputs.keywords)}
${focusLine}

먼저 web_search 로 위 조건에 맞는 ${monthLabel} 드라마 정보를 충분히 검색한 다음, 그 결과만 사용해 한국어 블로그 글로 정리해주세요.
바로 본문(# 제목)부터 시작하세요.`;

  return { system, user };
}
