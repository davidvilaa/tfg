"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import LandingTrendingGames from "@/components/welcomeLandingTrendingGames";
import { useTranslations } from 'next-intl';

export default function WelcomeLanding() {
  const t = useTranslations("WelcomeLanding");

  const [stats, setStats] = useState({
    users: 0,
    games: 0,
    guides: 0,
    logs: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [
        { count: usersCount },
        { count: gamesCount },
        { count: guidesCount },
        { count: logsCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('games').select('*', { count: 'exact', head: true }),
        supabase.from('guides').select('*', { count: 'exact', head: true }),
        supabase.from('user_games').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        users: usersCount || 0,
        games: gamesCount || 0,
        guides: guidesCount || 0,
        logs: logsCount || 0
      });
    };

    fetchStats();
  }, []);

  return (
    <div style={{ width: "100%", paddingBottom: "80px", color: "#000" }}>
      <div style={{
        width: "100%",
        height: "400px", 
        backgroundImage: "url('https://i.ibb.co/mVT86gB4/imagen-2026-06-02-181001503.png')", 
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative"
      }}>
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "180px",
          background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)",
          pointerEvents: "none"
        }} />
      </div>
      <div style={{ 
        maxWidth: "1200px", 
        margin: "0 auto", 
        padding: "0 20px",
        position: "relative",
        marginTop: "-120px", 
        zIndex: 10
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "12px" }}>
          <h1 style={{
            fontSize: "5rem",
            fontWeight: "900",
            margin: "0",
            lineHeight: "1",
            textShadow: "0 2px 10px rgba(255,255,255,0.9), 0 4px 20px rgba(0,0,0,0.15)"
          }}>
            Trophy<span style={{ color: "#BBBBBB" }}>d</span>
          </h1>

          <p style={{
            fontSize: "1.3rem",
            color: "#222",
            fontWeight: "600",
            margin: "0 0 5px 0",
            maxWidth: "600px",
            textShadow: "0 1px 3px rgba(255,255,255,0.8)"
          }}>
            {t("subtitle")}
          </p>
          <div style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            padding: "8px 0",
          }}>
            {[
              { color: "#0044aa", label: t("s_users"), value: stats.users },
              { color: "#22c55e", label: t("s_games"), value: stats.games },
              { color: "#f97316", label: t("s_guides"), value: stats.guides },
              { color: "#a855f7", label: t("s_logs"), value: stats.logs }
            ].map((stat, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ 
                  width: "10px", 
                  height: "10px", 
                  backgroundColor: stat.color, 
                  borderRadius: "2px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.2)"
                }} />
                
                <span style={{ fontSize: "1rem", color: "#111", display: "flex", gap: "4px", textShadow: "0 1px 2px rgba(255,255,255,0.8)" }}>
                  <strong>{stat.value.toLocaleString()}</strong> <span style={{ color: "#555" }}>{stat.label}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: "100px", marginBottom: "80px" }}>
          <h2 style={{ 
            fontSize: "1.8rem", 
            marginBottom: "20px", 
            paddingBottom: "10px",
            borderBottom: "2px solid rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#111"
          }}>
            {t("trending_title")}
          </h2>
          <div style={{ position: "relative", zIndex: 10 }}>
              <LandingTrendingGames />
          </div>
        </div>
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ fontSize: "2.8rem", textAlign: "center", marginBottom: "70px", fontWeight: "900", color: "#111" }}>
            {t("what_is")} Trophy<span style={{ color: "#BBBBBB" }}>d</span>?
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: "50px", marginBottom: "90px", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 450px", borderRadius: "12px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.5)" }}>
              <img src="https://github.com/user-attachments/assets/08f8d2b3-d378-41f0-8a23-3aed45a8dba0" alt="Experiencia 3D Inmersiva" style={{ width: "100%", display: "block" }} />
            </div>
            <div style={{ flex: "1 1 450px" }}>
              <h3 style={{ fontSize: "1.8rem", marginBottom: "15px", color: "#0044aa", fontWeight: "bold" }}>🎮 {t("feature_1_title")}</h3>
              <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "#333" }}>
                {t("feature_1")}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "50px", marginBottom: "90px", flexWrap: "wrap-reverse" }}>
            <div style={{ flex: "1 1 450px" }}>
              <h3 style={{ fontSize: "1.8rem", marginBottom: "15px", color: "#0044aa", fontWeight: "bold" }}>🌍{t("feature_2_title")}</h3>
              <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "#333" }}>
                {t("feature_2")}
              </p>
            </div>
            <div style={{ flex: "1 1 450px", borderRadius: "12px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.5)" }}>
              <img src="https://github.com/user-attachments/assets/2bfa9d14-5e51-4d3b-967e-f2f8dc0a5859" alt="Interacción Social" style={{ width: "100%", display: "block" }} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "50px", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 450px", borderRadius: "12px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.5)" }}>
              <img src="https://github.com/user-attachments/assets/710e2d54-599e-42c2-899e-278e137acbc5" alt="Colaboración Total" style={{ width: "100%", display: "block" }} />
            </div>
            <div style={{ flex: "1 1 450px" }}>
              <h3 style={{ fontSize: "1.8rem", marginBottom: "15px", color: "#0044aa", fontWeight: "bold" }}>🤝 {t("feature_3_title")}</h3>
              <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "#333" }}>
                {t("feature_3")}
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}