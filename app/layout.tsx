import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "INITIAL / D — Touge Archive",
  description: "An experimental editorial journey through Japanese mountain racing after dark.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js" strategy="afterInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js" strategy="afterInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/lenis@1.3.11/dist/lenis.min.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
