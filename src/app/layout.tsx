import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/public-sans";
import "./globals.css";
import { Providers } from "@/lib/query/providers";

export const metadata: Metadata = {
  title: { default: "InterviewCall entrance test", template: "%s · InterviewCall" },
  description: "Take your InterviewCall entrance test.",
  robots: { index: false, follow: false },
  icons: { icon: "/images/ic-logo.png", apple: "/images/ic-logo.png" },
};

export const viewport: Viewport = { themeColor: "#15145e" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
