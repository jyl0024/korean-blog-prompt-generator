/**
 * 모든 카테고리 폼이 공통으로 사용하는 인터페이스.
 * - 폼은 내부 상태를 직접 관리하고, 변경 시 onChange(inputs, isValid) 호출.
 * - 부모(GeneratePageClient)는 inputs/isValid 만 보고 제출 가능 여부 판단.
 */
export interface FormProps {
  onChange?: (
    inputs: Record<string, unknown>,
    isValid: boolean
  ) => void;
  /** 재생성 시 폼 비활성화 */
  disabled?: boolean;
}

/** (Optional) ref 핸들 — 현재는 사용하지 않음. */
export interface FormHandle {
  getValues: () => Record<string, unknown>;
  isValid: () => boolean;
}
