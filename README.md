# 블로그 글 자동 생성기

영화·드라마·게임 6개 카테고리의 한국어 블로그 글을 Anthropic Claude로 자동 생성하는 사이트입니다.

## 진행 상황 (3단계 완료 — 전체 카테고리 구현 완료)

### 구현 완료
- **Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui** 셋업
- **6개 카테고리** 메타데이터 (`lib/categories.ts`) — 단일 진실 공급원
- **메인 페이지** (`/`) — 6개 카테고리 카드, "리뷰 작성" / "이달의 정보" 그룹 분리, 웹 검색 뱃지 표시
- **카테고리별 페이지** (`/generate/[category]`) — 좌(폼) / 우(스트리밍 결과) 2단 레이아웃
- **`/api/generate` POST 스트리밍 엔드포인트**
  - Anthropic SDK 사용, `claude-sonnet-4-6` 모델
  - NDJSON 스트림 (`text` / `tool_use` / `citation` / `done` / `error`)
  - `meta.webSearch === true` 카테고리는 `web_search_20260209` tool 자동 추가
  - 한국 KR / Asia/Seoul 위치 컨텍스트 적용
- **프롬프트 빌더** (`lib/prompts/`) — 6개 카테고리 모두 완성
  - `common.ts` — 공통 작성 규칙 (AI 티 안 나기, 형식, 톤앤매너)
  - `movieReview.ts` / `dramaReview.ts` / `gameReview.ts`
  - `monthlyMovies.ts` / `monthlyDramas.ts` / `monthlyGames.ts` — 웹 검색 가이드 포함
- **6개 입력 폼** 모두 구현
- **결과 패널** — 스트리밍 마크다운, 복사(MD/TXT), 재생성, "참고 자료" 자동 정리, 상태 표시(준비/검색 중/생성 중/완료/오류)

## 카테고리

| ID | 라벨 | 웹 검색 | 주요 입력 |
|---|---|---|---|
| `movie-review` | 영화 리뷰 | ❌ | 제목, 감독, 주연, 한줄평, 좋았던/아쉬웠던 점, 별점, 스포일러, 추천 대상 |
| `drama-review` | 드라마 리뷰 | ❌ | 제목, 플랫폼(6종), 시즌/회차, 한줄평, 좋았던/아쉬웠던 점, 별점, 스포일러 |
| `game-review` | 게임 리뷰 | ❌ | 제목, 플랫폼(7종), 장르, 플레이 시간, 한줄평, 좋았던/아쉬웠던 점, 별점, 추천 대상, 가성비 |
| `monthly-movies` | 이달의 영화 정보 | ✅ | 대상 월, 지역(한국/해외), 추가 키워드, 특히 다룰 작품 |
| `monthly-dramas` | 이달의 드라마 정보 | ✅ | 대상 월, 관심 플랫폼(다중), 추가 키워드, 특히 다룰 작품 |
| `monthly-games` | 이달의 게임 정보 | ✅ | 대상 월, 관심 플랫폼(다중), 다룰 내용(신작/할인/업데이트/인디), 추가 키워드 |

## URL/엔드포인트

| 경로 | 메서드 | 설명 |
|---|---|---|
| `/` | GET | 메인 페이지 (카테고리 카드) |
| `/generate/[category]` | GET | 카테고리별 폼 + 결과 페이지 (6개 정적 경로 prerender) |
| `/api/generate` | POST | 스트리밍 생성 API. body: `{ category, inputs }` |

### `/api/generate` 응답 형식
NDJSON (한 줄당 하나의 JSON 객체):
```
{"type":"text","delta":"..."}
{"type":"tool_use","name":"web_search","status":"start"}
{"type":"tool_use","name":"web_search","status":"end"}
{"type":"citation","citation":{"url":"...","title":"..."}}
{"type":"done"}
{"type":"error","message":"..."}
```

## 실행 방법

```bash
# 1. 의존성 설치 (이미 설치됨)
npm install

# 2. .env.local 생성
cp .env.local.example .env.local
# .env.local 의 ANTHROPIC_API_KEY 값을 실제 키로 채우기

# 3. 개발 서버
npm run dev
# 또는 PM2
pm2 start ecosystem.config.cjs

# 4. http://localhost:3000 접속
```

