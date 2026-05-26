# 한국어 블로그 글 프롬프트 생성기

영화/드라마/게임 리뷰 및 "이달의 정보" 6개 카테고리에 대해, **외부 AI 사이트(ChatGPT/Claude/Gemini 등)에 그대로 보낼 수 있는 잘 짜여진 프롬프트**를 만들어주는 도구입니다.

API 키 없이 동작합니다.

---

## 동작 방식 (중요)

이 사이트는 **AI 를 직접 호출하지 않습니다.** 대신 다음 3단계 흐름을 제공합니다:

1. **정보 입력** — 영화 제목·별점·감상 등 카테고리별 폼 작성
2. **프롬프트 자동 생성** — "프롬프트 생성하기" 클릭 → 화면에 완성된 프롬프트 표시
3. **외부 AI 에 붙여넣기** — 한 번 클릭으로 ChatGPT/Claude/Gemini/Perplexity 열기 (클립보드 자동 복사)
4. **응답 받아 저장** — AI 가 써준 글을 사이트에 붙여넣고 "내역에 저장" → 사용 내역에서 다시 확인 가능

이렇게 하면:
- ✅ API 키 / 결제 없이 무료 사용 (각 AI 사이트의 무료 플랜으로 충분)
- ✅ 원하는 AI 모델 자유 선택
- ✅ 프롬프트 / 입력값 / 결과가 브라우저에 저장되어 언제든 다시 조회

---

## 6개 카테고리

### 리뷰 작성 (이미 본/플레이한 작품)
- 영화 리뷰
- 드라마 리뷰
- 게임 리뷰

### 이달의 정보 (최신 정보 큐레이션 → 검색 가능한 AI 추천)
- 이달의 영화 정보
- 이달의 드라마 정보
- 이달의 게임 정보

> "이달의 *" 카테고리는 ChatGPT(Search 모드) 또는 Perplexity 같은 **웹 검색 가능한 AI** 에 보내야 정보가 정확합니다.

---

## 사용 내역 기능 (`/history`)

- 모든 생성 기록이 **브라우저 localStorage** 에 저장됨
- 항목별로 보관되는 것:
  - 카테고리 / 생성 일시 / 사용자 제목
  - 폼에 입력한 값 원본 (JSON)
  - 생성된 프롬프트 (system + user)
  - AI 가 답변한 글 본문 (저장 시)
- 기능:
  - **검색** — 제목 / 입력값 / 결과 본문 부분일치
  - **카테고리 필터**
  - **상세 모달** — 결과 미리보기/편집/MD·TXT 복사, 프롬프트 복사, 입력값 JSON 보기
  - **제목 편집**, **개별 삭제**, **전체 삭제**

> ⚠️ localStorage 기반이므로 **브라우저 시크릿모드 / 다른 브라우저 / 다른 기기 / 캐시 삭제** 시 내역이 보존되지 않습니다.

---

## 기술 스택

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + **shadcn/ui** (Radix UI)
- **react-markdown** + **remark-gfm** (마크다운 렌더링)
- **lucide-react** (아이콘)
- **localStorage** (사용 내역)

> 서버 API / 데이터베이스 / 외부 SDK 없음. 100% 정적 사이트로 배포 가능.

---

## 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 (Vercel 표준)
npm run dev
# → http://localhost:3000

# 샌드박스 환경 (0.0.0.0 바인딩)
npm run dev:sandbox

# 빌드 + 시작
npm run build
npm run start
```

---

## Vercel 배포

### 방법 1) Vercel CLI 직접 배포 (GitHub 불필요, 가장 간단)

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 로그인 (브라우저로 GitHub/Google/이메일 인증)
vercel login

# 3. 배포
cd /path/to/webapp
vercel --prod
```

- 첫 배포 시 프로젝트 이름 / 디렉터리 / 설정을 묻습니다 → 기본값 그대로 Enter
- 완료되면 `https://<프로젝트명>-<해시>.vercel.app` URL 발급
- **환경 변수 설정 불필요** (이 앱은 API 키를 사용하지 않음)

이후 코드를 수정한 뒤 다시 `vercel --prod` 한 번이면 재배포됩니다.

### 방법 2) GitHub + Vercel 자동 배포

장기 운영하면서 자동 배포를 원할 경우:

1. GitHub 에 빈 저장소 만들기
2. 로컬에서:
   ```bash
   git remote add origin https://github.com/<USER>/<REPO>.git
   git push -u origin main
   ```
3. https://vercel.com/new → GitHub 저장소 선택 → **Deploy**
4. 이후 `git push` 만 하면 자동 배포 (main → 프로덕션, PR → 프리뷰)

