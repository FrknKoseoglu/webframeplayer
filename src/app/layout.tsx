import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Frame | The Ultimate Web Media Player",
  description: "Experience your content in its purest form. Frame is a high-performance, cloud-synced web player for your m3u playlists and Xtream Codes. No clutter, just focus.",
  keywords: "frame player, web frame, minimalist Frame Player, cloud media player, iptv web player, online tv player, m3u player, xtream codes login, hls player",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Frame | The Ultimate Web Media Player",
    description: "Experience your content in its purest form. A high-performance, cloud-synced web player for your media.",
    type: "website",
    siteName: "Frame Player",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frame | The Ultimate Web Media Player",
    description: "Experience your content in its purest form. No clutter, just focus.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className={`${plusJakartaSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
