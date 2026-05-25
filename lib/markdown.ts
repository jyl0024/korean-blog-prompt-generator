/**
 * 마크다운 → 순수 텍스트(plain text) 변환.
 * 복사 버튼 "텍스트만 복사" 기능에서 사용.
 *
 * 간단한 정규식 기반. 외부 라이브러리 없이 충분히 동작.
 * - # 헤더 마커 제거
 * - **굵게**, *기울임* 마커 제거
 * - [텍스트](url) → "텍스트 (url)" 또는 텍스트만
 * - ``` 코드블록 / `인라인 코드` 마커 제거
 * - > 인용 마커 제거
 * - 리스트 마커(-, *, 1.) 그대로 유지 (가독성)
 */
export function markdownToPlainText(md: string): string {
  let text = md;

  // 코드 블록 (```lang ... ```) — 내용은 살리고 마커만 제거
  text = text.replace(/```[\w-]*\n?([\s\S]*?)```/g, (_m, code) => code.trim());

  // 인라인 코드 `code`
  text = text.replace(/`([^`]+)`/g, "$1");

  // 이미지 ![alt](url) → alt
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1");

  // 링크 [text](url) → text (url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");

  // 헤더 마커 # 제거 (한 줄 단위)
  text = text.replace(/^#{1,6}\s+/gm, "");

  // 굵게/기울임/취소선
  text = text.replace(/\*\*\*([^*]+)\*\*\*/g, "$1");
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/\*([^*\n]+)\*/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");
  text = text.replace(/_([^_\n]+)_/g, "$1");
  text = text.replace(/~~([^~]+)~~/g, "$1");

  // 인용 마커 > 제거 (들여쓰기 보존)
  text = text.replace(/^>\s?/gm, "");

  // 수평선 ---
  text = text.replace(/^-{3,}$/gm, "");

  // 과도한 빈 줄 정리 (3줄 이상 → 2줄)
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}
