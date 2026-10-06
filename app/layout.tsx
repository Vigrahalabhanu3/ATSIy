import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeInitializer from "@/components/theme/ThemeInitializer";
import DesktopOnlyGuard from "@/components/layout/DesktopOnlyGuard";

const siteUrl = process.env.APP_URL || "https://atsly.app";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0D1B" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ATSly – AI-Powered ATS Resume Intelligence Platform",
    template: "%s | ATSly",
  },
  description:
    "Enterprise-grade ATS resume analyzer. Test your resume against any job description and receive verified ATS match scores, missing keyword diagnostics, formatting checks, and actionable AI recommendations.",
  keywords: [
    "ATS resume checker",
    "Applicant Tracking System analyzer",
    "AI resume score",
    "resume keyword optimization",
    "ATS formatting test",
    "job description match",
    "career intelligence",
    "ATS resume scanner",
  ],
  authors: [{ name: "ATSly Intelligence Team", url: siteUrl }],
  creator: "ATSly",
  publisher: "ATSly",
  applicationName: "ATSly",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "ATSly – AI-Powered ATS Resume Intelligence Platform",
    description:
      "Enterprise-grade ATS resume analyzer. Receive verified ATS match scores, missing keyword diagnostics, and actionable AI improvements.",
    siteName: "ATSly",
  },
  twitter: {
    card: "summary_large_image",
    title: "ATSly – AI-Powered ATS Resume Intelligence Platform",
    description:
      "Enterprise-grade ATS resume analyzer. Receive verified ATS match scores, missing keyword diagnostics, and actionable AI improvements.",
    creator: "@atsly_app",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('atsly_theme')||'light';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.classList.remove('dark');document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased transition-colors duration-200 bg-[#F8F9FE] dark:bg-[#0B0D1B] text-[#111827] dark:text-[#F1F5F9] min-h-screen">
        <ThemeInitializer />
        <DesktopOnlyGuard>
          {children}
        </DesktopOnlyGuard>
      </body>
    </html>
  );
}
