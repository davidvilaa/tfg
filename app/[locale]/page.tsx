import Feed from "@/components/windows/feed";
import PlayingNow from "@/components/windows/playingNow";
import TrendingGames from "@/components/windows/trendingGames";
import TrendingGuides from "@/components/windows/trendingGuides";

import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('Home');

  return (
    <>
      <style>{`
        body {
          overflow: hidden !important;
          height: 100vh;
        }
      `}</style>
      
      <main className="h-screen bg-[url('https://wallpapers.com/images/hd/artistic-blue-windows-7-cover-v0qwgn3ypat2bloy.jpg')] bg-cover bg-center bg-fixed relative">
        
        <h1 className="sr-only">{t('title')} - {t('subtitle')}</h1>
        
        <Feed/>
        <TrendingGuides/>
        <TrendingGames/>
        <PlayingNow/>
      </main>
    </>
  );
}