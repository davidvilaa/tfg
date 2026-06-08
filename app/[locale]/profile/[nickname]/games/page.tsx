"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eraser,} from "lucide-react";
import GameCaseCard from "@/components/cards/gameCard";
import { useNotification } from "@/components/NotificationProvider";
import { useTranslations } from "next-intl";

export default function ProfileGamesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const targetNickname = params.nickname as string;

  const [loading, setLoading] = useState(true);
  const [allGames, setAllGames] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const [filterStatus, setFilterStatus] = useState("completed");
  const ratingFromUrl = searchParams.get("rating");
  const [filterRating, setFilterRating] = useState(ratingFromUrl || "all");
  const [sortBy, setSortBy] = useState("added_desc");

  const mainRef = useRef<HTMLDivElement>(null!);

  const { showNotification } = useNotification();

  const t = useTranslations("Profile - Games");

  const cargarJuegos = async () => {
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("nickname", targetNickname)
        .single();

      if (!profile) return;

      const { data: allGamesData } = await supabase
        .from("user_games")
        .select(`*, games (title, cover_image_url, platforms)`)
        .eq("user_id", profile.id);

      if (allGamesData) setAllGames(allGamesData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const comprobarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setCurrentUserId(session.user.id);
    };
    comprobarSesion();
  }, []);

  useEffect(() => {
    if (targetNickname) cargarJuegos();
  }, [targetNickname]);

  const clearFilters = () => {
    setFilterRating("all");
    setSortBy("added_desc");
    router.replace(`/profile/${targetNickname}/games`, { scroll: false });
  };

  const hasActiveFilters = filterRating !== "all" || sortBy !== "added_desc";

  const processedGames = allGames
    .filter((g) => g.status === filterStatus)
    .filter((g) => filterRating === "all" || Number(g.rating) === Number(filterRating))
    .sort((a, b) => {
      if (sortBy === "added_desc") {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      }
      if (sortBy === "title_asc") return a.games.title.localeCompare(b.games.title);
      if (sortBy === "title_desc") return b.games.title.localeCompare(a.games.title);
      if (sortBy === "rating_desc") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "time_desc") return (b.time_played || 0) - (a.time_played || 0);
      return 0;
    });

  const escalas = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
  const statuses = ["completed", "playing", "paused", "dropped", "wishlist"];

  if (loading) return <div style={{ padding: "20px", textAlign: "center" }}>{t("info_loading")}</div>;

  return (
    <div ref={mainRef} style={{ position: "relative", minHeight: "100%" }}>
      <fieldset style={{ padding: "20px", backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "4px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <legend style={{ fontSize: "18px" }}>{t("section_games")}</legend>
        <style>{`
          .status-btn {
            padding: 4px 12px;
            cursor: pointer;
            text-transform: capitalize;
            transition: all 0.2s ease;
          }
          .status-btn.active {
            background: #e3e3e3 !important;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.25) !important;
            outline: none !important;
          }
          .reset-btn-narrow {
            background: none;
            border: none;
            cursor: default;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            transition: all 0.2s ease;
            opacity: 0.4;
            color: #d9534f;
            width: fit-content;
          }
          .reset-btn-narrow.active {
            cursor: pointer;
            opacity: 1;
          }
        `}</style>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "15px", borderBottom: "1px solid #ccc", flexWrap: "wrap", gap: "15px" }}>
          
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {statuses.map((status) => (
              <button
                key={status}
                className={`status-btn ${filterStatus === status ? "active" : ""}`}
                onClick={() => setFilterStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label htmlFor="filterRating">{t("label_rating")}</label>
              <select id="filterRating" value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
                <option value="all">{t("label_rating_placeholder")}</option>
                {escalas.map(nota => (
                  <option key={nota} value={nota}>{nota} ★</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label htmlFor="sortBy">{t("label_sortby")}</label>
              <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="added_desc">{t("label_sortby_options.when_added")}</option>
                <option value="title_asc">{t("label_sortby_options.title_az")}</option>
                <option value="title_desc">{t("label_sortby_options.title_za")}</option>
                <option value="rating_desc">{t("label_sortby_options.highest_rated")}</option>
                <option value="time_desc">{t("label_sortby_options.most_played_time")}</option>
              </select>
            </div>

            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className={`reset-btn-narrow ${hasActiveFilters ? "active" : ""}`}
              title="Clear Filters"
              style={{ width: "40px", minWidth: "26px", height: "26px", minHeight: "26px", padding: 0, margin: 0, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "none", border: "1px solid transparent", borderRadius: "3px" }}
            >
              <Eraser size={18} />
            </button>
          </div>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "15px", paddingTop: "10px" }}>
          {processedGames.length > 0 ? (
            processedGames.map((juego) => (
              <GameCaseCard 
                key={juego.game_id}
                gameData={juego}
                onClick={() => router.push(`/game/${juego.game_id}`)}
              />
            ))
          ) : (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#666", padding: "20px 0" }}>{t("info_no_games_found")}</p>
          )}
        </div>
      </fieldset>
    </div>
  );
}