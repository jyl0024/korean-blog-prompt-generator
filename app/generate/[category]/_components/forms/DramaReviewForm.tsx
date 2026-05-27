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

import type { FormProps } from "./types";
import { DRAMA_PLATFORM_OPTIONS } from "@/lib/prompts/dramaReview";
import { LengthSelect } from "./_shared";

interface DramaReviewValues {
  title: string;
  platform: string;
  seasonEpisode: string;
  oneLiner: string;
  goods: string;
  bads: string;
  rating: string;
  spoiler: boolean;
  length: string;
}

const DEFAULT_VALUES: DramaReviewValues = {
  title: "",
  platform: "netflix",
  seasonEpisode: "",
  oneLiner: "",
  goods: "",
  bads: "",
  rating: "4",
  spoiler: false,
  length: "2000",
};

export function DramaReviewForm({ onChange }: FormProps) {
  const [v, setV] = useState<DramaReviewValues>(DEFAULT_VALUES);

  const update = <K extends keyof DramaReviewValues>(
    key: K,
    value: DramaReviewValues[K]
  ) => {
    const next = { ...v, [key]: value };
    setV(next);
    onChange?.(serialize(next), validate(next));
  };

  return (
    <div className="space-y-5">
      <Field label="드라마 제목" required>
        <Input
          value={v.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="예: 무빙"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="플랫폼" required>
          <Select
            value={v.platform}
            onValueChange={(val) => update("platform", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="플랫폼 선택" />
            </SelectTrigger>
            <SelectContent>
              {DRAMA_PLATFORM_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="시즌/회차" help="예: 시즌 1, 12부작 / 1~6화">
          <Input
            value={v.seasonEpisode}
            onChange={(e) => update("seasonEpisode", e.target.value)}
            placeholder="예: 시즌 1 (20부작)"
          />
        </Field>
      </div>

      <Field label="한줄평">
        <Input
          value={v.oneLiner}
          onChange={(e) => update("oneLiner", e.target.value)}
          placeholder="예: 흔한 초능력물인 줄 알았는데 결국엔 가족 드라마였다"
        />
      </Field>

      <Field label="좋았던 점" help="줄바꿈으로 여러 항목을 입력하세요.">
        <Textarea
          rows={4}
          value={v.goods}
          onChange={(e) => update("goods", e.target.value)}
          placeholder={"배우들의 연기 합이 좋았음\n중반 이후 감정선이 묵직함\n액션 시퀀스의 완성도"}
        />
      </Field>

      <Field label="아쉬웠던 점" help="줄바꿈으로 여러 항목을 입력하세요.">
        <Textarea
          rows={3}
          value={v.bads}
          onChange={(e) => update("bads", e.target.value)}
          placeholder={"초반부 진행이 다소 느림\n일부 캐릭터의 비중이 아쉬움"}
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

      <LengthSelect
        value={v.length}
        onChange={(next) => update("length", next)}
      />
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

function validate(v: DramaReviewValues): boolean {
  return v.title.trim().length > 0 && v.platform.length > 0;
}

function serialize(v: DramaReviewValues): Record<string, unknown> {
  return {
    title: v.title.trim(),
    platform: v.platform,
    seasonEpisode: v.seasonEpisode.trim(),
    oneLiner: v.oneLiner.trim(),
    goods: v.goods,
    bads: v.bads,
    rating: Number(v.rating),
    spoiler: v.spoiler,
    length: Number(v.length),
  };
}
