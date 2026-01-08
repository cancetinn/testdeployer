import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://cantest.dev'),
  title: {
    default: "CANTEST - Discord Bot Deployment Platform",
    template: "%s | CANTEST"
  },
  description: "The ultimate managed infrastructure for Discord bots. Deploy, manage, and scale your bots with zero configuration and 99.9% uptime.",
  keywords: ["discord bot", "bot hosting", "discord bot deployment", "bot management", "discord infrastructure"],
  authors: [{ name: "CANTEST Inc." }],
  creator: "CANTEST",
  publisher: "CANTEST Inc.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cantest.dev",
    siteName: "CANTEST",
    title: "CANTEST - Discord Bot Deployment Platform",
    description: "Deploy Discord bots beyond limits. Zero configuration, instant deployments, 99.9% uptime.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CANTEST - Discord Bot Deployment Platform"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "CANTEST - Discord Bot Deployment Platform",
    description: "Deploy Discord bots beyond limits. Zero configuration, instant deployments, 99.9% uptime.",
    images: ["/og-image.png"],
    creator: "@cantest"
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png"
  },
  manifest: "/site.webmanifest"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="canonical" href="https://cantest.dev" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
