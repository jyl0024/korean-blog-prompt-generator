import Link from "next/link";
import {
  Film,
  Tv,
  Gamepad2,
  CalendarRange,
  Clapperboard,
  Trophy,
  Search,
  PenLine,
  type LucideIcon,
} from "lucide-react";

import { CATEGORY_LIST } from "@/lib/categories";
import type { CategoryMeta } from "@/lib/categories";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<CategoryMeta["icon"], LucideIcon> = {
  Film,
  Tv,
  Gamepad2,
  CalendarRange,
  Clapperboard,
  Trophy,
};

export default function HomePage() {
  const reviews = CATEGORY_LIST.filter((c) => c.group === "review");
  const monthly = CATEGORY_LIST.filter((c) => c.group === "monthly");

  return (
    <main className="container mx-auto max-w-6xl px-4 py-12 sm:py-16">
      {/* 헤더 */}
      <header className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-muted/40 text-xs font-medium text-muted-foreground mb-4">
          <PenLine className="h-3.5 w-3.5" />
          한국어 블로그 글 자동 생성
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          무엇에 대한 글을 쓸까요?
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          영화·드라마·게임 6개 카테고리 중 하나를 골라주세요. <br className="hidden sm:inline" />
          간단한 정보만 입력하면 자연스러운 블로그 글로 완성해드립니다.
        </p>
      </header>

      {/* 리뷰 섹션 */}
      <section className="mb-12">
        <SectionHeading title="리뷰 작성" subtitle="직접 보고/플레이한 작품 후기" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {reviews.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </section>

      {/* 이달의 정보 섹션 */}
      <section>
        <SectionHeading
          title="이달의 정보"
          subtitle="실시간 웹 검색으로 최신 정보 큐레이션"
          badge={
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 text-xs font-medium">
              <Search className="h-3 w-3" />
              웹 검색 활용
            </span>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {monthly.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </section>

      {/* 푸터 */}
      <footer className="mt-20 text-center text-xs text-muted-foreground">
        Powered by Claude · Next.js 14 · shadcn/ui
      </footer>
    </main>
  );
}

function SectionHeading({
  title,
  subtitle,
  badge,
}: {
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
      {badge}
    </div>
  );
}

function CategoryCard({ category }: { category: CategoryMeta }) {
  const Icon = ICON_MAP[category.icon];

  return (
    <Link
      href={`/generate/${category.id}`}
      className={cn(
        "group relative block rounded-xl border bg-card p-5 shadow-sm",
        "transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-foreground/20",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
    >
      {/* 좌상단 아이콘 박스 (gradient) */}
      <div
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-lg",
          "bg-gradient-to-br text-white shadow-sm",
          category.accent
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mt-4 text-lg font-semibold tracking-tight flex items-center gap-2">
        {category.label}
        {category.webSearch && (
          <Search className="h-3.5 w-3.5 text-blue-500" aria-label="웹 검색 활용" />
        )}
      </h3>
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
        {category.description}
      </p>

      <div className="mt-4 inline-flex items-center text-sm font-medium text-foreground/70 group-hover:text-foreground">
        시작하기
        <span aria-hidden className="ml-1 transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </div>
    </Link>
  );
}
