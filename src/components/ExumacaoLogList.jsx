import React from "react";
import { useIsMobile } from "../Hooks/useMobile";

export default function ExumacaoLogList({ dados, selecionado, onSelecionar, formatarData }) {
  const isMobile = useIsMobile();

  // Estilo do Card mais compacto (Estilo ExumacaoCard)
  const getCardStyle = (destino, isSelected) => {
    let borderSideColor = "var(--jardim-acento)"; 
    
    if (destino?.includes("Família")) {
      borderSideColor = "var(--jardim-primaria)"; 
    } else if (destino?.includes("Ossário")) {
      borderSideColor = "#d97706"; 
    }
  
    return {
      padding: "7px 10px",
      borderRadius: isMobile ? "0px" : "8px",
      marginBottom: "2px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      flexDirection: "column",
      gap: "1px", 
      backgroundColor: isSelected ? "#f0fdf4" : "var(--jardim-pedra)",
      border: isSelected ? "1px solid var(--jardim-primaria)" : "1px solid #e2e8f0",
      borderLeft: `4px solid ${borderSideColor}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
      width: "100%",
      boxSizing: "border-box"
    };
  };

  const getBadgeStyle = (destino) => {
    const isOssario = destino?.includes("Ossário");
    const theme = isOssario 
      ? { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" }
      : { bg: "#ebf2ea", text: "#2d5a27", border: "#8ca67a" };

    return {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2px 10px", // Badge mais fina
      borderRadius: "4px", // Menos arredondada para ocupar menos altura
      fontSize: "9px",     // Fonte menor
      fontWeight: "800",
      background: theme.bg,
      color: theme.text,
      textTransform: "uppercase",
      whiteSpace: "nowrap",
      border: `1px solid ${theme.border}`
    };
  };

  return (
    <div style={{ padding: isMobile ? "0px" : "5px" }}>
      {dados.map((item) => {
        const isSelected = selecionado?.id === item.id;

        return (
          <div
            key={item.id}
            onClick={() => onSelecionar(item)}
            style={getCardStyle(item.destino, isSelected)}
          >
            {/* Nome e Data na mesma linha para economizar espaço vertical */}
            <div style={styles.header}>
              <span style={{ ...styles.nome, color: "var(--jardim-primaria)" }}>
                {item.nome_falecido?.toUpperCase()}
              </span>
              <span style={styles.data}>
                {formatarData(item.data_exumacao)}
              </span>
            </div>

           {/* Local - Alinhado à esquerda */}
            <div style={styles.row}>
              <span style={styles.valor}>
                <span style={styles.label}>Local:</span> {item.quadra_lote || "S/L"}
              </span>
            </div>

            

            {/* Badge de Destino - Menor e alinhada à esquerda para não criar nova linha centralizada */}
            <div style={styles.badgeContainer}>
              <span style={getBadgeStyle(item.destino)}>
                {item.destino}
              </span>
            </div>

            {/* Responsável - Centralizado conforme solicitado */}
            <div style={{ ...styles.row, justifyContent: "center", marginTop: "2px" }}>
              <span style={styles.valor}>
                <span style={styles.label}>Retirado por:</span> {item.responsavel}
              </span>
            </div>
            
            {/* Observações mais discretas */}
            {item.obs_extras && (
              <div style={styles.obsBox}>
                {item.obs_extras}
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
    alignItems: "center", // Alinhado ao centro
    marginBottom: "0px"
  },
  nome: { 
    fontWeight: "800", 
    fontSize: "12px", // Reduzido de 13px
    flex: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    marginRight: "8px"
  },
  infoRow: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center",
    marginTop: "0px" ,
    marginBottom: "0px"
  },
  label: { 
    fontSize: "9px", 
    color: "#718096", 
    fontWeight: "700",
    textTransform: "uppercase"
  },
  valor: { 
    fontSize: "11px", 
    color: "#2d3748", 
    fontWeight: "600" 
  },
  badgeContainer: {
    display: "flex",
    justifyContent: "center", // Centralizado como antes
    width: "100%",
    margin: "0"
  },
  data: { 
    fontSize: "10px", 
    fontWeight: "800", 
    color: "var(--jardim-acento)" 
  },
  obsBox: {
    marginTop: "2px",
    padding: "4px 8px",
    background: "rgba(255,255,255,0.5)",
    borderRadius: "4px",
    fontSize: "10px",
    fontStyle: "italic",
    color: "#4a5568",
    borderLeft: "2px solid #cbd5e0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  }
};