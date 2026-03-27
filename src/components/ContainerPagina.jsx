import React, { useState, useEffect } from "react";

export default function ContainerPagina({ titulo, children }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#f2f2f7",
        
        // Zera o padding no mobile para ocupar a largura toda
        padding: isMobile ? "0" : "20px", 
        
        display: "flex",
        flexDirection: "column",
        
        // Mantém o espaço entre os elementos internos (Título, Filtros, Cards)
        // No mobile, adicionamos um pequeno gap para não colarem um no outro verticalmente
        gap: isMobile ? "8px" : "16px", 
        
        boxSizing: "border-box",
        margin: "0",
        overflowX: "hidden",
      }}
    >
      {/* O título e os filtros precisam de um respiro nas laterais para não encostarem no vidro */}
      {titulo && (
        <h3 style={{ 
          margin: isMobile ? "15px 15px 5px 15px" : "0", 
          fontSize: isMobile ? "1.2rem" : "1.5rem",
          color: "#1c1c1e"
        }}>
          {titulo}
        </h3>
      )}

      {/* DICA: Se você quer que os CARDS ocupem a largura toda, 
         os filhos (children) serão renderizados aqui sem padding lateral.
      */}
      <div style={{ width: "100%" }}>
        {children}
      </div>
    </div>
  );
}