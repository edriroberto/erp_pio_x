import { MapPin } from "lucide-react";

const ExumacaoCard = ({ dado, onConfirmar, formatarData }) => {

  const statusConfig = {
    VERMELHO: {
      cor: "#e53e3e",
      texto: "PRONTO PARA EXUMAR"
    },
    AMARELO: {
      cor: "#d69e2e",
      texto: "AVISO: 2 ANOS"
    },
    VERDE: {
      cor: "#38a169",
      texto: "DENTRO DO PRAZO"
    }
  };

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
      borderLeft: `3px solid ${config.cor}`, // 👈 destaque aqui
    }}>

      {/* TÍTULO */}
      <div style={{
        fontSize: 13,
        fontWeight: 600,
        color: "#1a202c",
        marginBottom: "2px",
        lineHeight: 1.2
      }}>
        {dado.nome}
      </div>

      {/* SUBINFO */}
      <div style={{
        fontSize: 11,
        color: "#666",
        marginBottom: "4px"
      }}>
        {dado.tipo_lote}
      </div>

      {/* LOCAL */}
      <div style={{
        fontSize: 11,
        color: "#444",
        display: "flex",
        alignItems: "center",
        gap: "5px",
        marginBottom: "5px"
      }}>
        <MapPin size={12} />
        <span>
          {dado.quadra} • {dado.lote}
          {dado.gaveta && ` • Pos. ${dado.gaveta}`}
        </span>
      </div>

      {/* DATA + STATUS */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 11,
        alignItems: "center"
      }}>
        <span style={{ color: "#555" }}>
          Sep: <strong>{formatarData(dado.data_sepultamento)}</strong>
        </span>

        <span style={{
          fontSize: 10,
          fontWeight: 700,
          color: config.cor
        }}>
          {config.texto}
        </span>
      </div>

      {/* BOTÃO */}
      {jaPodeExumar && (
        <button
          onClick={() => onConfirmar(dado)}
          style={{
            width: "100%",
            marginTop: "6px",
            padding: "6px",
            background: "#1a202c",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          CONFIRMAR
        </button>
      )}
    </div>
  );
};

export default ExumacaoCard;