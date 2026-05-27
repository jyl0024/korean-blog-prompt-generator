"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import type { FormProps } from "./types";
import {
  GAME_PLATFORM_OPTIONS,
  GAME_TOPIC_OPTIONS,
} from "@/lib/prompts/monthlyGames";
import { LengthSelect, RecommendCountSelect } from "./_shared";

interface MonthlyGamesValues {
  month: string;
  platforms: string[];
  topics: string[];
  keywords: string;
  length: string;
  count: string;
}

function defaultMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

const DEFAULT_VALUES: MonthlyGamesValues = {
  month: "",
  platforms: ["steam", "switch"],
  topics: ["new_releases", "sales"],
  keywords: "",
  length: "2000",
  count: "5",
};

export function MonthlyGamesForm({ onChange }: FormProps) {
  const [v, setV] = useState<MonthlyGamesValues>(() => ({
    ...DEFAULT_VALUES,
    month: defaultMonth(),
  }));

  const update = <K extends keyof MonthlyGamesValues>(
    key: K,
    value: MonthlyGamesValues[K]
  ) => {
    const next = { ...v, [key]: value };
    setV(next);
    onChange?.(serialize(next), validate(next));
  };

  const toggle = (
    key: "platforms" | "topics",
    value: string,
    checked: boolean
  ) => {
    const current = new Set(v[key]);
    if (checked) current.add(value);
    else current.delete(value);
    update(key, Array.from(current));
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
          예: 2025-05 (해당 월의 게임 신작·이슈·할인 정보를 검색해 정리합니다)
        </p>
      </Field>

      <Field
        label="관심 플랫폼"
        required
        help="하나 이상 선택해주세요. 선택한 플랫폼 위주로 검색합니다."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {GAME_PLATFORM_OPTIONS.map((opt) => (
            <CheckboxRow
              key={opt.value}
              id={`pf-${opt.value}`}
              label={opt.label}
              checked={v.platforms.includes(opt.value)}
              onCheckedChange={(c) => toggle("platforms", opt.value, c)}
            />
          ))}
        </div>
      </Field>

      <Field
        label="다룰 내용"
        required
        help="이번 글에서 어떤 종류의 게임 소식을 다룰지 선택해주세요."
      >
        <div className="grid grid-cols-2 gap-2">
          {GAME_TOPIC_OPTIONS.map((opt) => (
            <CheckboxRow
              key={opt.value}
              id={`tp-${opt.value}`}
              label={opt.label}
              checked={v.topics.includes(opt.value)}
              onCheckedChange={(c) => toggle("topics", opt.value, c)}
            />
          ))}
        </div>
      </Field>

      <Field label="추가 키워드" help="특정 게임/장르/키워드가 있다면 입력하세요. (선택)">
        <Input
          value={v.keywords}
          onChange={(e) => update("keywords", e.target.value)}
          placeholder="예: 소울라이크, JRPG, 멀티플레이"
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
          label="추천 게임 개수"
          help="몇 개의 게임을 소개할지 (1~10개)"
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

function CheckboxRow({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2 px-3 py-2 rounded-md border bg-background cursor-pointer hover:bg-accent/40 transition-colors"
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(c) => onCheckedChange(c === true)}
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

function validate(v: MonthlyGamesValues): boolean {
  return (
    /^\d{4}-\d{2}$/.test(v.month) &&
    v.platforms.length > 0 &&
    v.topics.length > 0
  );
}

function serialize(v: MonthlyGamesValues): Record<string, unknown> {
  return {
    month: v.month,
    platforms: v.platforms,
    topics: v.topics,
    keywords: v.keywords.trim(),
    length: Number(v.length),
    count: Number(v.count),
  };
}
