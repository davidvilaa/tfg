"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import WelcomeLanding from "@/components/welcomeLanding";

import Feed from "@/components/windows/feed";
import PlayingNow from "@/components/windows/playingNow";
import TrendingGames from "@/components/windows/trendingGames";
import TrendingGuides from "@/components/windows/trendingGuides";

import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('Home');

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };
    
    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", marginTop: "100px" }}>...</div>;
  }

  if (!session) {
    return <WelcomeLanding />;
  }

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