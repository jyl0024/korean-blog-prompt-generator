import type { CategoryId } from "./types";

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  description: string;
  webSearch: boolean;
  /** 메인 페이지 카드 색상 (Tailwind gradient) */
  accent: string;
  /** lucide-react 아이콘 이름 (CategoryCard 에서 매핑) */
  icon:
    | "Film"
    | "Tv"
    | "Gamepad2"
    | "CalendarRange"
    | "Clapperboard"
    | "Trophy";
  /** 사용자 친화적 카테고리 그룹 */
  group: "review" | "monthly";
}

/**
 * 카테고리 메타데이터 - 사이트 전반의 단일 진실 공급원(Single Source of Truth).
 * - 메인 페이지 카드 렌더링
 * - /generate/[category] 라우트 검증
 * - API 라우트의 web_search ON/OFF 분기
 * - 프롬프트 빌더 매핑
 */
export const CATEGORIES: Record<CategoryId, CategoryMeta> = {
  "movie-review": {
    id: "movie-review",
    label: "영화 리뷰",
    description: "본 영화를 정리해 블로그용 리뷰 글로 다듬어드립니다.",
    webSearch: false,
    accent: "from-rose-500/80 to-orange-500/80",
    icon: "Film",
    group: "review",
  },
  "drama-review": {
    id: "drama-review",
    label: "드라마 리뷰",
    description: "정주행한 드라마의 감상을 정돈된 후기로 작성합니다.",
    webSearch: false,
    accent: "from-violet-500/80 to-fuchsia-500/80",
    icon: "Tv",
    group: "review",
  },
  "game-review": {
    id: "game-review",
    label: "게임 리뷰",
    description: "직접 플레이한 게임의 후기를 가성비/추천 대상까지 정리합니다.",
    webSearch: false,
    accent: "from-emerald-500/80 to-teal-500/80",
    icon: "Gamepad2",
    group: "review",
  },
  "monthly-movies": {
    id: "monthly-movies",
    label: "이달의 영화 정보",
    description: "이번 달 개봉/주요 영화 정보를 검색해 큐레이션 글로 작성합니다.",
    webSearch: true,
    accent: "from-amber-500/80 to-red-500/80",
    icon: "Clapperboard",
    group: "monthly",
  },
  "monthly-dramas": {
    id: "monthly-dramas",
    label: "이달의 드라마 정보",
    description:
      "이번 달 OTT/방영 드라마 신작·이슈를 검색해 정리 글을 작성합니다.",
    webSearch: true,
    accent: "from-pink-500/80 to-purple-500/80",
    icon: "CalendarRange",
    group: "monthly",
  },
  "monthly-games": {
    id: "monthly-games",
    label: "이달의 게임 정보",
    description: "이번 달 신작/할인/업데이트 소식을 검색해 게임 큐레이션으로 정리합니다.",
    webSearch: true,
    accent: "from-sky-500/80 to-indigo-500/80",
    icon: "Trophy",
    group: "monthly",
  },
};

export const CATEGORY_LIST: CategoryMeta[] = Object.values(CATEGORIES);

export function isValidCategory(id: string): id is CategoryId {
  return id in CATEGORIES;
}

export function getCategory(id: CategoryId): CategoryMeta {
  return CATEGORIES[id];
}
