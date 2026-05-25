import {
  COMMON_WRITING_RULES,
  bulletize,
  formatStars,
  orNone,
} from "./common";
import type { GenerateInputs } from "../types";

export interface MovieReviewInputs {
  title: string;
  director?: string;
  cast?: string;
  oneLiner?: string;
  goods?: string;
  bads?: string;
  rating?: number | string;
  spoiler?: boolean;
  recommendFor?: string;
}

/**
 * 영화 리뷰 프롬프트 빌더.
 * 반환: { system, user } — Anthropic API에 그대로 넣을 수 있게 분리.
 *
 * TODO: 여기 다듬을 것
 *  - 섹션 구성을 더 다양화(예: "기억에 남는 장면", "OST 인상" 등 옵셔널 섹션)
 *  - 별점에 따라 톤 강도 조절 (5점 ↔ 1점 글의 결이 달라지도록)
 *  - 스포일러 분리 섹션 처리 방식 더 정교화
 */
export function buildPrompt(rawInputs: GenerateInputs): {
  system: string;
  user: string;
} {
  const inputs = rawInputs as unknown as MovieReviewInputs;

  const spoilerLine = inputs.spoiler
    ? "스포일러를 포함해도 됩니다. 단, 글의 중간에 `> ⚠️ 스포일러 주의` 한 줄을 넣어 독자에게 미리 알려주세요."
    : "스포일러는 피해주세요. 결말이나 핵심 반전을 직접적으로 언급하지 마세요.";

  const system = `${COMMON_WRITING_RULES}

[이번 글 유형]
- 카테고리: 영화 리뷰 (관람 후기 블로그 글)
- 분량: 한국어 기준 약 1,200~1,800자 내외
- 구성 권장:
  1) # 제목 — 영화 제목을 살리되, 클릭하고 싶은 한 줄로
  2) 짧은 도입(1~2문단): 어떤 계기로 봤는지, 어떤 기대를 가졌는지
  3) ## 인상 깊었던 점 — 사용자가 적은 "좋았던 점"을 자연스럽게 풀어내기
  4) ## 아쉬웠던 점 — 사용자가 적은 "아쉬웠던 점"을 비판이 아닌 솔직한 느낌으로
  5) ## 누구에게 추천할까 — 사용자가 적은 "추천 대상"을 살려서
  6) 마무리 한 단락 + 마지막 줄에 별점 한 줄

[스포일러 정책]
- ${spoilerLine}`;

  const user = `다음 정보를 바탕으로 영화 리뷰를 작성해주세요.

- 영화 제목: ${orNone(inputs.title)}
- 감독: ${orNone(inputs.director)}
- 주연: ${orNone(inputs.cast)}
- 한줄평: ${orNone(inputs.oneLiner)}
- 별점: ${formatStars(inputs.rating)}
- 추천 대상: ${orNone(inputs.recommendFor)}

[좋았던 점]
${bulletize(inputs.goods)}

[아쉬웠던 점]
${bulletize(inputs.bads)}

위 정보 안에서만 사실을 다루고, 입력에 없는 출연진/줄거리 디테일을 임의로 만들어내지 마세요.
바로 본문부터 시작하세요.`;

  return { system, user };
}
