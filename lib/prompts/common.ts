/**
 * 모든 카테고리에서 공통으로 사용하는 작성 규칙.
 * 시스템 프롬프트의 앞부분에 항상 prepend 됨.
 *
 * TODO: 여기 다듬을 것 — 실제 운영하면서 "AI 티" 패턴이 보이면
 *       금지 표현/말투 가이드를 계속 보강합니다.
 */
export const COMMON_WRITING_RULES = `
당신은 한국어 블로그 글을 자연스럽게 써내는 전문 작가입니다.
이 글은 **모바일에서 읽히는 블로그 글**입니다. 모바일 가독성이 가장 중요합니다.
아래 규칙을 반드시 지키세요.

[기본 톤앤매너]
- 한국어로 작성합니다. 존댓말(해요체)을 기본으로, 너무 딱딱하지 않고 친근한 블로그 톤을 유지하세요.
- "AI가 쓴 것 같은" 표현을 피하세요. 아래 표현은 사용하지 마세요:
  - "여러분", "~에 대해 알아보겠습니다", "결론적으로 말씀드리면"
  - "~할 수 있는 작품입니다", "다양한 매력을 지닌"
  - 불필요한 영어 단어/전문용어 남발
  - 문장 시작이 "이 영화는", "이 드라마는", "이 게임은" 등으로 반복되는 패턴
- 같은 문장 시작/끝맺음을 연속해서 쓰지 마세요.
- 과장된 형용사("최고의", "역대급", "압도적인")는 꼭 필요한 경우만 절제해서 사용하세요.

[모바일 가독성 — 가장 중요, 반드시 지킬 것]
모바일 화면에서는 3줄을 넘으면 사람이 안 읽고 스크롤합니다.
다음 규칙을 엄격히 지키세요:

1. **한 단락 = 1~2문장, 최대 3문장까지**.
   절대 4문장 이상을 한 단락에 묶지 마세요.
2. **한 문장은 짧게**. 한 문장에 쉼표 2개 이상이면 끊으세요.
   - ❌ "이 영화는 감독의 전작과 비슷한 분위기를 가지고 있으면서도, 새로운 시도가 돋보이고, 배우들의 연기도 훌륭해서 좋았습니다."
   - ✅ "감독의 전작과 비슷한 분위기예요. 그런데 새로운 시도가 돋보입니다. 배우들의 연기도 좋았어요."
3. **단락과 단락 사이는 빈 줄로 충분히 띄우세요**.
   읽는 사람이 숨 쉴 공간이 필요합니다.
4. **핵심 키워드는 **굵게** 처리**해서 스캔하기 쉽게 만드세요.
   한 단락에 1~2개 정도가 적절합니다.
5. **나열할 게 3개 이상이면 줄글 대신 글머리표(-)나 번호 목록을 쓰세요**.
6. **소제목(##) 사이의 본문은 짧게 — 보통 3~5단락 안에서 끝내세요**.
   소제목 하나에 너무 많은 내용을 욱여넣지 마세요.

[형식]
- 출력은 마크다운(Markdown) 형식입니다.
- 글머리: # (h1) 제목 1개로 시작하세요. 본문 섹션은 ## (h2) 를 사용합니다.
- 강조는 **굵게** 를 적극 활용하세요. *기울임* 은 절제해서.
- 인용구(>) 는 인상 깊은 한 줄 강조에 가끔 사용하세요.
- 표(table)는 비교/정리에 유용하지만 모바일에서 가로 스크롤이 생기므로 3열 이하로 제한하세요.

[금지]
- 사용자가 제공하지 않은 사실(출연진, 출시일, 줄거리 등)을 임의로 만들어내지 마세요.
  사실 확인이 안 되는 부분은 사용자가 준 정보 안에서만 다룹니다.
- 글 끝에 "이상으로...", "지금까지...", "감사합니다" 같은 작별 인사 패턴 금지.
- 메타 설명("이 글에서는 ~을 다룹니다") 으로 시작하지 마세요. 바로 본론으로 들어가세요.
- **4문장 이상이 한 단락에 묶인 "벽돌 단락" 절대 금지**. 모바일에서 안 읽힙니다.

[마무리]
- 마지막 문단은 자연스러운 여운으로 끝맺어 주세요. 형식적인 결론보다는 솔직한 한두 줄 감상을 권장합니다.
- 마무리도 짧게 (2~3문장).
`.trim();

