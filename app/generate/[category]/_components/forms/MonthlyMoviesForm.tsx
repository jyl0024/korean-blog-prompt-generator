"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import type { FormProps } from "./types";
import { MOVIE_REGION_OPTIONS } from "@/lib/prompts/monthlyMovies";

interface MonthlyMoviesValues {
  month: string;
  region: "kr_focus" | "global";
  keywords: string;
  focus: string;
}

function defaultMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

const DEFAULT_VALUES: MonthlyMoviesValues = {
  month: "",
  region: "kr_focus",
  keywords: "",
  focus: "",
};

export function MonthlyMoviesForm({ onChange }: FormProps) {
  const [v, setV] = useState<MonthlyMoviesValues>(() => ({
    ...DEFAULT_VALUES,
    month: defaultMonth(),
  }));

  const update = <K extends keyof MonthlyMoviesValues>(
    key: K,
    value: MonthlyMoviesValues[K]
  ) => {
    const next = { ...v, [key]: value };
    setV(next);
    onChange?.(serialize(next), validate(next));
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
          해당 월의 개봉작·박스오피스·기대작 정보를 검색해 정리합니다.
        </p>
      </Field>

      <Field label="지역" required>
        <RadioGroup
          value={v.region}
          onValueChange={(val) =>
            update("region", val as MonthlyMoviesValues["region"])
          }
          className="grid grid-cols-1 sm:grid-cols-2 gap-2"
        >
          {MOVIE_REGION_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 px-3 py-2 rounded-md border bg-background cursor-pointer hover:bg-accent/40 transition-colors"
            >
              <RadioGroupItem value={opt.value} id={`rg-${opt.value}`} />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </RadioGroup>
      </Field>

      <Field label="추가 키워드" help="특정 장르/감독/배우/키워드가 있다면 입력하세요. (선택)">
        <Input
          value={v.keywords}
          onChange={(e) => update("keywords", e.target.value)}
          placeholder="예: 누아르, 한국 독립영화, 봉준호"
        />
      </Field>

      <Field label="특히 다루고 싶은 작품" help="이미 알고 있는 작품이 있다면 적어주세요. 본문에 반드시 포함됩니다. (선택)">
        <Textarea
          rows={3}
          value={v.focus}
          onChange={(e) => update("focus", e.target.value)}
          placeholder={"예: 노스페라투\n승부\n파묘 IMAX 재개봉"}
        />
      </Field>
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

function validate(v: MonthlyMoviesValues): boolean {
  return /^\d{4}-\d{2}$/.test(v.month);
}

function serialize(v: MonthlyMoviesValues): Record<string, unknown> {
  return {
    month: v.month,
    region: v.region,
    keywords: v.keywords.trim(),
    focus: v.focus.trim(),
  };
}
