"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Float } from "@react-three/drei";
import * as THREE from "three";
import GameCaseCard from "@/components/cards/gameCard";

function Medalla3D({ url, rank }: { url: string, rank: number }) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => scene.clone(), [scene]);
  const meshRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const color = rank === 0 ? "#FFD700" : rank === 1 ? "#C0C0C0" : "#CD7F32";
    clone.traverse((child: any) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.color = new THREE.Color(color);
        child.material.metalness = 0.8;
        child.material.roughness = 0.2;
      }
    });
  }, [clone, rank]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 1.5;
    }
  });

  return (
    <group ref={meshRef} position={[1.5, -3, 0]}>
      <primitive object={clone} scale={0.06} position={[0, 0, 0]} />
    </group>
  );
}

function TrendingGameItem({ game, index, router }: { game: any, index: number, router: any }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div 
      style={{ position: "relative", width: "100%" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <GameCaseCard 
        gameData={game} 
        onClick={() => router.push(`/game/${game.id}`)}
      />

      {index < 3 && (
        <div style={{
          position: "absolute",
          bottom: "-25px",
          right: "-25px",
          width: "90px",
          height: "90px",
          zIndex: 40,
          pointerEvents: "none",
          opacity: hovered ? 0.2 : 1,
          transition: "opacity 0.3s ease"
        }}>
          <Canvas camera={{ position: [550, 0, 15], fov: 40 }}>
            <ambientLight intensity={1.5} />
            <directionalLight position={[5, 5, 5]} intensity={2} />
            <Environment preset="city" />
            <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
              <Medalla3D url="/models/medalla.glb" rank={index} />
            </Float>
          </Canvas>
        </div>
      )}
    </div>
  );
}

export default function LandingTrendingGames() {
  const [allEntries, setAllEntries] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const MAX_ITEMS = 5;

  useEffect(() => {
    const fetchGameData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("user_games")
          .select(`
            game_id,
            created_at,
            games ( id, title, cover_image_url )
          `);

        if (error) throw error;
        if (data) setAllEntries(data);
      } catch (error) {
        console.error("Error obteniendo juegos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGameData();
  }, []);

  useEffect(() => {
    if (allEntries.length === 0 && !loading) {
      setTrending([]);
      return;
    }

    const now = new Date();
    const timeLimit = new Date();
    timeLimit.setDate(now.getDate() - 1); 

    const filtered = allEntries.filter(entry => new Date(entry.created_at) >= timeLimit);

    const counts: Record<string, { count: number, gameData: any }> = {};
    filtered.forEach(entry => {
      if (!entry.games) return;
      const id = entry.game_id;
      if (!counts[id]) {
        counts[id] = { count: 0, gameData: entry.games };
      }
      counts[id].count++;
    });

    const sorted = Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, MAX_ITEMS) 
      .map(item => ({
        id: item.gameData.id,
        games: item.gameData, 
        title: item.gameData.title,
        cover_url: item.gameData.cover_image_url, 
        popularity: item.count
      }));

    setTrending(sorted);
  }, [allEntries, loading]);

  const placeholdersCount = Math.max(0, MAX_ITEMS - trending.length);
  const placeholdersArray = Array.from({ length: placeholdersCount });

  return (
    <div style={{ width: "100%", padding: "0" }}>
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>...</div>
      ) : (
        <div style={{ 
          display: "flex", 
          flexDirection: "row",
          justifyContent: "space-between", 
          width: "calc(100% + 40px)",
          marginLeft: "-20px",
          marginRight: "-20px",
          padding: "30px 20px 60px 20px",
          overflowX: "auto",
          overflowY: "hidden",
          gap: "15px", 
          scrollbarWidth: "none", 
          msOverflowStyle: "none"
        }}>
          
          {trending.map((juego, index) => (
            <div key={juego.id} style={{ flex: "0 0 190px" }}>
              <TrendingGameItem game={juego} index={index} router={router} />
            </div>
          ))}

          {placeholdersArray.map((_, i) => (
            <div key={`placeholder-${i}`} style={{ flex: "0 0 190px" }}>
              <div style={{
                width: "100%",
                aspectRatio: "3/4",
                borderRadius: "0", 
                backgroundColor: "rgba(0,0,0,0.08)"
              }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}