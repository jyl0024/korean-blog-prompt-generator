import {
  COMMON_WRITING_RULES,
  bulletize,
  formatStars,
  lengthInstruction,
  orNone,
  parseLength,
} from "./common";
import type { GenerateInputs } from "../types";

export interface DramaReviewInputs {
  title: string;
  platform?: string;
  seasonEpisode?: string;
  oneLiner?: string;
  goods?: string;
  bads?: string;
  rating?: number | string;
  spoiler?: boolean;
  /** 글자수 옵션 */
  length?: number | string;
}

/** 드라마 플랫폼 옵션 (UI/프롬프트 공통) */
export const DRAMA_PLATFORM_OPTIONS: { value: string; label: string }[] = [
  { value: "netflix", label: "넷플릭스" },
  { value: "tving", label: "티빙" },
  { value: "disney", label: "디즈니+" },
  { value: "wavve", label: "웨이브" },
  { value: "coupang", label: "쿠팡플레이" },
  { value: "broadcast", label: "지상파/케이블" },
];

const platformLabel = (v: string | undefined) =>
  DRAMA_PLATFORM_OPTIONS.find((o) => o.value === v)?.label ?? orNone(v);

/**
 * 드라마 리뷰 프롬프트 빌더.
 * TODO: 여기 다듬을 것 — 시즌제/주차별 시청 후기 분리, OTT별 톤 차이 미세 조정 등
 */
export function buildPrompt(rawInputs: GenerateInputs): {
  system: string;
  user: string;
} {
  const inputs = rawInputs as unknown as DramaReviewInputs;
  const length = parseLength(inputs.length);

  const spoilerLine = inputs.spoiler
    ? "스포일러를 포함해도 됩니다. 단, 글의 중간에 `> ⚠️ 스포일러 주의` 한 줄을 넣어 독자에게 미리 알려주세요."
    : "스포일러는 피해주세요. 결말이나 핵심 반전을 직접적으로 언급하지 마세요.";

  const system = `${COMMON_WRITING_RULES}

[이번 글 유형]
- 카테고리: 드라마 리뷰 (시청 후기 블로그 글)
- 분량: ${lengthInstruction(length)}
- 구성 권장:
  1) # 제목 — 드라마 제목과 한 줄 인상을 살린 클릭하고 싶은 제목
  2) 짧은 도입(1~2문단): 어떤 계기로 보게 됐는지, 어떤 기대로 봤는지
  3) ## 인상 깊었던 점 — 좋았던 점들을 자연스럽게 풀어쓰기 (배우 연기, 연출, 각본, OST 등)
  4) ## 아쉬웠던 점 — 비판이 아닌 솔직한 감상으로
  5) (선택) ## 어떤 사람에게 추천할까 — 짧게 한 문단
  6) 마무리 한 단락 + 마지막 줄에 별점 표기

[플랫폼 관련]
- 본문 중 자연스럽게 "넷플릭스에서 정주행했다", "디즈니+ 오리지널" 같은 식으로 플랫폼을 한 번쯤 언급하세요.

[스포일러 정책]
- ${spoilerLine}

[금지]
- "이 드라마는 ~을 다룬 작품입니다" 식의 위키 요약체 금지. 첫 문단부터 개인적 감상으로 들어가세요.`;

  const user = `다음 정보를 바탕으로 드라마 리뷰를 작성해주세요.

- 드라마 제목: ${orNone(inputs.title)}
- 플랫폼: ${platformLabel(inputs.platform)}
- 시즌/회차: ${orNone(inputs.seasonEpisode)}
- 한줄평: ${orNone(inputs.oneLiner)}
- 별점: ${formatStars(inputs.rating)}

[좋았던 점]
${bulletize(inputs.goods)}

[아쉬웠던 점]
${bulletize(inputs.bads)}

위 정보 안에서만 사실을 다루고, 입력에 없는 출연진/줄거리 디테일을 임의로 만들어내지 마세요.
바로 본문(# 제목)부터 시작하세요.`;

  return { system, user };
}
