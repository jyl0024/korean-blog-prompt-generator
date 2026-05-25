"use client";

interface Props {
  label: string;
}

export function PlaceholderForm({ label }: Props) {
  return (
    <div className="rounded-md border border-dashed bg-muted/30 p-6 text-center">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{label}</span> 폼은
        아직 구현되지 않았습니다.
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        다음 단계에서 추가될 예정입니다.
      </p>
    </div>
  );
}
