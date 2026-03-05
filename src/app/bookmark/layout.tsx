import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Bookmark",
  description: `Koleksi komik dan anime favorit kamu di ${siteConfig.name}. Simpan dan akses kapan saja.`,
  alternates: {
    canonical: "/bookmark",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function BookmarkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
