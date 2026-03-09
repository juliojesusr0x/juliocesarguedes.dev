import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Julio Cesar Guedes | Senior Frontend Engineer";
const description =
  "Senior Software Engineer specializing in frontend and full stack development. React, Next.js, TypeScript, Node.js, AWS. High traffic platforms, data dashboards, clean architecture.";

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL("https://juliocesarguedes.dev"),
  openGraph: {
    title,
    description,
    url: "https://juliocesarguedes.dev",
    siteName: "Julio Cesar Guedes",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fafaf9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
