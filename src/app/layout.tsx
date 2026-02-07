import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider, QueryProvider, AuthProvider } from "@/components/providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { isClerkConfigured } from "@/lib/auth-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "KomikStream - Baca Komik & Nonton Anime Gratis",
    template: "%s | KomikStream",
  },
  description:
    "Baca komik manhwa, manhua, manga dan nonton anime subtitle Indonesia secara gratis. Update terbaru setiap hari.",
  keywords: [
    "komik",
    "manga",
    "manhwa",
    "manhua",
    "anime",
    "streaming",
    "baca komik",
    "nonton anime",
    "subtitle indonesia",
  ],
  authors: [{ name: "KomikStream" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "KomikStream",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check if Clerk is configured at build/runtime
  const clerkEnabled = isClerkConfigured();

  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider clerkEnabled={clerkEnabled}>
          <ThemeProvider>
            <QueryProvider>
              <Navbar clerkEnabled={clerkEnabled} />
              <main className="flex-1">{children}</main>
              <Footer />
            </QueryProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
