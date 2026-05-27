/**
 * 클립보드 복사 유틸 — iframe / 권한 거부 환경에서도 최대한 동작하도록 다단 폴백.
 *
 * 우선순위:
 *   1) navigator.clipboard.writeText (Async Clipboard API, HTTPS + 권한 있을 때)
 *   2) document.execCommand("copy") via hidden <textarea> (deprecated 지만 광범위 호환)
 *   3) 둘 다 실패 → 호출자가 알아서 처리 (false 반환)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1) modern API
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // permission denied / iframe sandbox → fallthrough
    }
  }

  // 2) legacy fallback
  if (typeof document !== "undefined") {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      // 화면에 안 보이도록
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "0";
      ta.style.left = "0";
      ta.style.opacity = "0";
      ta.style.pointerEvents = "none";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }

  return false;
}
