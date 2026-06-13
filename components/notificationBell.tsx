"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function NotificationBell({ currentUserId }: { currentUserId: string }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const t = useTranslations("Notifications")

  useEffect(() => {
    if (!currentUserId) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select(`
          id, type, guide_id, content_preview, is_read, created_at,
          actor:actor_id (nickname, pfp_url)
        `)
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    };

    fetchNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [currentUserId]);

  const handleOpenMenu = async () => {
    setIsOpen(!isOpen);
    
    if (!isOpen && unreadCount > 0) {
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", currentUserId)
        .eq("is_read", false);
    }
  };

  const handleNotificationClick = (notification: any) => {
    setIsOpen(false);
    if (notification.guide_id) {
      router.push(`/game/unknown/guide/${notification.guide_id}`); 
    } else if (notification.type === 'follow') {
      router.push(`/profile/${notification.actor.nickname}`);
    }
  };

  return (
    <div style={{ position: "relative" }} ref={menuRef}>
      <button 
        type="button"
        onClick={handleOpenMenu}
        style={{ 
          height: "28px", 
          width: "28px", 
          minWidth: "28px", 
          maxWidth: "28px",
          padding: 0, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          cursor: "pointer",
          boxSizing: "border-box"
        }}
      >
        <Bell size={16} color="#000" style={{ filter: "drop-shadow(0 0 2px rgba(255,255,255,0.8))" }} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: "-6px", right: "-6px",
            background: "darkred", color: "white", fontSize: "10px",
            fontWeight: "bold", padding: "1px 5px", borderRadius: "10px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.4)"
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          right: 0,
          marginTop: "8px",
          minWidth: "280px",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
          borderRadius: "4px",
          padding: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          zIndex: 100
        }}>
          {notifications.length === 0 ? (
            <div style={{ padding: "10px", textAlign: "center", color: "#444", fontSize: "13px", fontWeight: "bold" }}>
              {t("no_notifications")}
            </div>
          ) : (
            notifications.map((n) => (
              <button 
                key={n.id} 
                type="button"
                onClick={() => handleNotificationClick(n)}
                style={{ 
                  width: "100%", 
                  textAlign: "left", 
                  display: "flex", 
                  alignItems: "flex-start", 
                  gap: "10px",
                  padding: "8px",
                  backgroundColor: n.is_read ? "transparent" : "rgba(255, 255, 255, 0.3)",
                  border: n.is_read ? "1px solid transparent" : "1px solid rgba(255, 255, 255, 0.6)"
                }}
              >
                <img 
                  src={n.actor?.pfp_url || `https://www.gravatar.com/avatar/0?d=mp&f=y`} 
                  alt="avatar" 
                  style={{ width: "30px", height: "30px", borderRadius: "4px", border: "1px solid rgba(0,0,0,0.3)", flexShrink: 0 }}
                />
                <div style={{ fontSize: "12px", color: "#000", lineHeight: "1.3" }}>
                  <span style={{ fontWeight: "bold", color: "#0044aa" }}>{n.actor?.nickname} </span>
                  
                  {n.type === 'like' && t("like")}
                  {n.type === 'follow' && t("follow")}
                  {n.type === 'comment' && (
                    <span>
                      {t("comment")} <br/>
                      <span style={{ fontStyle: "italic", color: "#444" }}>"{n.content_preview}"</span>
                    </span>
                  )}
                  <div style={{ fontSize: "10px", color: "#666", marginTop: "4px" }}>
                    {new Date(n.created_at).toLocaleDateString()}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}