// components/LoteCard.jsx
import React from "react";
import { Info, Box, Camera } from "lucide-react";

export default function LoteCard({ l, selecionado, onClick, abrirFoto }) {
  const tipoDescricao = l.tipos_lote?.descricao || "Não definido";

  return (
    <div 
      onClick={onClick}
      style={{
        background: selecionado ? "#f0fdf4" : "var(--jardim-pedra)",
        borderRadius: "8px",
        padding: "8px 12px",
        marginBottom: "6px",
        cursor: "pointer",
        border: selecionado ? "1px solid var(--jardim-primaria)" : "1px solid #e2e8f0",
        borderLeft: `4px solid ${l.foto_url ? "var(--jardim-acento)" : "#94a3b8"}`, // Âmbar se tiver foto, cinza se não
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "all 0.2s"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <div style={{ 
          fontWeight: "800", 
          color: "var(--jardim-primaria)", 
          fontSize: "13px",
          textTransform: "uppercase" 
        }}>
          Lote {l.numero}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "#64748b" }}>
          <Info size={10} /> {tipoDescricao}
          <span style={{ margin: "0 4px" }}>•</span>
          <Box size={10} /> {l.capacidade_gavetas} Vagas
        </div>
      </div>

      <div 
        onClick={(e) => { e.stopPropagation(); abrirFoto(l); }}
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "6px",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #e2e8f0",
          overflow: "hidden"
        }}
      >
        {l.foto_url ? (
          <img src={l.foto_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Camera size={16} color="#cbd5e0" />
        )}
      </div>
    </div>
  );
}