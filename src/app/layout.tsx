import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Web IPTV Player | Watch Live TV, Movies & Series Online",
  description: "The best online IPTV Web Player. Support for M3U8, Xtream Codes, and HLS streaming. Watch your favorite Live TV channels and VOD on any browser. No download required.",
  keywords: "iptv web player, online tv player, m3u player, xtream codes login, hls player, web tv, smart tv interface",
  openGraph: {
    title: "Web IPTV Player | Watch Live TV, Movies & Series Online",
    description: "Stream Live TV, Movies, and Series directly in your browser. Compatible with Xtream Codes and M3U Playlists.",
    type: "website",
    siteName: "Web IPTV Player",
  },
  twitter: {
    card: "summary_large_image",
    title: "Web IPTV Player | Watch Live TV Online",
    description: "Stream Live TV, Movies, and Series in your browser. No download required.",
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
