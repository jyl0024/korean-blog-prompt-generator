import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "블로그 글 자동 생성기",
  description:
    "영화·드라마·게임 리뷰부터 이달의 큐레이션까지, 블로그용 한국어 글을 자동으로 작성해드립니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
