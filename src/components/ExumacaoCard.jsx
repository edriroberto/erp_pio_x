import React from "react";
import { MapPin } from "lucide-react";

// Mover para fora evita recriação constante na memória
const statusConfig = {
  VERMELHO: { cor: "#e53e3e", texto: "PRONTO PARA EXUMAR" },
  AMARELO: { cor: "#d69e2e", texto: "AVISO: 2 ANOS" },
  VERDE:   { cor: "#38a169", texto: "DENTRO DO PRAZO" }
};

const ExumacaoCard = ({ dado, onConfirmar, formatarData }) => {
  const config = statusConfig[dado.alerta_cor] || {
    cor: "#cbd5e0",
    texto: "N/A"
  };

  const jaPodeExumar = dado.alerta_cor === "VERMELHO";

  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      padding: "8px 10px",
      marginBottom: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      borderLeft: `3px solid ${config.cor}`,
    }}>
      {/* Nome do Falecido */}
      <div style={cardStyles.nome}>{dado.nome}</div>

      {/* Tipo do Lote */}
      <div style={cardStyles.subinfo}>{dado.tipo_lote}</div>

      {/* Localização */}
      <div style={cardStyles.local}>
        <MapPin size={12} />
        <span>
          {dado.quadra} • {dado.lote}
          {dado.gaveta && ` • Pos. ${dado.gaveta}`}
        </span>
      </div>

      {/* Data e Status */}
      <div style={cardStyles.footer}>
        <span style={{ color: "#555" }}>
          Sep: <strong>{formatarData(dado.data_sepultamento)}</strong>
        </span>

        <span style={{ fontSize: 10, fontWeight: 700, color: config.cor }}>
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
          style={cardStyles.botao}
        >
          CONFIRMAR EXUMAÇÃO
        </button>
      )}
    </div>
  );
};

// Organizando os estilos internos para o arquivo não ficar gigante
const cardStyles = {
  nome: { fontSize: 13, fontWeight: 600, color: "#1a202c", marginBottom: "2px", lineHeight: 1.2 },
  subinfo: { fontSize: 11, color: "#666", marginBottom: "4px" },
  local: { fontSize: 11, color: "#444", display: "flex", alignItems: "center", gap: "5px", marginBottom: "5px" },
  footer: { display: "flex", justifyContent: "space-between", fontSize: 11, alignItems: "center" },
  botao: {
    width: "100%",
    marginTop: "8px",
    padding: "8px",
    background: "#1a202c",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
    letterSpacing: "0.5px"
  }
};

export default ExumacaoCard;