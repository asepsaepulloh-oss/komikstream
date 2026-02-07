"use client";

import { cn } from "@/lib/utils";
import {
  Book,
  Bookmark,
  Film,
  History,
  Home,
  LogIn,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

const navigation = [
  { name: "Beranda", href: "/", icon: Home },
  { name: "Komik", href: "/komik", icon: Book },
  { name: "Anime", href: "/anime", icon: Film },
  { name: "Bookmark", href: "/bookmark", icon: Bookmark },
  { name: "History", href: "/history", icon: History },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  clerkEnabled?: boolean;
}

export function Sidebar({ isOpen, onClose, clerkEnabled = false }: SidebarProps) {
  const pathname = usePathname();

  // Close sidebar when pathname changes
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border",
          "transform transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2" onClick={onClose}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Book className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-primary">Komik</span>
              <span>Stream</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4">
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Login button for mobile when Clerk is not configured */}
        {!clerkEnabled && (
          <div className="px-4 py-2">
            <Link href="/sign-in">
              <Button variant="outline" className="w-full gap-2">
                <LogIn className="h-4 w-4" />
                Masuk
              </Button>
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
          <p className="text-xs text-muted-foreground text-center">
            © 2025 KomikStream
          </p>
        </div>
      </aside>
    </>
  );
}
