import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Geist_Mono, Geist_Mono as V0_Font_Geist_Mono } from "next/font/google";

// Initialize fonts
const _geistMono = V0_Font_Geist_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Developer Tool Dashboard",
  description:
    "A collection of essential developer tools including JSON formatter, Base64 encoder/decoder, regex tester, hash generator, color picker, timestamp converter, URL encoder/decoder, JWT decoder, and GUID generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