> 환경 변수: 이 앱은 어떠한 API 키도 사용하지 않으므로 Vercel 환경 변수 설정이 필요 없습니다.

---

## 폴더 구조

```
webapp/
├── app/
│   ├── layout.tsx                    # 루트 레이아웃 (한국어)
│   ├── page.tsx                      # 메인 — 6개 카테고리 카드
│   ├── globals.css                   # Tailwind + shadcn 변수 + .markdown-body
│   ├── generate/[category]/
│   │   ├── page.tsx                  # 서버 컴포넌트 (params 검증)
│   │   └── _components/
│   │       ├── GeneratePageClient.tsx     # 메인 클라이언트 (3단계 흐름)
│   │       ├── PromptPanel.tsx            # 생성된 프롬프트 + 외부 AI 링크
│   │       ├── ResultPastePanel.tsx       # AI 응답 붙여넣기 + 미리보기 + 저장
│   │       └── forms/                     # 카테고리별 폼 6종
│   └── history/
│       ├── page.tsx                  # /history (사용 내역)
│       └── _components/
│           ├── HistoryPageClient.tsx      # 목록 + 검색 + 필터 + 전체 삭제
│           └── HistoryDetailDialog.tsx    # 상세 모달 (결과/프롬프트/입력값 탭)
├── components/ui/                    # shadcn 컴포넌트 (button, input, ...)
├── lib/
│   ├── types.ts                      # CategoryId, HistoryEntry, BuiltPrompt
│   ├── categories.ts                 # 6개 카테고리 메타데이터
│   ├── prompts/                      # 카테고리별 프롬프트 빌더
│   │   ├── common.ts
│   │   ├── movieReview.ts
│   │   ├── dramaReview.ts
│   │   ├── gameReview.ts
│   │   ├── monthlyMovies.ts
│   │   ├── monthlyDramas.ts
│   │   ├── monthlyGames.ts
│   │   └── index.ts                  # PROMPT_BUILDERS 디스패처
│   ├── history.ts                    # localStorage 래퍼 (저장/조회/검색/삭제)
│   ├── aiLinks.ts                    # ChatGPT/Claude/Gemini 외부 링크 빌더
│   ├── markdown.ts                   # markdownToPlainText
│   └── utils.ts                      # cn()
├── vercel.json                       # 배포 설정 (서울 리전)
├── ecosystem.config.cjs              # PM2 (샌드박스 dev 용)
└── package.json
```

---

## 데이터 흐름

```
[ 폼 입력 ]
    │
    ▼
PROMPT_BUILDERS[category](inputs) ── 클라이언트에서 직접 호출
    │   ├ system 프롬프트
    │   └ user  프롬프트
    │
    ▼
[ PromptPanel ] ── 화면에 표시 + 복사 / 외부 AI 사이트로 보내기
    │
    │   (사용자가 외부 AI 에서 글을 받아옴)
    ▼
[ ResultPastePanel ] ── 응답 붙여넣기 → "내역에 저장"
    │
    ▼
localStorage ("kbg.history.v1") ── HistoryEntry[]
    │
    ▼
[ /history ] ── 목록 / 검색 / 필터 / 상세 모달
```

---

## URL 라우트

| 경로 | 설명 |
|---|---|
| `/` | 메인 — 6개 카테고리 카드 + 사용 내역 진입 링크 |
| `/generate/movie-review` | 영화 리뷰 — 폼 + 프롬프트 + 응답 붙여넣기 |
| `/generate/drama-review` | 드라마 리뷰 |
| `/generate/game-review` | 게임 리뷰 |
| `/generate/monthly-movies` | 이달의 영화 정보 (웹 검색 권장) |
| `/generate/monthly-dramas` | 이달의 드라마 정보 (웹 검색 권장) |
| `/generate/monthly-games` | 이달의 게임 정보 (웹 검색 권장) |
| `/history` | 사용 내역 — 검색 / 필터 / 상세 / 삭제 |

---

## 개발 노트

- API 라우트 / 서버 상태 없음 → 100% 정적 사이트 (`output: 'export'` 도 가능)
- 사용 내역은 사용자 브라우저에만 저장 → **프라이버시 친화적**, 서버 비용 0
- 외부 AI 사이트로의 자동 전송:
  - **ChatGPT / Perplexity** — `?q=` 파라미터로 프롬프트 자동 입력 (URL 8000자 이내일 때)
  - **Claude / Gemini** — 공식 자동 입력 미지원 → 사이트만 열고 클립보드에 복사
- 향후 확장 아이디어:
  - 사용 내역 JSON export / import
  - 카테고리별 통계 (몇 편 생성, 가장 많이 쓴 AI 등)
  - 다중 기기 동기화가 필요해질 경우 Vercel KV 로 전환
