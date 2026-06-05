"use client";

import { useState, useEffect } from "react";
import { MoveLeft, MoveRight, House, FileEdit } from "lucide-react";
import { useRouter } from "next/navigation";
import GameCard3D from "@/components/gameCard3D";

interface GameFocusModalProps {
  focusedGame: any;
  userId: string | null;
  onClose: () => void;
  showNotification: (title: string, description: string) => void;
}

export default function GameFocusModal({ 
  focusedGame, 
  userId, 
  onClose, 
  showNotification 
}: GameFocusModalProps) {
  const router = useRouter();
  
  const [consolaFocus, setConsolaFocus] = useState<string | null>(focusedGame.platform || "pc");
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { 
      document.body.style.overflow = "auto"; 
    };
  }, []);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(5px)",
      zIndex: 100000, 
      display: "flex", flexDirection: "column",
      justifyContent: "flex-end", 
      alignItems: "center",
      paddingBottom: "30px" 
    }}>
      <div 
        className="window glass active" 
        style={{ 
          position: "absolute", 
          top: "30px",
          width: "90%", 
          maxWidth: "1100px", 
          zIndex: 120 
        }}
      >
        <div className="title-bar">
          <div className="title-bar-text" style={{ fontSize: "14px" }}></div>
          <div className="title-bar-controls">
            <button aria-label="Minimize"></button>
            <button aria-label="Maximize"></button>
            <button aria-label="Close" onClick={onClose}></button>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 105 }}>
        <GameCard3D 
          coverUrl={focusedGame.portada} 
          consola={consolaFocus}
          isFocused={true} 
          isLogging={isLogging}
          juego={focusedGame} 
          userId={userId}
          onPlatformFetched={(plat) => setConsolaFocus(plat)}
          onSaveSuccess={(action) => {
            setIsLogging(false); 
            onClose();
            showNotification(
              action === "deleted" ? "¡Juego Borrado!" : "¡Juego Actualizado!",
              action === "deleted" 
                ? `Has eliminado ${focusedGame.titulo} de tu colección.` 
                : `Has actualizado ${focusedGame.titulo} con éxito.`
            );
          }} 
        />
      </div>

      <div className="window" style={{ zIndex: 110, width: "auto", padding: "10px", position: "relative" }}>
        <div className="window-body" style={{ display: "flex", gap: "10px", alignItems: "center", margin: 0 }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "0", marginRight: "10px", height: "35px" }}>
            <button 
              onClick={() => {
                const consolas = focusedGame.todasLasConsolas?.length > 0 ? focusedGame.todasLasConsolas : ["pc"];
                const index = consolas.indexOf(consolaFocus || "pc");
                const prevIndex = index <= 0 ? consolas.length - 1 : index - 1;
                setConsolaFocus(consolas[prevIndex]);
              }}
              style={{ width: "35px", height: "100%", cursor: "pointer", padding: 0, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}
            >
              <MoveLeft size={18} />
            </button>

            <select 
              value={consolaFocus || "pc"} 
              onChange={(e) => setConsolaFocus(e.target.value)}
              style={{ width: "160px", height: "100%", cursor: "pointer", padding: "0 10px", margin: 0, boxSizing: "border-box", borderRadius: 0 }}
            >
              {focusedGame.todasLasConsolas && focusedGame.todasLasConsolas.length > 0 ? (
                focusedGame.todasLasConsolas.map((c: string) => (
                  <option key={c} value={c}>
                    {c.toUpperCase()}
                  </option>
                ))
              ) : (
                <option value="pc">PC</option>
              )}
            </select>

            <button 
              onClick={() => {
                const consolas = focusedGame.todasLasConsolas?.length > 0 ? focusedGame.todasLasConsolas : ["pc"];
                const index = consolas.indexOf(consolaFocus || "pc");
                const nextIndex = index >= consolas.length - 1 ? 0 : index + 1;
                setConsolaFocus(consolas[nextIndex]);
              }}
              style={{ width: "35px", height: "100%", cursor: "pointer", padding: 0, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}
            >
              <MoveRight size={18} />
            </button>
          </div>

          <button 
            onClick={() => router.push(`/game/${focusedGame.id}`)}
            style={{ 
              minWidth: "35px", height: "35px", padding: 0, cursor: "pointer", 
              display: "flex", alignItems: "center", justifyContent: "center",
              boxSizing: "border-box"
            }}
            title="Ver Ficha Técnica"
          >
            <House size={18} />
          </button>

          <button 
            onClick={() => setIsLogging(!isLogging)}
            className={isLogging ? "active" : ""}
            style={{ 
              minWidth: "35px", height: "35px", padding: 0, cursor: "pointer", 
              display: "flex", alignItems: "center", justifyContent: "center",
              backgroundColor: isLogging ? "#e3e3e3" : "",
              boxShadow: isLogging ? "inset 0 2px 4px rgba(0,0,0,0.25)" : "",
              boxSizing: "border-box"
            }}
            title={isLogging ? "Volver a Portada" : "Loguear Juego"}
          >
            {isLogging ? <MoveLeft size={18} /> : <FileEdit size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}