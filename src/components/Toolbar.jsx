import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Filter } from "lucide-react";

export default function Toolbar({
  onInserir,
  onEditar,
  onExcluir,
  onFiltrar,
  itemSelecionado,
  mostrarFiltro = true,
  fixa = false
}) {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= 768 : false);
  const temSelecao = !!itemSelecionado;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Estilo Global para esconder a scrollbar no Chrome/Safari */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <div 
        className="hide-scrollbar"
        style={{
          ...styles.container,
          position: fixa ? "sticky" : "relative",
          boxShadow: fixa ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
        }}
      >
        {mostrarFiltro && (
          <button onClick={onFiltrar} style={styles.btnSecondary} title="Filtrar">
            <Filter size={18} />
            {!isMobile && "Filtrar"}
          </button>
        )}

        {mostrarFiltro && <div style={styles.divider} />}

        <button onClick={onInserir} style={styles.btnPrimary} title="Inserir Novo">
          <Plus size={18} strokeWidth={2.5} />
          {!isMobile && "Inserir"}
        </button>

        <button
          onClick={onEditar}
          disabled={!temSelecao}
          title="Editar Selecionado"
          style={{
            ...styles.btnAction,
            backgroundColor: temSelecao ? "#3b82f6" : "#f1f5f9",
            color: temSelecao ? "white" : "#cbd5e1",
            cursor: temSelecao ? "pointer" : "not-allowed",
          }}
        >
          <Edit3 size={18} />
          {!isMobile && "Editar"}
        </button>

        <button
          onClick={onExcluir}
          disabled={!temSelecao}
          title="Excluir Selecionado"
          style={{
            ...styles.btnAction,
            backgroundColor: temSelecao ? "#ef4444" : "#f1f5f9",
            color: temSelecao ? "white" : "#cbd5e1",
            cursor: temSelecao ? "pointer" : "not-allowed",
          }}
        >
          <Trash2 size={18} />
          {!isMobile && "Excluir"}
        </button>
        
        {/* Spacer final para garantir o respiro no scroll lateral */}
        <div style={{ minWidth: "16px", height: "1px" }} />
      </div>
    </>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 16px",
    background: "#ffffff",
    top: 0,
    zIndex: 100,
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    transition: "all 0.2s ease-in-out",
    
    // Configurações de Scroll (Mobile First)
    overflowX: "auto",
    whiteSpace: "nowrap",
    flexWrap: "nowrap",
    scrollbarWidth: "none", // Firefox
    WebkitOverflowScrolling: "touch",
  },
  divider: {
    width: "1px",
    height: "24px",
    background: "#e2e8f0",
    flexShrink: 0,
    margin: "0 4px"
  },
  btnBase: {
    border: "none",
    height: "40px",
    padding: "0 16px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    flexShrink: 0, // Fundamental para o scroll não esmagar o botão
    transition: "all 0.2s ease",
    outline: "none"
  },
  get btnPrimary() {
    return { ...this.btnBase, backgroundColor: "#1e293b", color: "white", cursor: "pointer" };
  },
  get btnSecondary() {
    return { ...this.btnBase, backgroundColor: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", cursor: "pointer" };
  },
  get btnAction() {
    return { ...this.btnBase };
  }
};