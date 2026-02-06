import type { Metadata, Viewport } from "next";
import "./globals.css";

const title = "Júlio César Guedes | Senior Frontend Engineer";
const description =
  "Senior Frontend Engineer focused on scalable, high-performance web applications. React, TypeScript, AI-assisted development.";

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL("https://juliocesarguedes.dev"),
  openGraph: {
    title,
    description,
    url: "https://juliocesarguedes.dev",
    siteName: "Júlio César Guedes",
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
  themeColor: "#f0f0ef",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
