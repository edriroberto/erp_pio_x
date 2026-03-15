import React from "react";

export default function Toolbar({ onInserir, onEditar, onExcluir, onFiltrar, itemSelecionado }) {
  // Verificamos se tem algo selecionado para habilitar/desabilitar botões de ação
  const temSelecao = !!itemSelecionado;

  return (
    <div style={{
      display: "flex",
      gap: "10px",
      marginBottom: "20px",
      marginTop: "20px",
      flexWrap: "wrap",
      background: "#f8fafc", // Fundo leve para destacar a barra
      padding: "15px",
      borderRadius: "8px",
      border: "1px solid #e2e8f0"
    }}>
      <button onClick={onFiltrar} className="btn-toolbar" style={btnStyle}>
        🔍 Filtrar
      </button>
      
      <button 
        onClick={onInserir} 
        style={{ ...btnStyle, backgroundColor: "#2c3e50", color: "white" }}
      >
        ➕ Inserir
      </button>

      <button 
        onClick={onEditar} 
        disabled={!temSelecao}
        style={{ 
          ...btnStyle, 
          backgroundColor: temSelecao ? "#3498db" : "#cbd5e0", 
          color: "white",
          cursor: temSelecao ? "pointer" : "not-allowed"
        }}
      >
        📝 Editar
      </button>
            
      <button 
        onClick={onExcluir}
        disabled={!temSelecao}
        style={{ 
          ...btnStyle, 
          background: temSelecao ? "#e74c3c" : "#cbd5e0", 
          color: "white",
          cursor: temSelecao ? "pointer" : "not-allowed"
        }}
      >
        🗑️ Excluir
      </button>
    </div>
  );
}

// Estilo base para os botões (como uma classe CSS interna)
const btnStyle = {
  border: "none",
  padding: "10px 20px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
  transition: "all 0.2s ease"
};