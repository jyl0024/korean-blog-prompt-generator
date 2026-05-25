import {
  COMMON_WRITING_RULES,
  bulletize,
  formatStars,
  orNone,
} from "./common";
import type { GenerateInputs } from "../types";

export interface GameReviewInputs {
  title: string;
  platform?: string;
  genre?: string;
  playtime?: string;
  oneLiner?: string;
  goods?: string;
  bads?: string;
  rating?: number | string;
  recommendFor?: string;
  valueForMoney?: string;
}

/** 게임 플레이 플랫폼 옵션 */
export const GAME_REVIEW_PLATFORM_OPTIONS: { value: string; label: string }[] = [
  { value: "steam", label: "Steam" },
  { value: "ps5", label: "PS5" },
  { value: "ps4", label: "PS4" },
  { value: "xbox", label: "Xbox" },
  { value: "switch", label: "Nintendo Switch" },
  { value: "mobile", label: "모바일" },
  { value: "pc_other", label: "PC 기타 (EGS/배틀넷 등)" },
];

/** 가성비 옵션 */
export const VALUE_FOR_MONEY_OPTIONS: { value: string; label: string }[] = [
  { value: "excellent", label: "가성비 최고" },
  { value: "good", label: "만족스러움" },
  { value: "fair", label: "값을 한 정도" },
  { value: "poor", label: "다소 아쉬움" },
  { value: "bad", label: "추천 어려움" },
];

const platformLabel = (v: string | undefined) =>
  GAME_REVIEW_PLATFORM_OPTIONS.find((o) => o.value === v)?.label ?? orNone(v);
const valueLabel = (v: string | undefined) =>
  VALUE_FOR_MONEY_OPTIONS.find((o) => o.value === v)?.label ?? orNone(v);

/**
 * 게임 리뷰 프롬프트 빌더.
 * TODO: 여기 다듬을 것
 *  - 장르별 톤 차이(소울라이크 vs 캐주얼 등) 미세 조정
 *  - 플레이타임에 따른 깊이 자동 조정
 */
export function buildPrompt(rawInputs: GenerateInputs): {
  system: string;
  user: string;
} {
  const inputs = rawInputs as unknown as GameReviewInputs;

  const system = `${COMMON_WRITING_RULES}

[이번 글 유형]
- 카테고리: 게임 리뷰 (직접 플레이한 후기 블로그 글)
- 분량: 한국어 기준 약 1,500~2,200자
- 구성 권장:
  1) # 제목 — 게임 제목 + 한 줄 인상
  2) 도입(1~2문단): 어떤 계기로 플레이했는지, 어떤 기대였는지 + 플레이 환경(플랫폼/플레이 시간) 간단히 언급
  3) ## 인상 깊었던 점 — 게임플레이/스토리/연출/사운드/UI 등 좋았던 측면
  4) ## 아쉬웠던 점 — 비판이 아닌 솔직한 감상으로
  5) ## 어떤 게이머에게 추천할까 — 추천 대상
  6) ## 가성비 — 가격 대비 만족도에 대한 짧은 평
  7) 마무리 한 단락 + 마지막 줄에 별점 표기

[작성 시 주의]
- 게임 용어는 자연스럽게 쓰되 처음 등장하는 약어는 풀어쓰기를 한 번 곁들이세요 (예: QoL = 편의성).
- "갓겜", "쓰레기겜" 같은 극단적 표현은 피하고, 좀 더 구체적인 표현으로 풀어쓰세요.
- 플레이 시간이 짧다면(예: 10시간 미만) 그 점을 솔직히 드러내고 "엔딩까지 본 후기는 아니다" 같은 식으로 한계를 인정하세요.`;

  const user = `다음 정보를 바탕으로 게임 리뷰를 작성해주세요.

- 게임 제목: ${orNone(inputs.title)}
- 플레이 플랫폼: ${platformLabel(inputs.platform)}
- 장르: ${orNone(inputs.genre)}
- 플레이 시간: ${orNone(inputs.playtime)}
- 한줄평: ${orNone(inputs.oneLiner)}
- 별점: ${formatStars(inputs.rating)}
- 추천 대상: ${orNone(inputs.recommendFor)}
- 가성비: ${valueLabel(inputs.valueForMoney)}

[좋았던 점]
${bulletize(inputs.goods)}

[아쉬웠던 점]
${bulletize(inputs.bads)}

위 정보 안에서만 사실을 다루고, 입력에 없는 게임 시스템 디테일을 임의로 만들어내지 마세요.
바로 본문(# 제목)부터 시작하세요.`;

  return { system, user };
}
