import React, { useState, useEffect } from "react";
import "../styles/tabela.css";

export default function ContainerPagina({ titulo, children }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    // Ajuste global para o corpo da página não ficar branco no Android
    document.body.style.backgroundColor = "#f2f2f7";
    document.body.style.margin = "0";
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        // dvh (Dynamic VH) resolve o problema da barra de navegação no Android
        minHeight: "100dvh", 
        // Fallback para navegadores que não suportam dvh
        "@supports not (height: 100dvh)": {
          minHeight: "100vh",
        },
        background: "var(--jardim-secundaria)",
        //        background: "#f2f2f7",
        padding: isMobile ? "0 0 20px 0" : "20px", // Padding inferior para o último card não colar na barra
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? "0" : "16px",
        boxSizing: "border-box",
        margin: "0",
      }}
    >
      {titulo && (
        <h3 style={{ 
          margin: isMobile ? "15px 15px 10px 15px" : "0", 
          fontSize: isMobile ? "1.2rem" : "1.5rem",
          color: "#1c1c1e"
        }}>
          {titulo}
        </h3>
      )}

      {/* Wrapper para os cards */}
      <div style={{ 
        width: "100%", 
        flex: 1, // Faz esse div "empurrar" o fundo até o fim da tela
        display: "flex", 
        flexDirection: "column" 
      }}>
        {children}
      </div>
    </div>
  );
}