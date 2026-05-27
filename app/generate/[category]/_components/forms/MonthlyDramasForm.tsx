"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import type { FormProps } from "./types";
import { MONTHLY_DRAMA_PLATFORM_OPTIONS } from "@/lib/prompts/monthlyDramas";
import { LengthSelect, RecommendCountSelect } from "./_shared";

interface MonthlyDramasValues {
  month: string;
  platforms: string[];
  keywords: string;
  focus: string;
  length: string;
  count: string;
}

function defaultMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

const DEFAULT_VALUES: MonthlyDramasValues = {
  month: "",
  platforms: ["netflix", "tving"],
  keywords: "",
  focus: "",
  length: "2000",
  count: "5",
};

export function MonthlyDramasForm({ onChange }: FormProps) {
  const [v, setV] = useState<MonthlyDramasValues>(() => ({
    ...DEFAULT_VALUES,
    month: defaultMonth(),
  }));

  const update = <K extends keyof MonthlyDramasValues>(
    key: K,
    value: MonthlyDramasValues[K]
  ) => {
    const next = { ...v, [key]: value };
    setV(next);
    onChange?.(serialize(next), validate(next));
  };

  const togglePlatform = (value: string, checked: boolean) => {
    const current = new Set(v.platforms);
    if (checked) current.add(value);
    else current.delete(value);
    update("platforms", Array.from(current));
  };

  return (
    <div className="space-y-5">
      <Field label="대상 월" required>
        <Input
          type="month"
          value={v.month}
          onChange={(e) => update("month", e.target.value)}
          max="2099-12"
          min="2000-01"
        />
        <p className="text-xs text-muted-foreground">
          해당 월의 OTT/방송 드라마 신작·이슈를 검색해 정리합니다.
        </p>
      </Field>

      <Field
        label="관심 플랫폼"
        required
        help="하나 이상 선택해주세요. 선택한 플랫폼 위주로 검색합니다."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MONTHLY_DRAMA_PLATFORM_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              htmlFor={`md-pf-${opt.value}`}
              className="flex items-center gap-2 px-3 py-2 rounded-md border bg-background cursor-pointer hover:bg-accent/40 transition-colors"
            >
              <Checkbox
                id={`md-pf-${opt.value}`}
                checked={v.platforms.includes(opt.value)}
                onCheckedChange={(c) => togglePlatform(opt.value, c === true)}
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </Field>

      <Field label="추가 키워드" help="특정 장르/배우/키워드가 있다면 입력하세요. (선택)">
        <Input
          value={v.keywords}
          onChange={(e) => update("keywords", e.target.value)}
          placeholder="예: 로맨스, 스릴러, 사극"
        />
      </Field>

      <Field
        label="특히 다루고 싶은 작품"
        help="이미 알고 있는 작품이 있다면 적어주세요. 본문에 반드시 포함됩니다. (선택)"
      >
        <Textarea
          rows={3}
          value={v.focus}
          onChange={(e) => update("focus", e.target.value)}
          placeholder={"예: 폭싹 속았수다\n별들에게 물어봐\n원경"}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <LengthSelect
          value={v.length}
          onChange={(next) => update("length", next)}
        />
        <RecommendCountSelect
          value={v.count}
          onChange={(next) => update("count", next)}
          label="추천 드라마 개수"
          help="몇 편의 드라마를 소개할지 (1~10편)"
        />
      </div>
    </div>
  );
}

function Field({
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

function validate(v: MonthlyDramasValues): boolean {
  return /^\d{4}-\d{2}$/.test(v.month) && v.platforms.length > 0;
}

function serialize(v: MonthlyDramasValues): Record<string, unknown> {
  return {
    month: v.month,
    platforms: v.platforms,
    keywords: v.keywords.trim(),
    focus: v.focus.trim(),
    length: Number(v.length),
    count: Number(v.count),
  };
}
