# 블로그 글 자동 생성기

영화·드라마·게임 6개 카테고리의 한국어 블로그 글을 Anthropic Claude로 자동 생성하는 사이트입니다.

- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **AI**: Anthropic Claude (`claude-sonnet-4-6`) + `web_search_20260209` tool
- **배포**: Vercel (서울 리전 `icn1`)

---

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

`/api/generate` 응답은 NDJSON (한 줄당 하나의 JSON):
```
{"type":"text","delta":"..."}
{"type":"tool_use","name":"web_search","status":"start"}
{"type":"tool_use","name":"web_search","status":"end"}
{"type":"citation","citation":{"url":"...","title":"..."}}
{"type":"done"}
{"type":"error","message":"..."}
```

---

## 로컬 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.local.example .env.local
# .env.local 의 ANTHROPIC_API_KEY 값을 실제 키로 채우기

# 개발 서버
npm run dev
# → http://localhost:3000
```

샌드박스(0.0.0.0 바인딩 필요한 환경)에서는 PM2로:
```bash
pm2 start ecosystem.config.cjs
# (내부적으로 npm run dev:sandbox 실행)
```

---

## 🚀 Vercel 배포 가이드

### Step 1. GitHub 리포지토리 준비

```bash
# 현재 디렉토리에서
cd /path/to/webapp

# 깃 상태 확인 (이미 git init 되어있음)
git status

# GitHub에 새 리포 만들기 (예: my-blog-generator)
# https://github.com/new 에서 생성 (Private 권장)

# 리모트 추가 + 푸시
git remote add origin https://github.com/<YOUR_USERNAME>/<REPO_NAME>.git
git branch -M main
git push -u origin main
```

> **확인**: `.env.local` 은 `.gitignore` 에 잡혀있어 푸시되지 않습니다. 푸시 전 `git status` 로 한 번 더 확인하세요.

---

### Step 2. Vercel 프로젝트 생성

1. https://vercel.com/new 접속 (계정 없으면 GitHub로 가입)
2. **Import Git Repository** 섹션에서 방금 푸시한 리포 선택 → **Import** 클릭
   - GitHub 권한이 안 보이면 "Adjust GitHub App Permissions" 로 권한 부여
3. **Configure Project** 화면:
   - **Framework Preset**: `Next.js` 가 자동 감지됨 (그대로 두기)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `next build` (기본값, 그대로)
   - **Output Directory**: 비워두기 (Next.js 자동)
   - **Install Command**: `npm install` (기본값)

---

### Step 3. 환경변수 등록 (배포 전에)

배포 버튼 누르기 **전에** 같은 화면 하단의 **Environment Variables** 섹션에서:

| Name | Value | Environments |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-…` (실제 키) | **Production** / **Preview** / **Development** 모두 체크 |

- "Add" 클릭해서 추가
- 키는 한 번 저장하면 다시 볼 수 없습니다 (별도 메모 권장)

---

### Step 4. 배포

1. **Deploy** 버튼 클릭
2. 2~3분 후 빌드 완료 → 자동으로 도메인 발급
   - 예: `https://<프로젝트명>.vercel.app`
3. 사이트 접속해서 동작 확인:
   - `/` 메인 카드 6개 표시되는지
   - `/generate/movie-review` 에서 폼 입력 → 생성 버튼 → 실제 글이 스트리밍되는지
   - `/generate/monthly-games` 에서 "정보 검색 중..." 표시 + 참고 자료 섹션 채워지는지

---

### Step 5. (선택) 환경변수 나중에 변경하기

배포 후 키를 추가/변경하려면:
1. https://vercel.com/dashboard → 프로젝트 선택
2. 상단 탭 **Settings** → 왼쪽 메뉴 **Environment Variables**
3. 값 추가/수정/삭제 후 저장
4. **중요**: 환경변수 변경은 **재배포 후에 반영**됩니다.
   - 상단 탭 **Deployments** → 최신 배포 옆 `…` → **Redeploy** 클릭

---

