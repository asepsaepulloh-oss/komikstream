"use client";

import { SearchBar } from "@/components/ui";
import { Book, Film } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="from-primary/5 via-background to-background relative overflow-hidden bg-gradient-to-b py-16 md:py-24">
      <div className="bg-grid-pattern absolute inset-0 opacity-5" />
      <div className="relative container mx-auto px-4">
        <motion.div
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.h1
            className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Baca Komik & Nonton Anime <span className="gradient-text">Favorit Kamu</span>
          </motion.h1>
          <motion.p
            className="text-muted-foreground mb-8 max-w-xl text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Koleksi terlengkap manhwa, manhua, manga, dan anime dengan subtitle Indonesia. Update
            setiap hari, gratis selamanya!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-lg"
          >
            <SearchBar className="w-full" />
          </motion.div>
          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link
              href="/komik"
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all hover:scale-105"
            >
              <Book className="h-4 w-4" />
              Jelajahi Komik
            </Link>
            <Link
              href="/anime"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all hover:scale-105"
            >
              <Film className="h-4 w-4" />
              Jelajahi Anime
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
