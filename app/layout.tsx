import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Serif, Permanent_Marker } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

const permanentMarker = Permanent_Marker({
  variable: "--font-marker",
  subsets: ["latin"],
  weight: "400",
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
  themeColor: "#0a0a0b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${bricolage.variable} ${instrumentSerif.variable} ${permanentMarker.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
