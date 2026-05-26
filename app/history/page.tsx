import type { Metadata } from "next";
import { HistoryPageClient } from "./_components/HistoryPageClient";

export const metadata: Metadata = {
  title: "사용 내역 | 한국어 블로그 글 자동 생성",
  description: "그동안 생성한 프롬프트와 AI 응답을 다시 확인하세요.",
};

export default function HistoryPage() {
  return <HistoryPageClient />;
}
