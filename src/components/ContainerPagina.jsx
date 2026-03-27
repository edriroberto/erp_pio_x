import React, { useState, useEffect } from "react";

export default function ContainerPagina({ titulo, children }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Escuta o redimensionamento da tela (importante se o usuário girar o celular)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100vw", // Evita scroll lateral acidental
        minHeight: "100vh",
        background: "#f2f2f7", // Tom cinza padrão iOS
        
        // No mobile, usamos um padding menor para os cards encostarem mais na borda
        padding: isMobile ? "8px 10px" : "20px", 
        
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? "10px" : "16px", // Espaço entre os elementos (Header, Filtros, Cards)
        
        boxSizing: "border-box",
        overflowX: "hidden", // Garante que nada "escape" para os lados
        margin: "0 auto",    // Centraliza o container sem margens negativas
      }}
    >
      {titulo && (
        <h3 style={{ 
          margin: 0, 
          fontSize: isMobile ? "1.2rem" : "1.5rem",
          color: "#1c1c1e",
          paddingLeft: isMobile ? "4px" : "0" 
        }}>
          {titulo}
        </h3>
      )}

      {children}
    </div>
  );
}