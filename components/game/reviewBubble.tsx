"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare } from "lucide-react";

interface ReviewBubbleProps {
  reviewText: string;
}

export default function ReviewBubble({ reviewText }: ReviewBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bubbleRef.current && !bubbleRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!reviewText || reviewText.trim() === "") return null;

  return (
    <div style={{ position: "relative", display: "inline-block" }} ref={bubbleRef}>
      <div
        onClick={(e) => {
          e.stopPropagation(); 
          setIsOpen(!isOpen);
        }}
        style={{
          cursor: "pointer",
          color: isOpen ? "#3b82f6" : "#374151", 
          transition: "color 0.2s ease, transform 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        title="Leer reseña"
      >
        <MessageSquare 
          size={26}
          style={{ 
            fill: "#ffffff",
            filter: "drop-shadow(1px 2px 3px rgba(0,0,0,0.3))" 
          }} 
        />
      </div>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: "24px",
            right: "0",
            width: "230px",
            maxHeight: "150px",
            overflowY: "auto",
            backgroundColor: "#fff",
            border: "1px solid #9ca3af",
            boxShadow: "3px 3px 0px rgba(0,0,0,0.15)",
            padding: "10px",
            zIndex: 100,
            fontSize: "13px",
            lineHeight: "1.4",
            color: "#111",
            cursor: "text"
          }}
        >
          <span style={{ position: "relative", zIndex: 2 }}>{reviewText}</span>
        </div>
      )}
    </div>
  );
}