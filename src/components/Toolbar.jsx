import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Search, Filter } from "lucide-react";

export default function Toolbar({
  onInserir,
  onEditar,
  onExcluir,
  onFiltrar,
  itemSelecionado,
  mostrarFiltro = true,
  fixa = false
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const temSelecao = !!itemSelecionado;

  // Listener para detectar mudança de tela
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{
      ...styles.container,
      position: fixa ? "sticky" : "relative",
      boxShadow: fixa ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
    }}>
      
      {mostrarFiltro && (
        <button onClick={onFiltrar} style={styles.btnSecondary}>
          <Filter size={18} />
          {!isMobile && "Filtrar"}
        </button>
      )}

      {/* Divisor Visual */}
      <div style={styles.divider} />

      <button onClick={onInserir} style={styles.btnPrimary}>
        <Plus size={18} strokeWidth={2.5} />
        {!isMobile && "Inserir"}
      </button>

      <button
        onClick={onEditar}
        disabled={!temSelecao}
        style={{
          ...styles.btnAction,
          backgroundColor: temSelecao ? "#3b82f6" : "#f1f5f9",
          color: temSelecao ? "white" : "#cbd5e1",
        }}
      >
        <Edit3 size={18} />
        {!isMobile && "Editar"}
      </button>

      <button
        onClick={onExcluir}
        disabled={!temSelecao}
        style={{
          ...styles.btnAction,
          backgroundColor: temSelecao ? "#ef4444" : "#f1f5f9",
          color: temSelecao ? "white" : "#cbd5e1",
        }}
      >
        <Trash2 size={18} />
        {!isMobile && "Excluir"}
      </button>
      
      {/* Padding extra no final para o scroll lateral não cortar o último botão */}
      <div style={{ minWidth: "16px" }} />
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    gap: "10px",
    background: "#ffffff",
    padding: "10px 16px",
    borderBottom: "1px solid #e2e8f0",
    top: 0,
    zIndex: 100,
    alignItems: "center",
    // --- MAGIA DO MOBILE 2026 ---
    overflowX: "auto",             // Permite scroll lateral
    whiteSpace: "nowrap",          // Impede quebra de linha
    scrollbarWidth: "none",        // Esconde barra no Firefox
    WebkitOverflowScrolling: "touch" // Scroll suave no iOS
  },
  divider: {
    width: "1px",
    height: "24px",
    background: "#e2e8f0",
    flexShrink: 0
  },
  btnBase: {
    border: "none",
    height: "42px",                // Altura otimizada para toque (Touch Target)
    padding: "0 14px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    flexShrink: 0,                 // Impede que o botão "esmague" no flexbox
    transition: "all 0.2s ease",
    cursor: "pointer",
    outline: "none"
  },
  get btnPrimary() {
    return { ...this.btnBase, backgroundColor: "#1e293b", color: "white" };
  },
  get btnSecondary() {
    return { ...this.btnBase, backgroundColor: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0" };
  },
  get btnAction() {
    return { ...this.btnBase };
  }
};