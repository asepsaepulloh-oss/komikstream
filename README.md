# 📚 KomikStream

Website untuk membaca komik (manhwa, manhua, manga) dan streaming anime dengan subtitle Indonesia.

[![CI](https://github.com/KanekiCraynet/komikstream/actions/workflows/ci.yml/badge.svg)](https://github.com/KanekiCraynet/komikstream/actions/workflows/ci.yml)
[![Deploy Production](https://github.com/KanekiCraynet/komikstream/actions/workflows/deploy-production.yml/badge.svg)](https://github.com/KanekiCraynet/komikstream/actions/workflows/deploy-production.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)

## ✨ Fitur

- 📚 **Baca Komik** - Manhwa, Manhua, dan Manga dengan image viewer
- 🎬 **Streaming Anime** - Nonton anime dengan berbagai resolusi
- 🔍 **Pencarian** - Cari komik dan anime berdasarkan judul
- 🔖 **Bookmark** - Simpan favorit (localStorage, sync dengan DB jika login)
- 📜 **History** - Riwayat baca/tonton dengan progress tracking
- 🌙 **Dark/Light Mode** - Toggle tema sesuai preferensi
- 🔐 **Authentication** - Login via Email atau Google (Clerk) - **Optional!**
- 📱 **Responsive** - Mobile-first design
- ✨ **Animations** - Smooth transitions dengan Framer Motion
- 📄 **Pagination** - Navigasi halaman untuk list yang panjang

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Auth**: [Clerk](https://clerk.com/) *(optional)*
- **Database**: [Supabase PostgreSQL](https://supabase.com/) + [Prisma](https://prisma.io/) *(optional)*
- **API Source**: [Sansekai API](https://api.sansekai.my.id/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm atau yarn
- (Optional) Akun [Clerk](https://clerk.com/) untuk autentikasi
- (Optional) Akun [Supabase](https://supabase.com/) untuk database

### Quick Start (Tanpa Auth/Database)

1. **Clone repository**
   ```bash
   cd komikstream
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   ```
   http://localhost:3000
   ```

> 📝 **Note**: Aplikasi dapat berjalan tanpa konfigurasi Clerk atau Supabase. Bookmark dan history akan tersimpan di localStorage.

### Full Setup (Dengan Auth & Database)

1. **Clone repository**
   ```bash
   cd komikstream
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit file `.env` dan isi dengan:
   - `DATABASE_URL` - Connection string dari Supabase
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Publishable key dari Clerk
   - `CLERK_SECRET_KEY` - Secret key dari Clerk

4. **Setup Clerk**
   - Buat akun di [clerk.com](https://clerk.com)
   - Buat application baru
   - Enable Email dan Google OAuth di Clerk Dashboard
   - Copy API keys ke `.env`

5. **Setup Supabase**
   - Buat akun di [supabase.com](https://supabase.com)
   - Buat project baru
   - Copy connection string ke `.env`

6. **Generate Prisma client & push schema**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

7. **Run development server**
   ```bash
   npm run dev
   ```

8. **Open browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth routes (sign-in, sign-up)
│   ├── anime/              # Anime pages
│   ├── komik/              # Komik pages
│   ├── bookmark/           # Bookmark page
│   ├── history/            # History page
│   ├── api/                # API routes (bookmarks, history)
│   └── ...
├── components/
│   ├── layout/             # Navbar, Footer, Sidebar
│   ├── ui/                 # Reusable UI components
│   ├── providers/          # Context providers
│   └── home/               # Homepage components
├── lib/
│   ├── api.ts              # API client for Sansekai
│   ├── db.ts               # Prisma client
│   ├── auth-config.ts      # Clerk configuration checker
│   ├── animations.tsx      # Framer Motion utilities
│   └── utils.ts            # Utility functions
├── stores/
│   └── useAppStore.ts      # Zustand store
├── types/
│   └── index.ts            # TypeScript types
└── hooks/
    ├── useKomik.ts         # TanStack Query hooks for komik
    └── useAnime.ts         # TanStack Query hooks for anime
```

## 🔌 API Endpoints

### External (Sansekai API)

#### Komik
- `GET /komik/recommended?type={manhwa|manhua|manga}` - Rekomendasi komik
- `GET /komik/latest?type={project|mirror}` - Komik terbaru
- `GET /komik/search?query={query}` - Cari komik
- `GET /komik/popular?page={page}` - Komik populer
- `GET /komik/detail?manga_id={id}` - Detail komik
- `GET /komik/chapterlist?manga_id={id}` - Daftar chapter
- `GET /komik/getimage?chapter_id={id}` - Gambar chapter

#### Anime
- `GET /anime/latest` - Anime terbaru
- `GET /anime/recommended?page={page}` - Anime rekomendasi
- `GET /anime/search?query={query}` - Cari anime
- `GET /anime/detail?urlId={id}` - Detail anime
- `GET /anime/movie` - List movie anime
- `GET /anime/getvideo?chapterUrlId={id}&reso={resolution}` - Link streaming

### Internal (App API Routes)

#### Bookmarks
- `GET /api/bookmarks` - Get user bookmarks
- `POST /api/bookmarks` - Add bookmark
- `DELETE /api/bookmarks?type=&itemId=` - Remove bookmark

#### History
- `GET /api/history` - Get reading/watching history
- `POST /api/history` - Update progress
- `DELETE /api/history` - Remove history entry

## 📝 Environment Variables

```env
# Database (Optional)
DATABASE_URL="postgresql://..."

# Clerk (Optional)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# Clerk URLs (optional)
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# API (automatically set)
NEXT_PUBLIC_API_URL="https://api.sansekai.my.id/api"
```

## 🎨 Features Breakdown

### Animations
- Hero section fade-in animations
- Card hover lift effects
- Staggered grid animations
- Page transition effects
- Scroll-triggered animations

### TanStack Query Hooks
- `useKomikLatest()` - Fetch latest komik
- `useKomikPopular(page)` - Fetch popular komik with pagination
- `useKomikSearch(query)` - Search komik
- `useAnimeLatest()` - Fetch latest anime
- `useAnimeRecommended(page)` - Fetch recommended anime
- ... and more!

## 🚢 Deployment

### Vercel (Recommended)

1. Push code ke GitHub
2. Import project di [Vercel](https://vercel.com)
3. Add environment variables (if using auth/database)
4. Deploy!

### Manual

```bash
npm run build
npm start
```

## 📜 License

MIT License - feel free to use for personal projects.

## 🙏 Credits

- API by [Sansekai](https://api.sansekai.my.id/)
- Icons by [Lucide](https://lucide.dev/)
- Fonts by [Vercel](https://vercel.com/font)
