import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Nonton Anime",
  description: `Nonton anime subtitle Indonesia gratis di ${siteConfig.name}. Streaming kualitas terbaik tanpa iklan berlebihan.`,
  robots: {
    index: false,
    follow: true,
  },
};

export default function AnimeWatchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
