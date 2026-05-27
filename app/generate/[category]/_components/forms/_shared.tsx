"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  LENGTH_OPTIONS,
  RECOMMEND_COUNT_OPTIONS,
  type LengthOption,
} from "@/lib/prompts/common";

/* -------------------------------------------------------------------------- */
/* 모든 폼이 공유하는 작은 빌딩 블록                                              */
/* -------------------------------------------------------------------------- */

export function Field({
  label,
  required,
  help,
  children,
}: {
  label: string;
  required?: boolean;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {help && <p className="text-xs text-muted-foreground">{help}</p>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 글자수 선택 — 모든 카테고리에 들어가는 공통 옵션                                */
/* -------------------------------------------------------------------------- */

interface LengthSelectProps {
  /** 현재 값은 string 으로 들고 다님 (Select 컴포넌트와 통일) */
  value: string;
  onChange: (next: string) => void;
}

export function LengthSelect({ value, onChange }: LengthSelectProps) {
  return (
    <Field label="글자수" help="AI 가 생성할 글의 분량 (한국어 기준)">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="글자수 선택" />
        </SelectTrigger>
        <SelectContent>
          {LENGTH_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={String(o.value)}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

/* -------------------------------------------------------------------------- */
/* 추천 개수 선택 — 이달의 * 카테고리 전용                                       */
/* -------------------------------------------------------------------------- */

interface RecommendCountSelectProps {
  value: string;
  onChange: (next: string) => void;
  /** 폼별로 라벨을 살짝 다르게 (예: "추천 영화 개수") */
  label?: string;
  help?: string;
}

export function RecommendCountSelect({
  value,
  onChange,
  label = "추천 개수",
  help = "AI 가 추천해줄 항목 수 (1~10개)",
}: RecommendCountSelectProps) {
  return (
    <Field label={label} help={help}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="개수 선택" />
        </SelectTrigger>
        <SelectContent>
          {RECOMMEND_COUNT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={String(o.value)}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

/* -------------------------------------------------------------------------- */
/* 글자수 옵션 재export (폼이 한 곳에서 import 하도록)                            */
/* -------------------------------------------------------------------------- */

export type { LengthOption };
