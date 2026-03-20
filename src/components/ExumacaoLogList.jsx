import React from "react";

export default function ExumacaoLogList({ dados, selecionado, onSelecionar, formatarData }) {
  
  // Define a cor de fundo do card inteiro baseada no destino
  const getCardStyle = (destino, isSelected) => {
    let backgroundColor = "#fff";
    
    if (destino?.includes("Família")) {
      backgroundColor = "#e6fffa"; // Verde claro
    } else if (destino?.includes("Ossário")) {
      backgroundColor = "#fffaf0"; // Amarelo claro
    }

    return {
      padding: "16px",
      borderRadius: "12px",
      marginBottom: "12px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      backgroundColor: isSelected ? "#ebf8ff" : backgroundColor,
      border: isSelected ? "2px solid #3182ce" : "1px solid #e2e8f0",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
    };
  };

  // Restaura o estilo de Badge (Etiqueta) para o destino
  const getBadgeStyle = (destino) => {
  const isOssario = destino?.includes("Ossário");
  
  // Cores Modernas 2026 (Pastéis com alto contraste de texto)
  const theme = isOssario 
    ? { bg: "#FEF3C7", text: "#92400E" } // Amber/Amarelo suave
    : { bg: "#CCFBEF", text: "#134E4A" }; // Teal/Verde água suave

  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 16px",
    borderRadius: "999px", // Garante o formato de pílula (Pill)
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.5px", // Toque moderno de design
    background: theme.bg,
    color: theme.text,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    border: `1px solid ${isOssario ? "#FDE68A" : "#99F6E4"}`, // Borda sutil para definir o shape
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
  };
};

  return (
    <div style={{ padding: "10px 5px" }}>
      {dados.map((item) => {
        const isSelected = selecionado?.id === item.id;

        return (
          <div
            key={item.id}
            onClick={() => onSelecionar(item)}
            style={getCardStyle(item.destino, isSelected)}
          >
            <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "flex-start",
                marginTop: "-10px",
                marginBottom: "-5px" }}>
              <span style={{ fontWeight: "800", color: "#2d3748", fontSize: "12px", flex: 1, marginBottom: "5px" }}>
                {item.nome_falecido}
              </span>
            </div>

            <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "6px",
                marginTop: "-10px"
                 }}>
              <div style={styles.infoRow}>
                <span style={styles.valor}>Local Original: {item.quadra_lote || "Não inf."}</span>
              </div>

              <div style={{
                        display: "flex",          // Ativa o modo flexível
                        justifyContent: "center", // Centraliza horizontalmente o conteúdo
                        alignItems: "center",     // Garante alinhamento vertical se necessário
                        width: "100%",            // Ocupa toda a largura do card
                        marginTop: "2px",        // Espaçamento em relação ao dado anterior
                        marginBottom: "2px"       // Espaçamento em relação à borda inferior do card
                        }}>
                        <span style={getBadgeStyle(item.destino)}>
                            DESTINO: {item.destino}
                        </span>
                    </div>

                <div style={styles.infoRow}>
                    
                    <span style={styles.valor}>Exumador: {item.responsavel}</span>
              <span style={{ fontSize: "11px", fontWeight: "bold", color: "#718096", marginLeft: "10px" }}>
                {formatarData(item.data_exumacao)}
              </span>

                </div>

            </div>

            <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "6px",
                marginTop: "-15px"
                 }}>
            {item.obs_extras && (
              <div style={styles.obsBox}>
                "{item.obs_extras}"
              </div>
            )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: "10px", color: "#718096", fontWeight: "700" },
  valor: { fontSize: "13px", color: "#2d3748", fontWeight: "500" },
  obsBox: {
    marginTop: "5px",
    padding: "8px",
    background: "rgba(255,255,255,0.4)",
    borderRadius: "6px",
    fontSize: "11px",
    fontStyle: "italic",
    color: "#4a5568",
    borderLeft: "3px solid #cbd5e0"
  }
};