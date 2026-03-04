-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "thumbnail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "History" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "thumbnail" TEXT,
    "progress" TEXT NOT NULL,
    "progressTitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anime" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "urlId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "alternativeTitle" TEXT,
    "cover" TEXT NOT NULL,
    "synopsis" TEXT,
    "status" TEXT,
    "type" TEXT,
    "totalEpisodes" INTEGER,
    "rating" DOUBLE PRECISION,
    "genres" JSONB,
    "episodes" JSONB,
    "lastEpisode" TEXT,
    "lastUpdate" TEXT,
    "sourceUrl" TEXT,
    "lastScraped" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Anime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Komik" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "mangaId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "alternativeTitle" TEXT,
    "coverImage" TEXT NOT NULL,
    "coverPortrait" TEXT,
    "synopsis" TEXT,
    "status" INTEGER,
    "type" TEXT,
    "releaseYear" TEXT,
    "country" TEXT,
    "rating" DOUBLE PRECISION,
    "viewCount" BIGINT,
    "bookmarkCount" INTEGER,
    "genres" JSONB,
    "authors" JSONB,
    "artists" JSONB,
    "latestChapterId" TEXT,
    "latestChapterNumber" DOUBLE PRECISION,
    "latestChapterDate" TIMESTAMP(3),
    "chapters" JSONB,
    "sourceUrl" TEXT,
    "lastScraped" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Komik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "itemsCount" INTEGER NOT NULL DEFAULT 0,
    "errorMsg" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,

    CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_type_itemId_key" ON "Bookmark"("userId", "type", "itemId");

-- CreateIndex
CREATE INDEX "History_userId_idx" ON "History"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "History_userId_type_itemId_key" ON "History"("userId", "type", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Anime_urlId_key" ON "Anime"("urlId");

-- CreateIndex
CREATE INDEX "Anime_urlId_idx" ON "Anime"("urlId");

-- CreateIndex
CREATE INDEX "Anime_title_idx" ON "Anime"("title");

-- CreateIndex
CREATE INDEX "Anime_createdAt_idx" ON "Anime"("createdAt");

-- CreateIndex
CREATE INDEX "Anime_lastScraped_idx" ON "Anime"("lastScraped");

-- CreateIndex
CREATE UNIQUE INDEX "Komik_mangaId_key" ON "Komik"("mangaId");

-- CreateIndex
CREATE INDEX "Komik_mangaId_idx" ON "Komik"("mangaId");

-- CreateIndex
CREATE INDEX "Komik_title_idx" ON "Komik"("title");

-- CreateIndex
CREATE INDEX "Komik_type_idx" ON "Komik"("type");

-- CreateIndex
CREATE INDEX "Komik_createdAt_idx" ON "Komik"("createdAt");

-- CreateIndex
CREATE INDEX "Komik_lastScraped_idx" ON "Komik"("lastScraped");

-- CreateIndex
CREATE INDEX "SyncLog_type_idx" ON "SyncLog"("type");

-- CreateIndex
CREATE INDEX "SyncLog_startedAt_idx" ON "SyncLog"("startedAt");

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
