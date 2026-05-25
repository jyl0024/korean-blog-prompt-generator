"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { FormProps, FormHandle } from "./types";

export interface MovieReviewValues {
  title: string;
  director: string;
  cast: string;
  oneLiner: string;
  goods: string;
  bads: string;
  rating: string; // "1"~"5"
  spoiler: boolean;
  recommendFor: string;
}

const DEFAULT_VALUES: MovieReviewValues = {
  title: "",
  director: "",
  cast: "",
  oneLiner: "",
  goods: "",
  bads: "",
  rating: "4",
  spoiler: false,
  recommendFor: "",
};

export function MovieReviewForm({ onChange }: FormProps) {
  const [v, setV] = useState<MovieReviewValues>(DEFAULT_VALUES);

  const update = <K extends keyof MovieReviewValues>(
    key: K,
    value: MovieReviewValues[K]
  ) => {
    const next = { ...v, [key]: value };
    setV(next);
    onChange?.(serialize(next), validate(next));
  };

  return (
    <div className="space-y-5">
      <Field label="영화 제목" required>
        <Input
          value={v.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="예: 듄: 파트2"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="감독">
          <Input
            value={v.director}
            onChange={(e) => update("director", e.target.value)}
            placeholder="예: 드니 빌뇌브"
          />
        </Field>
        <Field label="주연">
          <Input
            value={v.cast}
            onChange={(e) => update("cast", e.target.value)}
            placeholder="예: 티모시 샬라메, 젠데이아"
          />
        </Field>
      </div>

      <Field label="한줄평">
        <Input
          value={v.oneLiner}
          onChange={(e) => update("oneLiner", e.target.value)}
          placeholder="예: 사막의 서사시가 스크린 가득 펼쳐진다"
        />
      </Field>

      <Field label="좋았던 점" help="줄바꿈으로 여러 항목을 입력하세요.">
        <Textarea
          rows={4}
          value={v.goods}
          onChange={(e) => update("goods", e.target.value)}
          placeholder={"한스 짐머의 OST가 압도적\n영상미가 인상적\n캐릭터 빌딩이 탄탄"}
        />
      </Field>

      <Field label="아쉬웠던 점" help="줄바꿈으로 여러 항목을 입력하세요.">
        <Textarea
          rows={3}
          value={v.bads}
          onChange={(e) => update("bads", e.target.value)}
          placeholder={"중반부 호흡이 다소 느림\n원작을 모르면 따라가기 어려울 수 있음"}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="별점">
          <Select value={v.rating} onValueChange={(val) => update("rating", val)}>
            <SelectTrigger>
              <SelectValue placeholder="별점 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">★★★★★ (5)</SelectItem>
              <SelectItem value="4">★★★★☆ (4)</SelectItem>
              <SelectItem value="3">★★★☆☆ (3)</SelectItem>
              <SelectItem value="2">★★☆☆☆ (2)</SelectItem>
              <SelectItem value="1">★☆☆☆☆ (1)</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="스포일러">
          <label className="flex items-center gap-2 h-10 cursor-pointer">
            <Checkbox
              checked={v.spoiler}
              onCheckedChange={(checked) => update("spoiler", checked === true)}
            />
            <span className="text-sm">스포일러 포함</span>
          </label>
        </Field>
      </div>

      <Field label="추천 대상">
        <Input
          value={v.recommendFor}
          onChange={(e) => update("recommendFor", e.target.value)}
          placeholder="예: SF 대서사를 좋아하는 사람, 원작 팬"
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

function validate(v: MovieReviewValues): boolean {
  return v.title.trim().length > 0;
}

function serialize(v: MovieReviewValues): Record<string, unknown> {
  return {
    title: v.title.trim(),
    director: v.director.trim(),
    cast: v.cast.trim(),
    oneLiner: v.oneLiner.trim(),
    goods: v.goods,
    bads: v.bads,
    rating: Number(v.rating),
    spoiler: v.spoiler,
    recommendFor: v.recommendFor.trim(),
  };
}

// 외부 노출용 핸들 (사용 안 함 — onChange 콜백으로 충분)
export type _MovieReviewFormHandle = FormHandle;
