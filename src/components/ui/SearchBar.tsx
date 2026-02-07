"use client";

import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  searchPath?: string;
  className?: string;
}

export function SearchBar({
  placeholder = "Cari komik atau anime...",
  defaultValue = "",
  searchPath,
  className,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(
    defaultValue || searchParams.get("q") || ""
  );

  const handleSearch = useCallback(() => {
    if (!value.trim()) return;

    startTransition(() => {
      if (searchPath) {
        router.push(`${searchPath}?q=${encodeURIComponent(value.trim())}`);
      } else {
        // Default: detect type based on current path or go to komik search
        router.push(`/komik/search?q=${encodeURIComponent(value.trim())}`);
      }
    });
  }, [value, searchPath, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClear = () => {
    setValue("");
  };

  return (
    <div
      className={cn(
        "relative flex items-center w-full max-w-xl",
        className
      )}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "h-11 w-full rounded-lg border border-input bg-background pl-10 pr-10",
            "text-sm placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "transition-all duration-200"
          )}
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <button
        onClick={handleSearch}
        disabled={isPending || !value.trim()}
        className={cn(
          "ml-2 h-11 px-4 rounded-lg",
          "bg-primary text-primary-foreground font-medium",
          "hover:bg-primary/90 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center gap-2"
        )}
      >
        {isPending ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
        ) : (
          "Cari"
        )}
      </button>
    </div>
  );
}
