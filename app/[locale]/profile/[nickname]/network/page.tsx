"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { UserPlus, UserMinus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ProfileNetworkPage() {
  const params = useParams();
  const router = useRouter();
  const targetNickname = params.nickname as string;

  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [myFollowingIds, setMyFollowingIds] = useState<string[]>([]);

  const t = useTranslations("Profile - Network");

  useEffect(() => {
    const cargarNetwork = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let loggedUserId = null;
        if (session) {
          loggedUserId = session.user.id;
          setCurrentUserId(loggedUserId);
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("nickname", targetNickname)
          .single();

        if (!profile) return;
        const targetId = profile.id;
        setTargetUserId(targetId); 

        const { data: followersData } = await supabase
          .from("follows")
          .select("profiles!follows_follower_id_fkey(id, nickname, pfp_url)")
          .eq("following_id", targetId);

        const { data: followingData } = await supabase
          .from("follows")
          .select("profiles!follows_following_id_fkey(id, nickname, pfp_url)")
          .eq("follower_id", targetId);

        if (followersData) setFollowers(followersData.map((f: any) => Array.isArray(f.profiles) ? f.profiles[0] : f.profiles));
        if (followingData) setFollowing(followingData.map((f: any) => Array.isArray(f.profiles) ? f.profiles[0] : f.profiles));

        if (loggedUserId) {
          const { data: myFollows } = await supabase
            .from("follows")
            .select("following_id")
            .eq("follower_id", loggedUserId);
          
          if (myFollows) {
            setMyFollowingIds(myFollows.map(f => f.following_id));
          }
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (targetNickname) cargarNetwork();
  }, [targetNickname]);

  const toggleFollowList = async (targetId: string, isCurrentlyFollowing: boolean) => {
    if (!currentUserId) return;
    try {
      if (isCurrentlyFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", targetId);
        
        if (error) throw error;
        setMyFollowingIds(prev => prev.filter(id => id !== targetId));
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({ follower_id: currentUserId, following_id: targetId });
        
        if (error) throw error;
        setMyFollowingIds(prev => [...prev, targetId]);
      }
    } catch (error: any) {
      console.error("Error en la network:", error);
    }
  };

  const removeFollower = async (followerId: string) => {
    if (!currentUserId) return;
    
    const confirm = window.confirm(t("alert_remove_follower"));
    if (!confirm) return;

    try {
      const { error } = await supabase
        .from("follows")
        .delete()
        .match({ 
          follower_id: followerId,
          following_id: currentUserId 
        });
      
      if (error) throw error;
      
      setFollowers(prev => prev.filter(user => user.id !== followerId));
      
    } catch (error: any) {
      alert("Hubo un error al eliminar. Comprueba tu conexión o permisos.");
    }
  }

  if (loading) return <div style={{ padding: "20px", textAlign: "center" }}>{t("info_loading")}</div>;

  const isMyProfile = currentUserId === targetUserId;

  return (
    <div style={{ display: "flex", gap: "30px", alignItems: "flex-start" }}>
      
      <style>{`
        .user-card {
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s ease;
          cursor: pointer;
          position: relative;
          padding: 10px;
          margin: 0;
        }
        .user-card:hover { 
          transform: scale(1.05); 
          box-shadow: 0 10px 20px rgba(0,0,0,0.25) !important;
          z-index: 10;
        }
        .aero-btn-list:focus-visible {
          outline: 1px dotted #000 !important;
          outline-offset: -3px !important;
        }
      `}</style>
      <fieldset style={{ flex: 1, padding: "20px", backgroundColor: "#fff", minHeight: "300px" }}>
        <legend style={{ fontSize: "18px" }}>{t("section_followers")}</legend>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "15px" }}>
          {followers.length > 0 ? (
            followers.map((user) => {
              const amIFollowing = myFollowingIds.includes(user.id);
              return (
                <div key={user.id} className="window user-card">
                  <div className="window-body" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "15px", margin: 0 }}>
                    <div 
                      onClick={() => router.push(`/profile/${user.nickname}`)}
                      style={{ width: "50px", height: "50px", flexShrink: 0, border: "2px inset #fff", backgroundColor: "#ccc", backgroundImage: `url(${user.pfp_url || 'https://www.gravatar.com/avatar/0?d=mp&f=y'})`, backgroundSize: "cover", backgroundPosition: "center", cursor: "pointer" }}
                    ></div>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: "10px", flex: 1, overflow: "hidden" }}>
                      <span 
                        onClick={() => router.push(`/profile/${user.nickname}`)}
                        style={{ fontWeight: "bold", fontSize: "16px", cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}
                      >
                        {user.nickname}
                      </span>
                      
                      <div style={{ display: "flex", gap: "5px" }}>
                        {currentUserId && currentUserId !== user.id && (
                          <button 
                            className="default aero-btn-list"
                            onClick={() => toggleFollowList(user.id, amIFollowing)} 
                            style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px 10px", fontSize: "11px", flexShrink: 0 }}
                          >
                            {amIFollowing ? (
                              <><UserMinus size={13} strokeWidth={2.5} /> {t("btn_followers_unfollow")}</>
                            ) : (
                              <><UserPlus size={13} strokeWidth={2.5} /> {t("btn_followers_follow")}</>
                            )}
                          </button>
                        )}
                        {isMyProfile && (
                          <button 
                            onClick={() => removeFollower(user.id)}
                            style={{ 
                              position: "absolute", 
                              top: "-8px", 
                              right: "10px", 
                              background: "#f87171", 
                              border: "1px solid #dc2626", 
                              color: "white", 
                              cursor: "pointer", 
                              padding: "2px 6px", 
                              borderRadius: "3px" 
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ color: "#666", gridColumn: "1 / -1", textAlign: "center" }}>{t("btn_followers_empty")}</p>
          )}
        </div>
      </fieldset>
      <fieldset style={{ flex: 1, padding: "20px", backgroundColor: "#fff", minHeight: "300px" }}>
        <legend style={{ fontSize: "18px" }}>{t("section_following")}</legend>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "15px" }}>
          {following.length > 0 ? (
            following.map((user) => {
              const amIFollowing = myFollowingIds.includes(user.id);
              return (
                <div key={user.id} className="window user-card">
                  <div className="window-body" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "15px", margin: 0 }}>
                    <div 
                      onClick={() => router.push(`/profile/${user.nickname}`)}
                      style={{ width: "50px", height: "50px", flexShrink: 0, border: "2px inset #fff", backgroundColor: "#ccc", backgroundImage: `url(${user.pfp_url || 'https://www.gravatar.com/avatar/0?d=mp&f=y'})`, backgroundSize: "cover", backgroundPosition: "center", cursor: "pointer" }}
                    ></div>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: "10px", flex: 1, overflow: "hidden" }}>
                      <span 
                        onClick={() => router.push(`/profile/${user.nickname}`)}
                        style={{ fontWeight: "bold", fontSize: "16px", cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}
                      >
                        {user.nickname}
                      </span>
                      {currentUserId && currentUserId !== user.id && (
                        <button 
                          className="default aero-btn-list"
                          onClick={() => toggleFollowList(user.id, amIFollowing)} 
                          style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px 10px", marginRight: "5px", fontSize: "11px", flexShrink: 0 }}
                        >
                          {amIFollowing ? (
                            <>
                              <UserMinus size={13} strokeWidth={2.5} /> {t("btn_following_unfollow")}
                            </>
                          ) : (
                            <>
                              <UserPlus size={13} strokeWidth={2.5} /> {t("btn_following_follow")}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ color: "#666", gridColumn: "1 / -1", textAlign: "center" }}>{t("btn_following_empty")}</p>
          )}
        </div>
      </fieldset>
    </div>
  );
}