"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import GameCaseCard from "@/components/cards/gameCard";
import { useNotification } from "@/components/NotificationProvider";
import { useTranslations } from "next-intl";

export default function ProfileContentPage() {
  const router = useRouter();
  const params = useParams();
  const targetNickname = params.nickname as string;

  const [loading, setLoading] = useState(true);
  const [notaMedia, setNotaMedia] = useState(0);
  const [distribucionNotas, setDistribucionNotas] = useState<Record<number, number>>({
    0.5: 0, 1: 0, 1.5: 0, 2: 0, 2.5: 0, 3: 0, 3.5: 0, 4: 0, 4.5: 0, 5: 0
  });
  const [maxNotaCount, setMaxNotaCount] = useState(1);
  const [favoritos, setFavoritos] = useState<any[]>([]);

  const mainRef = useRef<HTMLDivElement>(null!);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const { showNotification } = useNotification();

  const t = useTranslations("Profile - Profile");

  useEffect(() => {
    const comprobarSesion = async () => {
      const { data: { user } } = await supabase.auth.getUser(); 
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    comprobarSesion();
  }, []);

  const cargarDatosPerfil = async () => {
    setLoading(true);
    try {
      const { data: targetProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("nickname", targetNickname)
        .single();

      if (!targetProfile) {
        setLoading(false);
        return;
      }

      const targetUserId = targetProfile.id; 

      const { data: ratingsData } = await supabase
        .from("user_games")
        .select("rating")
        .eq("user_id", targetUserId)
        .not("rating", "is", null);

      if (ratingsData && ratingsData.length > 0) {
        let suma = 0;
        let contadorValidos = 0;
        let counts: Record<number, number> = { 0.5: 0, 1: 0, 1.5: 0, 2: 0, 2.5: 0, 3: 0, 3.5: 0, 4: 0, 4.5: 0, 5: 0 };

        ratingsData.forEach((row) => {
          const nota = Number(row.rating);
          
          if (nota > 0) {
            suma += nota;
            contadorValidos++;
            
            const bucket = Math.round(nota * 2) / 2;
            if (counts[bucket] !== undefined) {
              counts[bucket] += 1;
            }
          }
        });

        const mediaFinal = contadorValidos > 0 ? (suma / contadorValidos) : 0;
        
        setNotaMedia(Number(mediaFinal.toFixed(1)));
        setDistribucionNotas(counts);
        setMaxNotaCount(Math.max(...Object.values(counts), 1));
      } else {
        setNotaMedia(0);
        setDistribucionNotas({ 0.5: 0, 1: 0, 1.5: 0, 2: 0, 2.5: 0, 3: 0, 3.5: 0, 4: 0, 4.5: 0, 5: 0 });
        setMaxNotaCount(1);
      }

      const { data: favsData } = await supabase
        .from("user_games")
        .select(`
          game_id,
          time_played,
          difficulty,
          rating,
          platform,
          games (
            title,
            cover_image_url,
            platforms
          )
        `)
        .eq("user_id", targetUserId)
        .eq("isFavorite", true)
        .limit(5);

      if (favsData) {
        setFavoritos(favsData);
      } else {
        setFavoritos([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetNickname) {
      cargarDatosPerfil();
    }
  }, [targetNickname]);

  const favoritosMostrados = Array(5).fill(null).map((_, index) => favoritos[index] || null);
  const escalas = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

  if (loading) {
    return <div style={{ padding: "20px", textAlign: "center" }}>{t("info_loading")}</div>;
  }

  return (
    <div ref={mainRef} style={{ position: "relative", minHeight: "100%" }}>
      <div style={{ display: "flex", gap: "30px", alignItems: "stretch" }}>
        <style>{`
          .rating-bar {
            background-color: #b9d5fa;
            transition: height 0.5s ease-out, background-color 0.2s ease, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s ease;
            cursor: pointer;
            position: relative;
            transform-origin: bottom; 
          }
          .rating-bar:hover {
            background-color: #7baaf7;
            transform: scaleX(1.15) scaleY(1.1); 
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10; 
          }
        `}</style>
        
        <fieldset style={{ width: "280px", padding: "15px", display: "flex", flexDirection: "column", gap: "25px", backgroundColor: "#fff", border: "1px solid #ccc" }}>
          <legend style={{ fontSize: "16px", padding: "0 5px" }}>{t("section_ratings")}</legend>

          <style>{`
            .stat-bar {
              transition: height 0.5s ease-out, background-color 0.2s ease, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s ease;
              cursor: pointer;
              position: relative;
              transform-origin: bottom;
            }
            .stat-bar:hover {
              transform: scaleX(1.15) scaleY(1.1);
              box-shadow: 0 5px 15px rgba(0,0,0,0.2);
              z-index: 10;
            }
            .stat-bar.rating { background-color: #81c784; }
            .stat-bar.rating:hover { background-color: #2e7d32; }
          `}</style>

          <div>
            <div style={{ textAlign: "center", marginBottom: "15px" }}>
              <span style={{ fontSize: "12px", color: "#666", textTransform: "uppercase", letterSpacing: "1px" }}>{t("label_average_rating")}</span>
              <div style={{ fontSize: "28px", color: "#111", marginTop: "2px" }}>
                {notaMedia > 0 ? `${notaMedia.toFixed(1)} ★` : "--"}
              </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "flex-end", height: "80px", gap: "4px", borderBottom: "1px solid #ccc", paddingBottom: "2px" }}>
              {escalas.map((estrella) => {
                const heightPercent = maxNotaCount > 0 ? (distribucionNotas[estrella] / maxNotaCount) * 100 : 0;
                return (
                  <div 
                    key={estrella}
                    className="stat-bar rating"
                    onClick={() => {
                      if (distribucionNotas[estrella] > 0) {
                        router.push(`/profile/${targetNickname}/games?rating=${estrella}`);
                      }
                    }}
                    style={{ flex: 1, height: `${Math.max(heightPercent, 2)}%` }} 
                    title={`${estrella}★: ${distribucionNotas[estrella]} juegos`}
                  ></div>
                );
              })}
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#666", marginTop: "4px" }}>
              <span>1★</span><span>5★</span>
            </div>
          </div>
        </fieldset>

        <fieldset style={{ flex: 1, padding: "20px", backgroundColor: "#fff" }}>
          <legend style={{ fontSize: "18px" }}>{t("section_favorite_games")}</legend>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "15px" }}>
            {favoritosMostrados.map((fav, index) => (
              <GameCaseCard 
                key={index}
                isEmpty={!fav}
                gameData={fav}
                onClick={() => {
                  if (fav) router.push(`/game/${fav.game_id}`);
                }}
              />
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
}