/**
 * 별점(1-5)을 시각적 별 표시로 변환.
 * 프롬프트에 넘기기 좋은 형태로 가공.
 */
export function formatStars(rating: number | string | undefined): string {
  const n = Number(rating);
  if (!Number.isFinite(n) || n < 1 || n > 5) return "(별점 정보 없음)";
  const full = "★".repeat(Math.floor(n));
  const empty = "☆".repeat(5 - Math.floor(n));
  return `${full}${empty} (${n}/5)`;
}

/**
 * 멀티라인 텍스트 → 마크다운 글머리표 리스트로 변환.
 * 빈 줄/공백 줄은 무시.
 */
export function bulletize(text: string | undefined): string {
  if (!text) return "(입력 없음)";
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return "(입력 없음)";
  return lines.map((l) => `- ${l}`).join("\n");
}

/** 빈 문자열/undefined 를 "(입력 없음)" 으로 치환 */
export function orNone(v: unknown): string {
  if (v === undefined || v === null) return "(입력 없음)";
  const s = String(v).trim();
  return s.length === 0 ? "(입력 없음)" : s;
}

/* -------------------------------------------------------------------------- */
/* 글자수 옵션 — 모든 카테고리 공통                                              */
/* -------------------------------------------------------------------------- */

export type LengthOption = 1000 | 2000 | 3000 | 4000 | 5000;

export const LENGTH_OPTIONS: { value: LengthOption; label: string }[] = [
  { value: 1000, label: "짧게 (약 1,000자)" },
  { value: 2000, label: "보통 (약 2,000자)" },
  { value: 3000, label: "길게 (약 3,000자)" },
  { value: 4000, label: "매우 길게 (약 4,000자)" },
  { value: 5000, label: "최대 (약 5,000자)" },
];

export const DEFAULT_LENGTH: LengthOption = 2000;

/**
 * 폼 값(string|number|undefined) → 유효한 LengthOption 으로 정규화.
 * 잘못된 값이면 DEFAULT_LENGTH 를 돌려준다.
 */
export function parseLength(v: unknown): LengthOption {
  const n = typeof v === "string" ? Number(v) : (v as number);
  if (n === 1000 || n === 2000 || n === 3000 || n === 4000 || n === 5000) {
    return n;
  }
  return DEFAULT_LENGTH;
}

/**
 * 시스템 프롬프트에 들어갈 분량 지시문.
 * 기존 프롬프트 빌더의 "분량: ..." 줄을 이 함수로 대체.
 *
 * 글자수에는 약간의 허용 범위를 둬서 AI 가 너무 깐깐하게 자르지 않도록 한다.
 */
export function lengthInstruction(target: LengthOption): string {
  // 목표 글자수 ±15% 정도의 자연스러운 폭
  const min = Math.round(target * 0.85);
  const max = Math.round(target * 1.15);
  return `한국어 기준 약 ${target.toLocaleString()}자 분량 (최소 ${min.toLocaleString()}자, 최대 ${max.toLocaleString()}자). 이 범위를 지키되 자연스러운 흐름을 우선하세요.`;
}

/* -------------------------------------------------------------------------- */
/* 추천 개수 옵션 — 이달의 * 카테고리 공통                                       */
/* -------------------------------------------------------------------------- */

export const RECOMMEND_COUNT_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "1개" },
  { value: 2, label: "2개" },
  { value: 3, label: "3개" },
  { value: 4, label: "4개" },
  { value: 5, label: "5개" },
  { value: 6, label: "6개" },
  { value: 7, label: "7개" },
  { value: 8, label: "8개" },
  { value: 9, label: "9개" },
  { value: 10, label: "10개" },
];

export const DEFAULT_RECOMMEND_COUNT = 5;

/**
 * 폼 값 → 1~10 범위의 정수로 정규화.
 */
export function parseRecommendCount(v: unknown): number {
  const n = typeof v === "string" ? Number(v) : (v as number);
  if (!Number.isFinite(n)) return DEFAULT_RECOMMEND_COUNT;
  const intN = Math.round(n);
  if (intN < 1) return 1;
  if (intN > 10) return 10;
  return intN;
}
