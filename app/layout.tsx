import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const title = `${site.name} | ${site.role}`;
const description =
  "Senior Full Stack Engineer: frontend architecture, system design, and AI (React, TypeScript, Node.js, PostgreSQL). Portfolio: live enterprise work and projects in progress—Blueticket, Potássio do Brasil, Terço App, Resumin.site.";

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(site.url),
  openGraph: {
    title,
    description,
    url: site.url,
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
  themeColor: "#08132a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
