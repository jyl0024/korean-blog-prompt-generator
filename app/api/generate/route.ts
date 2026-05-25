import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

import { isValidCategory, getCategory } from "@/lib/categories";
import { getPromptBuilder } from "@/lib/prompts";
import type { Citation, GenerateRequestBody, StreamEvent } from "@/lib/types";

/**
 * Next.js Route Segment Config
 * - Node 런타임 (Edge 가 아닌 이유: SDK + 긴 스트리밍 호환성)
 * - 동적 처리, 캐시 안 함
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4096;

/**
 * web_search tool 정의 (스펙 그대로).
 * SDK 0.30 타입이 모르는 future tool이라 any 로 캐스팅해서 raw 로 넘김.
 */
const WEB_SEARCH_TOOL = {
  type: "web_search_20260209",
  name: "web_search",
  max_uses: 8,
  user_location: {
    type: "approximate",
    country: "KR",
    timezone: "Asia/Seoul",
  },
} as const;

/**
 * NDJSON 헬퍼: StreamEvent 를 한 줄 JSON + \n 으로 직렬화해서 인코딩
 */
function encodeEvent(event: StreamEvent, encoder: TextEncoder): Uint8Array {
  return encoder.encode(JSON.stringify(event) + "\n");
}

export async function POST(req: NextRequest) {
  let body: GenerateRequestBody;
  try {
    body = (await req.json()) as GenerateRequestBody;
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { category, inputs } = body || {};

  if (!category || !isValidCategory(category)) {
    return new Response(
      JSON.stringify({ error: `Unknown category: ${category}` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "ANTHROPIC_API_KEY 가 설정되지 않았습니다. .env.local 을 확인해주세요.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const meta = getCategory(category);
  const builder = getPromptBuilder(category);
  const { system, user } = builder(inputs ?? {});

  const client = new Anthropic({ apiKey });

  // ── 스트리밍 응답 구성 ─────────────────────────────────────
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: StreamEvent) => {
        controller.enqueue(encodeEvent(event, encoder));
      };

      try {
        const requestParams: Record<string, unknown> = {
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system,
          messages: [{ role: "user", content: user }],
        };

        if (meta.webSearch) {
          // web_search tool 추가 (SDK 가 모르는 미래 버전이라 any 로 캐스트)
          requestParams.tools = [WEB_SEARCH_TOOL] as unknown as never;
        }

        // Anthropic 스트림 시작
        // web_search tool 은 SDK 0.30 타입에 없어 unknown 경유로 캐스트
        const anthropicStream = client.messages.stream(
          requestParams as unknown as Parameters<
            typeof client.messages.stream
          >[0]
        );

        // citation 중복 방지용 set
        const seenCitations = new Set<string>();

        for await (const evt of anthropicStream) {
          // evt: RawMessageStreamEvent + 미래 확장 이벤트들
          // any 로 일단 받고 type별로 분기
          const e = evt as any;

          switch (e.type) {
            case "content_block_start": {
              const block = e.content_block;
              // 도구 사용 시작 (server_tool_use 또는 tool_use)
              if (
                block?.type === "server_tool_use" ||
                block?.type === "tool_use"
              ) {
                if (block.name === "web_search") {
                  send({
                    type: "tool_use",
                    name: "web_search",
                    status: "start",
                  });
                }
              }
              // web_search_tool_result 블록: citation 정보가 포함된 경우 처리
              if (block?.type === "web_search_tool_result") {
                send({
                  type: "tool_use",
                  name: "web_search",
                  status: "end",
                });
                const content = block.content;
                if (Array.isArray(content)) {
                  for (const item of content) {
                    if (item?.type === "web_search_result") {
                      const c: Citation = {
                        url: item.url,
                        title: item.title,
                      };
                      const key = c.url;
                      if (key && !seenCitations.has(key)) {
                        seenCitations.add(key);
                        send({ type: "citation", citation: c });
                      }
                    }
                  }
                }
              }
              break;
            }

            case "content_block_delta": {
              const delta = e.delta;
              // 일반 텍스트 델타
              if (delta?.type === "text_delta" && typeof delta.text === "string") {
                send({ type: "text", delta: delta.text });
              }
              // citations_delta: 본문에 인용이 붙는 경우
              if (delta?.type === "citations_delta") {
                const cit = delta.citation;
                if (cit) {
                  const c: Citation = {
                    url: cit.url,
                    title: cit.title,
                    cited_text: cit.cited_text,
                  };
                  const key = c.url;
                  if (key && !seenCitations.has(key)) {
                    seenCitations.add(key);
                    send({ type: "citation", citation: c });
                  }
                }
              }
              break;
            }

            case "content_block_stop":
            case "message_start":
            case "message_delta":
            case "message_stop":
            default:
              // 그 외 이벤트는 무시 (필요시 디버그용으로 확장)
              break;
          }
        }

        send({ type: "done" });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
        console.error("[/api/generate] error:", err);
        try {
          send({ type: "error", message });
        } catch {
          /* controller already closed */
        }
      } finally {
        try {
          controller.close();
        } catch {
          /* noop */
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