## 폴더 구조

```
app/
  layout.tsx, globals.css           # 루트 레이아웃 + Tailwind 전역
  page.tsx                          # 메인 (6개 카테고리 카드)
  generate/[category]/
    page.tsx                        # 서버 컴포넌트 (카테고리 검증, 메타데이터)
    _components/
      GeneratePageClient.tsx        # 좌/우 레이아웃, NDJSON 스트림 파싱, 디스패쳐
      ResultPanel.tsx               # 결과 + 상태 + 복사/재생성
      CopyButtons.tsx               # 마크다운/텍스트 복사
      CitationsList.tsx             # 참고 자료 섹션
      forms/
        MovieReviewForm.tsx
        DramaReviewForm.tsx
        GameReviewForm.tsx
        MonthlyMoviesForm.tsx
        MonthlyDramasForm.tsx
        MonthlyGamesForm.tsx
        PlaceholderForm.tsx         # (현재 미사용, 향후 새 카테고리 시 유용)
        types.ts                    # FormProps 공통 인터페이스
  api/generate/route.ts             # Anthropic 스트리밍 API (NDJSON)
lib/
  categories.ts                     # 6 카테고리 메타 (단일 소스)
  types.ts                          # CategoryId, StreamEvent, Citation 등
  utils.ts                          # cn()
  markdown.ts                       # 마크다운 → plain text (텍스트 복사용)
  prompts/
    index.ts                        # 카테고리 → 빌더 매핑 (디스패처)
    common.ts                       # 공통 작성 규칙 + 유틸 (bulletize, formatStars 등)
    movieReview.ts
    dramaReview.ts                  # DRAMA_PLATFORM_OPTIONS export
    gameReview.ts                   # GAME_REVIEW_PLATFORM_OPTIONS, VALUE_FOR_MONEY_OPTIONS export
    monthlyMovies.ts                # MOVIE_REGION_OPTIONS export
    monthlyDramas.ts                # MONTHLY_DRAMA_PLATFORM_OPTIONS (dramaReview 재사용)
    monthlyGames.ts                 # GAME_PLATFORM_OPTIONS, GAME_TOPIC_OPTIONS export
components/ui/                      # shadcn/ui (button, card, input, label, textarea,
                                    #            select, checkbox, radio-group)
```

## 환경변수

| 변수 | 설명 |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API 키 (서버 사이드 전용 — 클라이언트 번들에 노출되지 않음) |

## 데이터 흐름

```
[Client Form (카테고리별)]
  ↓ POST /api/generate { category, inputs }
[Route Handler]
  ↓ isValidCategory(category)  ← 검증
  ↓ getPromptBuilder(category)(inputs) → { system, user }
  ↓ meta.webSearch ? tools.push(WEB_SEARCH_TOOL) : skip
[Anthropic Claude API (streaming)]
  ↓ RawMessageStreamEvent → NDJSON 변환
     - content_block_start (server_tool_use / web_search_tool_result)
     - content_block_delta (text_delta / citations_delta)
[Client] NDJSON 라인 단위 파싱
  → text: markdown append
  → tool_use start/end: searchActive 카운터 → "정보 검색 중..." 표시
  → citation: "참고 자료" 섹션에 누적 (URL 중복 제거)
  → done/error: 상태 전환
```

## 프롬프트 다듬기

각 프롬프트 파일에 `// TODO: 여기 다듬을 것` 주석으로 향후 보강 포인트를 표시해두었습니다.
운영하면서 글 결과물에서 발견되는 패턴(특정 표현 반복, AI 티 등)을 `lib/prompts/common.ts`의 `COMMON_WRITING_RULES` 또는 각 카테고리 빌더의 system 프롬프트에 추가해주세요.

## 배포 메모

이 프로젝트는 Next.js Node.js 런타임의 스트리밍 API를 사용하므로 Vercel/Node 환경에 배포하는 게 가장 자연스럽습니다. Cloudflare Pages 에 올리려면 Edge 런타임 호환 작업이 추가로 필요합니다.
