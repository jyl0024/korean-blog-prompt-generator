import {
  COMMON_WRITING_RULES,
  orNone,
  lengthInstruction,
  parseLength,
  parseRecommendCount,
} from "./common";
import type { GenerateInputs } from "../types";

/**
 * monthly-games 입력 타입.
 * - month: "YYYY-MM" 형식
 * - platforms: 관심 플랫폼 코드 배열
 * - topics:    다룰 내용 코드 배열
 * - keywords:  추가 키워드(자유)
 */
export interface MonthlyGamesInputs {
  month: string;
  platforms: string[];
  topics: string[];
  keywords?: string;
  length?: number | string;
  count?: number | string;
}

/** 플랫폼 코드 → 라벨 매핑 (UI/프롬프트 양쪽에서 사용) */
export const GAME_PLATFORM_OPTIONS: { value: string; label: string }[] = [
  { value: "steam", label: "Steam (PC)" },
  { value: "ps", label: "PlayStation (PS4/PS5)" },
  { value: "xbox", label: "Xbox (Series X|S / One)" },
  { value: "switch", label: "Nintendo Switch" },
  { value: "mobile", label: "모바일 (iOS/Android)" },
];

/** 다룰 내용 옵션 */
export const GAME_TOPIC_OPTIONS: { value: string; label: string }[] = [
  { value: "new_releases", label: "신작 출시" },
  { value: "sales", label: "할인 정보" },
  { value: "updates", label: "업데이트 소식" },
  { value: "indie", label: "인디 게임" },
];

const platformLabel = (v: string) =>
  GAME_PLATFORM_OPTIONS.find((o) => o.value === v)?.label ?? v;
const topicLabel = (v: string) =>
  GAME_TOPIC_OPTIONS.find((o) => o.value === v)?.label ?? v;

/** "YYYY-MM" → "2025년 5월" 같은 사람 친화 표기 */
function formatMonth(month: string | undefined): string {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) return "(월 정보 없음)";
  const [y, m] = month.split("-");
  return `${y}년 ${Number(m)}월`;
}

/**
 * monthly-games 프롬프트 빌더.
 * 웹 검색(web_search tool)을 적극 활용하도록 시스템 프롬프트에서 지시.
 *
 * TODO: 여기 다듬을 것
 *  - 신뢰할 만한 출처(공식 스토어/뉴스 사이트) 우선 사용 지침 강화
 *  - 한국 게이머 관점(한국어 지원, 한국 가격, 출시일 KST) 강조 보강
 *  - 가격/할인율 변동성 주의 문구 추가
 */
export function buildPrompt(rawInputs: GenerateInputs): {
  system: string;
  user: string;
} {
  const inputs = rawInputs as unknown as MonthlyGamesInputs;

  const monthLabel = formatMonth(inputs.month);
  const length = parseLength(inputs.length);
  const count = parseRecommendCount(inputs.count);
  const platforms = (inputs.platforms ?? []).map(platformLabel);
  const topics = (inputs.topics ?? []).map(topicLabel);

  const platformsLine =
    platforms.length > 0 ? platforms.join(", ") : "전체 플랫폼";
  const topicsLine =
    topics.length > 0 ? topics.join(", ") : "신작 / 할인 / 업데이트 / 인디 전반";

  const system = `${COMMON_WRITING_RULES}

[이번 글 유형]
- 카테고리: ${monthLabel} 게임 큐레이션 (이달의 게임 정보 정리 블로그 글)
- 분량: ${lengthInstruction(length)}
- 독자: 한국 게이머 (한국어 지원 여부, 한국 가격, 한국 시간대 출시일을 중요하게 봄)

[웹 검색 활용 — 반드시 지키세요]
- 당신은 web_search 도구를 사용할 수 있습니다.
- ${monthLabel} 의 게임 신작/이슈/할인 정보를 찾기 위해 web_search 를 적극적으로 사용하세요.
- 검색 쿼리는 한국어와 영어를 섞어서, 구체적이고 다양하게 시도하세요.
  예) "${monthLabel} 게임 신작", "${monthLabel} Steam new releases",
      "${monthLabel} PlayStation 신작", "Nintendo Switch ${monthLabel} releases",
      "${monthLabel} Steam 세일", "Xbox Game Pass ${monthLabel}"
- 사용자가 "관심 플랫폼" 을 지정했다면 해당 플랫폼 위주로 검색하세요.
- 사용자가 "다룰 내용" 을 지정했다면 그 범주(신작/할인/업데이트/인디)만 다루고 다른 범주는 본문에서 빼세요.
- 검색해서 얻은 정보 안에서만 사실(타이틀, 출시일, 가격, 할인율, 업데이트 내용)을 다루세요.
- 출처가 모호하거나 검색 결과에 없는 정보는 추측해서 적지 마세요.

[작성 시 주의]
- 출시일/가격/할인율은 변동 가능성이 있으므로, 단정형보다 "출시 예정", "할인 진행 중" 같은 표현이 자연스럽습니다.
- 한국어 정식 명칭이 있는 경우 한국어 제목 + 원제(영문) 병기 권장. 예: "발더스 게이트 3 (Baldur's Gate 3)"
- 표(table) 사용 가능. 신작 정리 / 할인 정리에 특히 유용.

[권장 구성]
1) # 제목 — "${monthLabel} 챙겨야 할 게임 소식" 같은 한 줄
2) 짧은 도입(1~2문단): 이번 달 게임씬 전반의 분위기, 주목할 흐름
3) 사용자가 지정한 "다룰 내용" 기준으로 ## 섹션 나누기
   - 신작 출시: 타이틀별 짧은 소개 + 플랫폼 + 출시일 (가능하면 표로)
   - 할인 정보: 어떤 스토어에서 어떤 게임이 얼마나 할인되는지
   - 업데이트 소식: 주요 라이브 서비스 게임의 시즌/패치
   - 인디 게임: 주목할 만한 인디 신작/할인
4) (선택) ## 이번 달 개인적으로 가장 기대되는 작품 — 짧은 코멘트
5) 마무리 한 단락

[금지]
- 검색하지 않은 채로 "ABC 게임이 5월 15일에 출시됩니다" 같은 단정형 사실을 적지 마세요. 반드시 web_search 로 확인 후 인용.
- 모든 플랫폼/모든 게임을 망라하려 하지 마세요. 사용자가 지정한 범위 안에서 정확히 ${count}개로 큐레이션하세요.
`;

  const user = `다음 조건으로 ${monthLabel} 의 게임 큐레이션 블로그 글을 써주세요.

- 대상 월: ${monthLabel}
- 관심 플랫폼: ${platformsLine}
- 다룰 내용: ${topicsLine}
- 추천 게임 수: ${count}개 (반드시 이 개수로 큐레이션)
- 추가 키워드: ${orNone(inputs.keywords)}

먼저 web_search 로 위 조건에 맞는 ${monthLabel} 게임 정보를 충분히 검색한 다음, 그 결과만 사용해 한국어 블로그 글로 정리해주세요.
전체적으로 정확히 ${count}개의 게임을 다뤄주세요.
바로 본문(# 제목)부터 시작하세요.`;

  return { system, user };
}
