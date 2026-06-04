"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"; 
import { supabase } from "@/lib/supabase";
import { Trophy, User, Settings, LogOut, ChevronDown } from "lucide-react"; 

import { useTranslations, useLocale } from 'next-intl';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  
  const t = useTranslations('Navbar');
  const currentLocale = useLocale();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('nickname') 
          .eq('id', session.user.id)
          .maybeSingle();
          
        if (error) {
          console.error("Error al sacar el perfil:", error);
        }
          
        setUsername(profile?.nickname || session.user.email);
      } else {
        setUser(null);
        setUsername(null);
      }
      setLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const [textoBusqueda, setTextoBusqueda] = useState("");
  const ejecutarBusqueda = (e: React.FormEvent) => {
    e.preventDefault();
    if (textoBusqueda.trim() !== "") {
      router.push(`/busqueda?q=${encodeURIComponent(textoBusqueda)}`);
    }
  };

  const changeLanguage = (newLocale: string) => {
    if (!pathname) return;
    const segments = pathname.split('/');
    segments[1] = newLocale; 
    router.push(segments.join('/'));
    setIsLangMenuOpen(false);
  };

  return (
    <nav style={{
      background: "linear-gradient(to bottom, rgba(175, 205, 245, 0.4) 0%, rgba(135, 175, 225, 0.3) 100%)",
      backdropFilter: "blur(12px) saturate(150%)",
      WebkitBackdropFilter: "blur(12px) saturate(150%)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.6)",
      borderTop: "1px solid rgba(255, 255, 255, 0.8)",
      boxShadow: "0 4px 15px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(0,0,0,0.1)",
      position: "sticky",
      top: 0,
      zIndex: 50,
      width: "100%",
      display: "flex",
      justifyContent: "center"
    }}>
      <div style={{ 
        width: "100%", 
        maxWidth: "1600px",
        margin: "0 auto", 
        padding: "10px 20px", 
        display: "flex", 
        justifyContent: "space-between",
        alignItems: "center" 
      }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <Trophy style={{ width: "32px", height: "32px", color: "#BBBBBB", filter: "drop-shadow(0 2px 2px rgba(255,255,255,0.6))" }} />
          <span style={{ fontSize: "1.5rem", fontWeight: "900", color: "#000", textShadow: "0 0 5px rgba(255,255,255,0.8), 0 1px 1px rgba(255,255,255,1)" }}>
            Trophy<span style={{ color: "#BBBBBB" }}>d</span>
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {loading ? (
            <div style={{ width: "100px", height: "30px" }}></div>
          ) : !user ? (
            <section className="field-row" style={{ display: "flex", margin: 0, gap: "15px" }}>
              <Link href="/login">
                <button type="button">{t('login')}</button>
              </Link>
              <Link href="/register">
                <button className="default">{t('register')}</button>
              </Link>
            </section>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              
              <form className="searchbox" onSubmit={ejecutarBusqueda} style={{ display: "flex", height: "28px", minWidth: "250px" }}>
                <input 
                  type="search" 
                  placeholder={t('search')} 
                  style={{ height: "100%", width: "100%" }} 
                  value={textoBusqueda}
                  onChange={(e) => setTextoBusqueda(e.target.value)}
                />
                <button type="submit" aria-label="search" style={{ height: "93%" }}></button>
              </form>

              <div style={{ position: "relative" }}>
                <button 
                  type="button" 
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <span className={`fi ${currentLocale === 'es' ? 'fi-es' : 'fi-gb'}`} style={{ borderRadius: "2px" }}></span>
                  <strong style={{ textTransform: "uppercase" }}>{currentLocale}</strong>
                  <ChevronDown size={14} />
                </button>

                {isLangMenuOpen && (
                  <ul role="menu" style={{ position: "absolute", top: "100%", right: 0, marginTop: "2px", zIndex: 100, minWidth: "120px" }}>
                    <li role="menuitem" onClick={() => changeLanguage('es')} style={{ cursor: "pointer" }}>
                      <a style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="fi fi-es"></span> Español
                      </a>
                    </li>
                    <li role="menuitem" onClick={() => changeLanguage('en')} style={{ cursor: "pointer" }}>
                      <a style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="fi fi-gb"></span> English
                      </a>
                    </li>
                  </ul>
                )}
              </div>

              <div style={{ position: "relative" }}> 
                <button 
                  type="button" 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <User size={16} color="#0044aa" />
                  <strong>{username}</strong>
                  <ChevronDown size={14} />
                </button>

                {isMenuOpen && (
                  <ul role="menu" style={{ position: "absolute", top: "100%", right: 0, marginTop: "2px", zIndex: 100, minWidth: "160px" }}>
                    
                    <li role="menuitem" style={{ cursor: "pointer" }}>
                      <Link href={`/profile/${username}`} onClick={() => setIsMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "inherit" }}>
                        <User size={14} /> {t('profile')}
                      </Link>
                    </li>

                    <li role="menuitem" style={{ cursor: "pointer" }}>
                      <Link href="/settings" onClick={() => setIsMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "inherit" }}>
                        <Settings size={14} /> {t('settings')}
                      </Link>
                    </li>

                    <li className="divider"></li>

                    <li role="menuitem" onClick={handleLogout} style={{ cursor: "pointer" }}>
                      <a style={{ display: "flex", alignItems: "center", gap: "8px", color: "darkred" }}>
                        <LogOut size={14} /> {t('logout')}
                      </a>
                    </li>

                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}