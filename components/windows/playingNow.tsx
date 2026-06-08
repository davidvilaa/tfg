"use client";

import React, { useState, useEffect, useRef } from "react";
import Draggable from "react-draggable";
import { supabase } from "@/lib/supabase";
import { Gamepad2, Play, MoveLeft, MoveRight, House, FileEdit, User, Trophy, Pause, XCircle, Gift, Flame } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GameCaseCard from "@/components/cards/gameCard";
import { useNotification } from "@/components/NotificationProvider";
import { useTranslations } from "next-intl";

export default function PlayingNow() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<{ nickname: string, pfp_url: string } | null>(null);
  const [stats, setStats] = useState({ completed: 0, playing: 0, paused: 0, wishlist: 0, dropped: 0, guides: 0 });
  const [playingGames, setPlayingGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const windowRef = useRef(null);
  const mainRef = useRef<HTMLDivElement>(null!);
  const router = useRouter();
  const { showNotification } = useNotification();

  const t = useTranslations("Window - PlayingNow");

  const fetchMyGames = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setUser(user);
      
      const { data: profileData } = await supabase
        .from("profiles")
        .select("nickname, pfp_url")
        .eq("id", user.id)
        .single();
        
      if (profileData) {
        setUserProfile(profileData);
      }
      
      const { data, error } = await supabase
        .from("user_games")
        .select("*, games(id, title, cover_image_url, platforms)")
        .eq("user_id", user.id);

      const { count: guidesCount } = await supabase
        .from("guides")
        .select('*', { count: 'exact', head: true })
        .eq("user_id", user.id);

      if (!error && data) {
        let comp = 0, play = 0, paus = 0, wish = 0, drop = 0;
        const currentPlaying: any[] = [];

        data.forEach((g: any) => {
          if (g.status === "completed") comp++;
          else if (g.status === "playing") {
            play++;
            currentPlaying.push(g);
          }
          else if (g.status === "paused") paus++;
          else if (g.status === "wishlist") wish++;
          else if (g.status === "dropped") drop++;
        });

        setStats({ 
          completed: comp, 
          playing: play, 
          paused: paus, 
          wishlist: wish, 
          dropped: drop, 
          guides: guidesCount || 0 
        });
        
        setPlayingGames(currentPlaying.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMyGames();
  }, []);

  return (
    <div ref={mainRef}>
      <Draggable handle=".title-bar" nodeRef={windowRef} defaultPosition={{ x: 0, y: 0 }}>
        <div 
          ref={windowRef} 
          className="window glass active" 
          style={{ width: "450px", position: "absolute", right: "50px", top: "50px", zIndex: 10 }}
        >
          <div className="title-bar" style={{ cursor: "grab" }}>
            <div className="title-bar-text" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Gamepad2 size={14} color="#4ade80" /> 
              {t("title")}
            </div>
            <div className="title-bar-controls">
              <button aria-label="Minimize"></button>
              <button aria-label="Maximize"></button>
              <button aria-label="Close"></button>
            </div>
          </div>

          <div className="window-body has-space" style={{ margin: 0, padding: 0, backgroundColor: "#f3f4f6" }}>
            
            <div style={{ backgroundColor: "#fff", padding: "20px 20px 25px 20px" }}>
              
              {loading ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>{t("info_loading")}</div>
              ) : !user ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#666", fontSize: "13px" }}>
                  {t("info_error_login")}
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: "25px", lineHeight: "1.4" }}>
                    <div style={{ fontSize: "16px", color: "#111", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "5px" }}>
                      {t("label_welcome")}, 
                      <Link href={`/profile/${userProfile?.nickname || ""}`} style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: "bold", color: "#0055cc", textDecoration: "none", cursor: "pointer" }} className="hover:underline">
                        {userProfile?.pfp_url ? (
                          <img 
                            src={userProfile.pfp_url} 
                            alt="Avatar" 
                            style={{ 
                              width: "18px", 
                              height: "18px", 
                              borderRadius: "2px",
                              objectFit: "cover", 
                              border: "1px solid #999",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
                            }} 
                          />
                        ) : (
                          <div style={{ width: "18px", height: "18px", borderRadius: "2px", backgroundColor: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #999" }}>
                            <User size={12} color="#888" />
                          </div>
                        )}
                        {userProfile?.nickname || "Cazador"}
                      </Link>!
                    </div>
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
                      {t("label_welcome_desc")}
                    </div>
                  </div>

                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(3, 1fr)", 
                    gap: "20px 10px", 
                    textAlign: "center"
                  }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", fontSize: "10px", color: "#4a7c59", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold" }}>
                        <Trophy size={12} /> {t("log_options.completed")}
                      </div>
                      <div style={{ fontSize: "28px", color: "#111", marginTop: "2px", fontWeight: "300" }}>{stats.completed}</div>
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", fontSize: "10px", color: "#4a69bd", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold" }}>
                        <Play size={12} /> {t("log_options.playing")}
                      </div>
                      <div style={{ fontSize: "28px", color: "#111", marginTop: "2px", fontWeight: "300" }}>{stats.playing}</div>
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", fontSize: "10px", color: "#ff7b00", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold" }}>
                        <Flame size={12} /> {t("log_options.guides")}
                      </div>
                      <div style={{ fontSize: "28px", color: "#111", marginTop: "2px", fontWeight: "300" }}>{stats.guides}</div>
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", fontSize: "10px", color: "#7f8c8d", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold" }}>
                        <Pause size={12} /> {t("log_options.paused")}
                      </div>
                      <div style={{ fontSize: "28px", color: "#111", marginTop: "2px", fontWeight: "300" }}>{stats.paused}</div>
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", fontSize: "10px", color: "#8e7cc3", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold" }}>
                        <Gift size={12} /> {t("log_options.wishlist")}
                      </div>
                      <div style={{ fontSize: "28px", color: "#111", marginTop: "2px", fontWeight: "300" }}>{stats.wishlist}</div>
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", fontSize: "10px", color: "#a55c5c", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold" }}>
                        <XCircle size={12} /> {t("log_options.dropped")}
                      </div>
                      <div style={{ fontSize: "28px", color: "#111", marginTop: "2px", fontWeight: "300" }}>{stats.dropped}</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {user && (
              <div style={{ backgroundColor: "#f9fafb", borderTop: "1px solid #ddd" }}>
                
                <div style={{ padding: "15px 15px 0 15px" }}>
                  <h3 style={{ margin: 0, fontSize: "15px", color: "#111", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Play size={18} color="#4a69bd" strokeWidth={2.5} /> {t("label_playing_now")}
                  </h3>
                </div>
                
                <div style={{ padding: "0", minHeight: "150px" }}>
                  {playingGames.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#666", fontSize: "12px" }}>
                      {t("info_error_empty")}
                    </div>
                  ) : (
                    <div style={{ 
                      display: "flex", 
                      flexDirection: "row",
                      overflowX: "auto",
                      overflowY: "hidden",
                      gap: "20px",
                      padding: "15px 20px 25px 20px"
                    }}>
                      {playingGames.map((juego) => (
                        <div key={juego.game_id} style={{ flex: "0 0 140px" }}>
                          <GameCaseCard 
                            gameData={{
                              ...juego,
                              games: juego.games
                            }}
                            onClick={() => router.push(`/game/${juego.game_id}`)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      </Draggable>
    </div>
  );
}