"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { FormProps } from "./types";
import {
  GAME_REVIEW_PLATFORM_OPTIONS,
  VALUE_FOR_MONEY_OPTIONS,
} from "@/lib/prompts/gameReview";

interface GameReviewValues {
  title: string;
  platform: string;
  genre: string;
  playtime: string;
  oneLiner: string;
  goods: string;
  bads: string;
  rating: string;
  recommendFor: string;
  valueForMoney: string;
}

const DEFAULT_VALUES: GameReviewValues = {
  title: "",
  platform: "steam",
  genre: "",
  playtime: "",
  oneLiner: "",
  goods: "",
  bads: "",
  rating: "4",
  recommendFor: "",
  valueForMoney: "good",
};

export function GameReviewForm({ onChange }: FormProps) {
  const [v, setV] = useState<GameReviewValues>(DEFAULT_VALUES);

  const update = <K extends keyof GameReviewValues>(
    key: K,
    value: GameReviewValues[K]
  ) => {
    const next = { ...v, [key]: value };
    setV(next);
    onChange?.(serialize(next), validate(next));
  };

  return (
    <div className="space-y-5">
      <Field label="게임 제목" required>
        <Input
          value={v.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="예: 발더스 게이트 3"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="플랫폼" required>
          <Select value={v.platform} onValueChange={(val) => update("platform", val)}>
            <SelectTrigger>
              <SelectValue placeholder="플랫폼 선택" />
            </SelectTrigger>
            <SelectContent>
              {GAME_REVIEW_PLATFORM_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="장르">
          <Input
            value={v.genre}
            onChange={(e) => update("genre", e.target.value)}
            placeholder="예: CRPG, 턴제 RPG"
          />
        </Field>
      </div>

      <Field label="플레이 시간" help="예: 80시간, 클리어까지 / 50시간, 진행 중">
        <Input
          value={v.playtime}
          onChange={(e) => update("playtime", e.target.value)}
          placeholder="예: 80시간 (1회차 클리어)"
        />
      </Field>

      <Field label="한줄평">
        <Input
          value={v.oneLiner}
          onChange={(e) => update("oneLiner", e.target.value)}
          placeholder="예: TRPG의 자유도를 디지털로 가장 잘 풀어낸 작품"
        />
      </Field>

      <Field label="좋았던 점" help="줄바꿈으로 여러 항목을 입력하세요.">
        <Textarea
          rows={4}
          value={v.goods}
          onChange={(e) => update("goods", e.target.value)}
          placeholder={"선택지의 무게감과 결과의 다양성\n동료 캐릭터들의 입체감\n전투 시스템의 깊이"}
        />
      </Field>

      <Field label="아쉬웠던 점" help="줄바꿈으로 여러 항목을 입력하세요.">
        <Textarea
          rows={3}
          value={v.bads}
          onChange={(e) => update("bads", e.target.value)}
          placeholder={"3막 후반부 일부 마무리 부족\n초반 학습 곡선이 가파름"}
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
        <Field label="가성비">
          <Select
            value={v.valueForMoney}
            onValueChange={(val) => update("valueForMoney", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="가성비 평가" />
            </SelectTrigger>
            <SelectContent>
              {VALUE_FOR_MONEY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="추천 대상">
        <Input
          value={v.recommendFor}
          onChange={(e) => update("recommendFor", e.target.value)}
          placeholder="예: TRPG/CRPG 입문자, 스토리 중심 게임 좋아하는 분"
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

function validate(v: GameReviewValues): boolean {
  return v.title.trim().length > 0 && v.platform.length > 0;
}

function serialize(v: GameReviewValues): Record<string, unknown> {
  return {
    title: v.title.trim(),
    platform: v.platform,
    genre: v.genre.trim(),
    playtime: v.playtime.trim(),
    oneLiner: v.oneLiner.trim(),
    goods: v.goods,
    bads: v.bads,
    rating: Number(v.rating),
    recommendFor: v.recommendFor.trim(),
    valueForMoney: v.valueForMoney,
  };
}
