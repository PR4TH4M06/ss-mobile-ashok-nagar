import type { Metadata, Viewport } from "next";
import "./globals.css";
import { shop } from "@/lib/shop";

export const metadata: Metadata = {
  title: `${shop.name} (${shop.area}) - Official Review & Store Portal`,
  description: `Share your experience at ${shop.name}, ${shop.area}, Nashik — Smartphones, Smart TVs, Speakers, Home Theater & Service.`,
  referrer: "strict-origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffe500",
};

const isProd = process.env.NODE_ENV === "production";

const cspContent = isProd
  ? "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; frame-src https://maps.google.com https://www.google.com; connect-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;"
  : "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: ws: wss: http: https:; frame-src https://maps.google.com https://www.google.com;";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta
          httpEquiv="Permissions-Policy"
          content="camera=(), microphone=(), geolocation=(), payment=(), usb=()"
        />
        <meta httpEquiv="Content-Security-Policy" content={cspContent} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Jost:wght@400;500;600;700&family=Syne:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
