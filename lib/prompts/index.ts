import type { CategoryId, GenerateInputs } from "../types";

import { buildPrompt as buildMovieReview } from "./movieReview";
import { buildPrompt as buildDramaReview } from "./dramaReview";
import { buildPrompt as buildGameReview } from "./gameReview";
import { buildPrompt as buildMonthlyMovies } from "./monthlyMovies";
import { buildPrompt as buildMonthlyDramas } from "./monthlyDramas";
import { buildPrompt as buildMonthlyGames } from "./monthlyGames";

export type PromptBuilder = (inputs: GenerateInputs) => {
  system: string;
  user: string;
};

/**
 * 카테고리 ID → 프롬프트 빌더 함수 매핑.
 * API 라우트에서 이 디스패처를 통해 빌더를 호출합니다.
 */
export const PROMPT_BUILDERS: Record<CategoryId, PromptBuilder> = {
  "movie-review": buildMovieReview,
  "drama-review": buildDramaReview,
  "game-review": buildGameReview,
  "monthly-movies": buildMonthlyMovies,
  "monthly-dramas": buildMonthlyDramas,
  "monthly-games": buildMonthlyGames,
};

export function getPromptBuilder(category: CategoryId): PromptBuilder {
  return PROMPT_BUILDERS[category];
}
