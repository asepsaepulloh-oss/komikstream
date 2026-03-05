import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "History",
  description: `Riwayat baca komik dan nonton anime kamu di ${siteConfig.name}. Lanjutkan dari terakhir kamu baca atau tonton.`,
  alternates: {
    canonical: "/history",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
