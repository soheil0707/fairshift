import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FairShift • UN SDG 8 Decent Work & Labor Rights Platform",
  description:
    "Production-quality mobile-first PWA for UN SDG 8: Automated 2x Overtime under Indian Labour Law, Voice Safety Reporting, Transparent Payslips & Skill Passports.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FairShift",
  },
  applicationName: "FairShift",
  keywords: [
    "UN SDG 8",
    "Decent Work",
    "Fair Wages",
    "Labor Rights India",
    "Overtime 2x Pay",
    "Safety Voice",
    "Skill Passport",
  ],
};

export const viewport: Viewport = {
  themeColor: "#a21942",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#a21942" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-100 text-slate-900">
        {children}
      </body>
    </html>
  );
}
