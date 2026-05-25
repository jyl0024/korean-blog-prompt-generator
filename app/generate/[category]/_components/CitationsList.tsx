"use client";

import { ExternalLink } from "lucide-react";
import type { Citation } from "@/lib/types";

interface Props {
  citations: Citation[];
}

export function CitationsList({ citations }: Props) {
  if (!citations || citations.length === 0) return null;

  return (
    <section className="mt-8 pt-6 border-t">
      <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
        <ExternalLink className="h-4 w-4" />
        참고 자료
      </h2>
      <ol className="space-y-1.5 text-sm">
        {citations.map((c, i) => (
          <li key={`${c.url}-${i}`} className="flex gap-2 leading-6">
            <span className="text-muted-foreground tabular-nums">[{i + 1}]</span>
            <a
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {c.title || c.url}
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
