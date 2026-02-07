import { Book, Github } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Book className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-primary">Komik</span>
                <span>Stream</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              Baca komik dan nonton anime favorit kamu secara gratis. Koleksi
              terlengkap dengan update terbaru setiap hari.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Navigasi</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/komik" className="hover:text-primary transition-colors">
                  Komik
                </Link>
              </li>
              <li>
                <Link href="/anime" className="hover:text-primary transition-colors">
                  Anime
                </Link>
              </li>
              <li>
                <Link href="/bookmark" className="hover:text-primary transition-colors">
                  Bookmark
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-primary transition-colors">
                  History
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Kategori Komik</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/komik?type=manhwa" className="hover:text-primary transition-colors">
                  Manhwa
                </Link>
              </li>
              <li>
                <Link href="/komik?type=manhua" className="hover:text-primary transition-colors">
                  Manhua
                </Link>
              </li>
              <li>
                <Link href="/komik?type=manga" className="hover:text-primary transition-colors">
                  Manga
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} KomikStream. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by{" "}
            <a
              href="https://xenzee.site"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              XenZee Team
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
