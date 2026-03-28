import React, { useState, useEffect } from "react";
import { MapPin } from "lucide-react";

// Configuração de Status - Paleta Jardim
const statusConfig = {
  VERMELHO: { cor: "var(--jardim-pronto)", texto: "PRONTO PARA EXUMAR", bg: "#f0fdf4" },
  AMARELO: { cor: "var(--jardim-alerta)", texto: "AVISO: 2 ANOS", bg: "#f0f4f2" },
  VERDE:   { cor: "var(--jardim-acento)", texto: "DENTRO DO PRAZO", bg: "#f8fafc" }
};

const ExumacaoCard = ({ dado, onConfirmar, formatarData }) => {
  // --- CORREÇÃO DO ERRO: Definindo isMobile ---
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // --------------------------------------------

  const config = statusConfig[dado.alerta_cor] || {
    cor: "#cbd5e0",
    texto: "N/A",    
    bg: "#ffffff"
  };

  const jaPodeExumar = dado.alerta_cor === "VERMELHO";

  return (
<div style={{
  background: "var(--jardim-pedra)",
  borderRadius: isMobile ? 0 : 12,
  padding: isMobile ? "7px 12px" : "12px 15px", // Padding reduzido
  marginBottom: isMobile ? 0 : "8px",
  borderLeft: `5px solid ${config.cor}`,
  borderBottom: isMobile ? "1px solid #e2e8f0" : "none",
  boxShadow: isMobile ? "none" : "0 4px 12px rgba(0,0,0,0.03)",
    
  // SOLUÇÃO PARA NÃO PASSAR DO FUNDO:
  width: "100%", 
  boxSizing: "border-box", 
  display: "flex",
  flexDirection: "column",
  gap: "1px" // Reduz o espaço entre as linhas de dados
}}>
      {/* Nome em Verde Musgo Profundo */}
      <div style={{ 
        fontSize: 14, 
        fontWeight: 700, 
        color: "var(--jardim-primaria)", 
        lineHeight: 1.2 
      }}>
        {dado.nome?.toUpperCase()}
      </div>

      {/* Tipo do Lote */}
      <div style={cardStyles.subinfo}>
        {dado.tipo_lote || "Sepultamento Comum"}
      </div>

      {/* Localização */}
      <div style={cardStyles.local}>
        <MapPin size={14} color="var(--jardim-acento)" />
        <span>
          <strong>{dado.quadra || "S/Q"}</strong> • {dado.lote || "S/L"}
          {dado.gaveta && ` • Pos. ${dado.gaveta}`}
        </span>
      </div>

      {/* Data e Status */}
      <div style={cardStyles.footer}>
        <span style={{ color: "#555" }}>
          Sep: <strong>{formatarData(dado.data_sepultamento)}</strong>
        </span>

        <span style={{ 
          fontSize: 10, 
          fontWeight: 800, 
          color: config.cor,
          background: config.bg,
          padding: '2px 6px',
          borderRadius: '4px'
        }}>
          {config.texto}
        </span>
      </div>

      {/* Botão de Ação */}
      {jaPodeExumar && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConfirmar(dado);
          }}
          style={{ 
            ...cardStyles.botao, 
            background: "var(--jardim-primaria)" 
          }}
        >
          CONFIRMAR EXUMAÇÃO
        </button>
      )}
    </div>
  );
};

// 2. Substitua seu cardStyles por este mais compacto:
const cardStyles = {
  nome: { 
    fontSize: 13, 
    fontWeight: 700, 
    marginBottom: "0px", // Zerado para aproximar do subinfo
    lineHeight: 1.1 
  },
  subinfo: { 
    fontSize: 11, 
    color: "#666", 
    marginBottom: "0px" // Zerado para aproximar do local
  },
  local: { 
    fontSize: 11, 
    color: "#444", 
    display: "flex", 
    alignItems: "center", 
    gap: "5px", 
    marginBottom: "2px" // Espaço mínimo antes do footer
  },
  footer: { 
    display: "flex", 
    justifyContent: "space-between", 
    fontSize: 11, 
    alignItems: "center",
    marginTop: "0px" 
  },
  botao: {
    width: "100%",
    marginTop: "6px", // Aproxima o botão dos dados
    padding: "10px", 
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  }
};

export default ExumacaoCard;