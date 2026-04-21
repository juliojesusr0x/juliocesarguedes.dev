import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
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

const title = "Julio Cesar Guedes | Senior Frontend Engineer";
const description =
  "Senior Frontend Engineer (React, TypeScript, Next.js). Portfolio: live enterprise work and projects in progress—Blueticket, Potássio do Brasil, Audiofy, Terço App, Resumin.site.";

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
