import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { CATEGORIES, isValidCategory } from "@/lib/categories";
import { GeneratePageClient } from "./_components/GeneratePageClient";

interface PageProps {
  params: { category: string };
}

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((category) => ({ category }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  if (!isValidCategory(params.category)) {
    return { title: "찾을 수 없음" };
  }
  const c = CATEGORIES[params.category];
  return {
    title: `${c.label} | 블로그 글 자동 생성기`,
    description: c.description,
  };
}

export default function Page({ params }: PageProps) {
  if (!isValidCategory(params.category)) {
    notFound();
  }
  const category = CATEGORIES[params.category];
  return <GeneratePageClient category={category} />;
}