### Step 6. (선택) 커스텀 도메인 연결

1. **Settings** → **Domains**
2. 보유 도메인 입력 → Vercel이 제시하는 DNS 레코드(A 레코드 또는 CNAME)를 도메인 등록처에 추가
3. 자동으로 HTTPS 인증서 발급

---

## 🔄 이후 코드 변경 → 자동 배포

- `main` 브랜치에 `git push` → **Production 배포 자동**
- 다른 브랜치 push 또는 PR → **Preview 배포 자동** (PR 코멘트에 미리보기 URL 자동 게시)

```bash
# 예시
git add .
git commit -m "feat: 새 카테고리 추가"
git push origin main
# → Vercel 대시보드에서 자동 배포 진행됨
```

---

## ⚠️ Vercel 무료 플랜 주의사항

- **Serverless Function 실행 시간**: 최대 60초 (Hobby) / 300초 (Pro)
  - `/api/generate` 의 `maxDuration = 60` 으로 설정해두었습니다
  - 웹 검색 카테고리가 60초를 넘으면 응답이 잘릴 수 있음 → 그럴 경우 Pro로 업그레이드 후 `maxDuration` 을 늘리세요
- **월간 사용량**:
  - Hobby: 함수 호출 100GB-hours/월, 대역폭 100GB/월
  - 개인 블로그 용도로는 충분
- **상업적 이용**: Hobby 플랜은 비상업적 용도만 허용. 상업적이면 Pro 필요

---

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
        PlaceholderForm.tsx         # (미사용, 향후 새 카테고리 시 유용)
        types.ts                    # FormProps 공통 인터페이스
  api/generate/route.ts             # Anthropic 스트리밍 API (NDJSON)
                                    # runtime=nodejs, maxDuration=60
lib/
  categories.ts                     # 6 카테고리 메타 (단일 소스)
  types.ts                          # CategoryId, StreamEvent, Citation 등
  utils.ts                          # cn()
  markdown.ts                       # 마크다운 → plain text (텍스트 복사용)
  prompts/
    index.ts                        # 카테고리 → 빌더 매핑 (디스패처)
    common.ts                       # 공통 작성 규칙 + 유틸
    movieReview.ts, dramaReview.ts, gameReview.ts
    monthlyMovies.ts, monthlyDramas.ts, monthlyGames.ts
components/ui/                      # shadcn/ui 컴포넌트
vercel.json                         # Vercel 배포 설정 (서울 리전)
next.config.mjs                     # Next.js 설정
ecosystem.config.cjs                # PM2 (샌드박스 개발용)
```

---

## 환경변수

| 변수 | 필수 | 설명 |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | Anthropic API 키 (서버 사이드 전용 — 클라이언트 번들에 노출 안 됨) |

> 키 발급: https://console.anthropic.com/settings/keys

---

## 데이터 흐름

```
[Client Form (카테고리별)]
  ↓ POST /api/generate { category, inputs }
[Route Handler (Node.js runtime on Vercel)]
  ↓ isValidCategory(category)
  ↓ getPromptBuilder(category)(inputs) → { system, user }
  ↓ meta.webSearch ? tools.push(WEB_SEARCH_TOOL) : skip
[Anthropic Claude API (streaming)]
  ↓ RawMessageStreamEvent → NDJSON 변환
[Client] NDJSON 라인 단위 파싱
  → text:      markdown append
  → tool_use:  "정보 검색 중..." 표시
  → citation:  "참고 자료" 섹션에 누적
  → done/error: 상태 전환
```

---

## 프롬프트 다듬기

각 프롬프트 파일에 `// TODO: 여기 다듬을 것` 주석으로 향후 보강 포인트를 표시해두었습니다.
운영하면서 결과물에서 "AI 티" 패턴이 보이면:

- 모든 카테고리에 적용: `lib/prompts/common.ts` 의 `COMMON_WRITING_RULES`
- 특정 카테고리만 적용: `lib/prompts/<카테고리>.ts` 의 system 프롬프트
