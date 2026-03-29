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
    height: "100dvh", // Mudança de minHeight para height
    display: "flex",
    flexDirection: "column",
    background: "var(--jardim-secundaria)",
    padding: isMobile ? "0" : "20px", // Removi o padding bottom de 20px que criava espaço
    boxSizing: "border-box",
    overflow: "hidden" // Evita que a página inteira role, apenas a tabela/lista deve rolar
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
    {children}
      </div>
    </div>
  );
}