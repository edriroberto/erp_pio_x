import React from "react";
import { useIsMobile } from "../Hooks/useMobile";

export default function ExumacaoLogList({ dados, selecionado, onSelecionar, formatarData }) {
  const isMobile = useIsMobile();

  // Estilo do Card baseado na Paleta Jardim
  const getCardStyle = (destino, isSelected) => {
    let borderSideColor = "var(--jardim-acento)"; // Verde Oliva padrão
    
    if (destino?.includes("Família")) {
      borderSideColor = "var(--jardim-primaria)"; // Verde Musgo
    } else if (destino?.includes("Ossário")) {
      borderSideColor = "#d97706"; // Âmbar/Terra
    }

    return {
      padding: "12px 15px",
      borderRadius: isMobile ? "0px" : "12px",
      marginBottom: "8px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      backgroundColor: isSelected ? "#f0fdf4" : "var(--jardim-pedra)",
      border: isSelected ? "1px solid var(--jardim-primaria)" : "1px solid #e2e8f0",
      borderLeft: `5px solid ${borderSideColor}`,
      boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
      width: "100%",
      boxSizing: "border-box" // Impede o card de passar do fundo verde
    };
  };

  // Badges Modernas (Pill) com tons Botânicos
  const getBadgeStyle = (destino) => {
    const isOssario = destino?.includes("Ossário");
    const theme = isOssario 
      ? { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" } // Terra
      : { bg: "#ebf2ea", text: "#2d5a27", border: "#8ca67a" }; // Jardim

    return {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "4px 12px",
      borderRadius: "999px",
      fontSize: "10px",
      fontWeight: "800",
      letterSpacing: "0.3px",
      background: theme.bg,
      color: theme.text,
      textTransform: "uppercase",
      whiteSpace: "nowrap",
      border: `1px solid ${theme.border}`
    };
  };

  return (
    <div style={{ padding: isMobile ? "0px" : "10px 5px" }}>
      {dados.map((item) => {
        const isSelected = selecionado?.id === item.id;

        return (
          <div
            key={item.id}
            onClick={() => onSelecionar(item)}
            style={getCardStyle(item.destino, isSelected)}
          >
            {/* Linha do Nome - Verde Musgo Profundo */}
            <div style={styles.header}>
              <span style={{ ...styles.nome, color: "var(--jardim-primaria)" }}>
                {item.nome_falecido?.toUpperCase()}
              </span>
            </div>

            {/* Linha de Info Original */}
            <div style={styles.infoRow}>
              <span style={styles.valor}>
                <span style={styles.label}>Local:</span> {item.quadra_lote || "S/L"}
              </span>
            </div>

            {/* Badge de Destino Centralizada */}
            <div style={styles.badgeContainer}>
              <span style={getBadgeStyle(item.destino)}>
                DESTINO: {item.destino}
              </span>
            </div>

            {/* Rodapé: Exumador e Data */}
            <div style={styles.footer}>
              <span style={styles.valor}>
                <span style={styles.label}>Por:</span> {item.responsavel}
              </span>
              <span style={styles.data}>
                {formatarData(item.data_exumacao)}
              </span>
            </div>

            {/* Observações */}
            {item.obs_extras && (
              <div style={styles.obsBox}>
                "{item.obs_extras}"
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  header: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "flex-start",
    marginBottom: "2px"
  },
  nome: { 
    fontWeight: "800", 
    fontSize: "13px", 
    flex: 1,
    lineHeight: "1.2"
  },
  infoRow: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  label: { 
    fontSize: "10px", 
    color: "#718096", 
    fontWeight: "700",
    textTransform: "uppercase",
    marginRight: "4px"
  },
  valor: { 
    fontSize: "12px", 
    color: "#2d3748", 
    fontWeight: "600" 
  },
  badgeContainer: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    margin: "4px 0"
  },
  footer: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center",
    borderTop: "1px solid #edf2f7",
    paddingTop: "4px",
    marginTop: "2px"
  },
  data: { 
    fontSize: "11px", 
    fontWeight: "800", 
    color: "var(--jardim-acento)" 
  },
  obsBox: {
    marginTop: "6px",
    padding: "6px 10px",
    background: "#f8fafc",
    borderRadius: "6px",
    fontSize: "11px",
    fontStyle: "italic",
    color: "#4a5568",
    borderLeft: "3px solid #cbd5e0"
  }
};