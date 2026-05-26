/**
 * 외부 AI 챗 사이트로의 진입 링크 빌더.
 *
 * 일부 사이트는 URL 파라미터로 프롬프트 자동 입력을 공식 지원하고,
 * 그렇지 않은 사이트는 그냥 홈으로 보내고 사용자가 직접 붙여넣게 한다.
 */

export interface AiTarget {
  id: "chatgpt" | "claude" | "gemini" | "perplexity";
  label: string;
  /** 웹 검색 카테고리에 적합한 도구인지 */
  goodForSearch: boolean;
  /**
   * 클릭 시 이동할 URL.
   *
   * - "openWith": URL 파라미터로 프롬프트가 자동 입력됨
   * - "openOnly": 그냥 홈으로 이동, 클립보드 복사 후 사용자가 붙여넣기
   */
  build: (prompt: string) =>
    | { mode: "openWith"; url: string }
    | { mode: "openOnly"; url: string };
}

/**
 * ChatGPT: `?q=` 파라미터로 프롬프트 자동 입력 지원
 * (https://chatgpt.com/?q=<encoded-prompt>)
 *
 * 단, URL 길이 제한이 있어 너무 길면 잘릴 수 있음 → 우리는 안전하게 8000자 cap.
 */
const CHATGPT_URL_CAP = 8000;

export const AI_TARGETS: AiTarget[] = [
  {
    id: "chatgpt",
    label: "ChatGPT",
    goodForSearch: true,
    build: (prompt) => {
      if (prompt.length <= CHATGPT_URL_CAP) {
        return {
          mode: "openWith",
          url: `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`,
        };
      }
      return { mode: "openOnly", url: "https://chatgpt.com/" };
    },
  },
  {
    id: "claude",
    label: "Claude",
    goodForSearch: true,
    build: () => ({ mode: "openOnly", url: "https://claude.ai/new" }),
  },
  {
    id: "gemini",
    label: "Gemini",
    goodForSearch: true,
    build: () => ({ mode: "openOnly", url: "https://gemini.google.com/app" }),
  },
  {
    id: "perplexity",
    label: "Perplexity",
    goodForSearch: true,
    build: (prompt) => {
      // perplexity 도 ?q= 지원
      if (prompt.length <= CHATGPT_URL_CAP) {
        return {
          mode: "openWith",
          url: `https://www.perplexity.ai/?q=${encodeURIComponent(prompt)}`,
        };
      }
      return { mode: "openOnly", url: "https://www.perplexity.ai/" };
    },
  },
];
