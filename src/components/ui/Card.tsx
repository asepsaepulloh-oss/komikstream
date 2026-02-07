"use client";

import { cn, getImageUrl, truncate } from "@/lib/utils";
import type { Anime, Komik } from "@/types";
import { BookOpen, Play, Star, ImageOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

interface CardProps {
  item: Komik | Anime;
  type: "komik" | "anime";
  className?: string;
  index?: number; // For stagger animation
}

export function Card({ item, type, className, index = 0 }: CardProps) {
  const [imageError, setImageError] = useState(false);
  
  const isKomik = type === "komik";
  const komik = item as Komik;
  const anime = item as Anime;

  const id = isKomik ? komik.manga_id : anime.urlId;
  
  // Skip if no valid ID
  if (!id) return null;
  
  const title = item.title || "Untitled";
  const thumbnail =
    item.thumbnail || (item as Komik).cover || (item as Anime).poster || "";
  const rating = item.rating || (item as Anime).score;
  const itemType = isKomik ? komik.type : anime.type;

  const href = isKomik ? `/komik/${id}` : `/anime/${id}`;
  const imageUrl = imageError ? "https://placehold.co/300x450/1a1a2e/ffffff?text=No+Image" : getImageUrl(thumbnail);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: Math.min(index * 0.05, 0.5), // Cap delay at 0.5s
        ease: "easeOut" 
      }}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2 }
      }}
    >
      <Link
        href={href}
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-lg",
          "bg-card border border-border/50 transition-all duration-300",
          "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
          className
        )}
      >
        {/* Thumbnail */}
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <ImageOff className="h-8 w-8 text-muted-foreground" />
            </div>
          ) : (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              unoptimized
              onError={() => setImageError(true)}
            />
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play/Read icon on hover */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            whileHover={{ scale: 1.1 }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              {isKomik ? (
                <BookOpen className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 fill-current" />
              )}
            </div>
          </motion.div>

          {/* Type badge */}
          {itemType && (
            <div className="absolute left-2 top-2">
              <span className="rounded bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground capitalize">
                {itemType}
              </span>
            </div>
          )}

          {/* Rating badge */}
          {rating && (
            <div className="absolute right-2 top-2">
              <span className="flex items-center gap-1 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-yellow-400">
                <Star className="h-3 w-3 fill-yellow-400" />
                {rating}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-1 p-3">
          <h3 className="line-clamp-2 text-sm font-medium leading-tight group-hover:text-primary transition-colors">
            {truncate(title, 50)}
          </h3>
          {komik.latestChapter && (
            <p className="text-xs text-muted-foreground">
              Ch. {komik.latestChapter}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
