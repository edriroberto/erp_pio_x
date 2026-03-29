const LoteCard = ({ lote, selecionado, onClick, abrirFoto }) => (
  <div 
    onClick={onClick}
    style={{
      background: selecionado ? "#f0fdf4" : "var(--jardim-pedra)",
      borderRadius: "8px",
      padding: "8px 12px", // Respiro melhor
      marginBottom: "6px",
      cursor: "pointer",
      border: selecionado ? "1px solid var(--jardim-primaria)" : "1px solid #e2e8f0",
      borderLeft: `3px solid ${lote.foto_url ? "var(--jardim-acento)" : "#cbd5e0"}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <div style={{ flex: 1 }}>
      <div style={{ 
        fontWeight: "600", // Menos pesado que 800
        color: selecionado ? "var(--jardim-primaria)" : "#334155", 
        fontSize: "13px",
        letterSpacing: "0.5px" // Dá elegância
      }}>
        Lote {lote.numero}
      </div>
      <div style={{ 
        fontSize: "10px", 
        color: "#94a3b8", // Cinza mais suave
        marginTop: "1px", 
        fontWeight: "400" // Fonte fina para contraste
      }}>
        {lote.tipos_lote?.descricao || "Não definido"} • {lote.capacidade_gavetas} vagas
      </div>
    </div>
    
    {/* Ícone de foto menor e mais discreto */}
    <div style={{ opacity: lote.foto_url ? 1 : 0.4 }}>
       {lote.foto_url ? 
         <img src={lote.foto_url} style={{ width: "32px", height: "32px", borderRadius: "4px", objectFit: "cover" }} /> : 
         <Camera size={14} color="#94a3b8" />
       }
    </div>
  </div>
);