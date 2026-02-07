import { getHomepageData } from "@/lib/api";
import { HomePageClient } from "@/components/home";

export default async function HomePage() {
  const { komikLatest, komikPopular, animeLatest, animeRecommended } =
    await getHomepageData();

  return (
    <HomePageClient
      komikLatest={komikLatest}
      komikPopular={komikPopular}
      animeLatest={animeLatest}
      animeRecommended={animeRecommended}
    />
  );
}
