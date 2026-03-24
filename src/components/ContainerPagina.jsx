import React, { useState, useEffect } from "react";

export default function ContainerPagina({ titulo, children }) {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: isMobile ? "12px" : "20px",
      minHeight: "100dvh", 
      width: "100%",
      background: "#f8fafc", // Um tom mais moderno e limpo
      padding: isMobile ? "16px 0" : "24px", // Sangrado no mobile
      boxSizing: "border-box",
    }}>
      {titulo && (
        <h2 style={{ 
          margin: 0, 
          padding: isMobile ? "0 16px" : "0",
          fontSize: isMobile ? "22px" : "28px",
          fontWeight: "800",
          color: "#1e293b"
        }}>
          {titulo}
        </h2>
      )}
      {children}
    </div>
  );
}