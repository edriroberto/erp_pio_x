import React from "react";

export default function Toolbar({
  onInserir,
  onEditar,
  onExcluir,
  onFiltrar,
  itemSelecionado,
  mostrarFiltro = true,
  fixa = false
}) {

  const temSelecao = !!itemSelecionado;

  return (

    <div style={{
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
      background: "#ffffff",
      padding: "10px",
      borderBottom: "1px solid #e2e8f0",
      boxShadow: fixa ? "0 2px 6px rgba(0,0,0,0.08)" : "none",

      position: fixa ? "sticky" : "relative",
      top: fixa ? 0 : "auto",
      zIndex: 100
    }}>

      {mostrarFiltro && (
        <button onClick={onFiltrar} style={btnStyle}>
          🔍 Filtrar
        </button>
      )}

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
          color: "white"
        }}
      >
        📝 Editar
      </button>

      <button
        onClick={onExcluir}
        disabled={!temSelecao}
        style={{
          ...btnStyle,
          backgroundColor: temSelecao ? "#e74c3c" : "#cbd5e0",
          color: "white"
        }}
      >
        🗑️ Excluir
      </button>

    </div>
  );
}

const btnStyle = {
  border: "none",
  padding: "8px 16px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "13px"
};