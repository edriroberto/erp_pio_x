import React, { useState, useEffect } from "react";
// Importamos ícones ligeiramente diferentes para um visual mais 'clean'
import { Plus, Pencil, Trash2, Filter, Search } from "lucide-react";

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
        .toolbar-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <div 
        className="toolbar-scroll"
        style={{
          ...styles.container,
          position: fixa ? "sticky" : "relative",
          // Sombra mais suave para 2026
          boxShadow: fixa ? "0 4px 12px rgba(0,0,0,0.03)" : "none",
        }}
      >
        {mostrarFiltro && (
          <button onClick={onFiltrar} style={styles.btnSecondary} title="Filtrar">
            {/* Ícone menor (16px) e com traço mais fino */}
            <Filter size={16} strokeWidth={1.5} />
            {!isMobile && "Filtrar"}
          </button>
        )}

        {mostrarFiltro && <div style={styles.divider} />}

        <button onClick={onInserir} style={styles.btnPrimary} title="Inserir Novo">
          {/* Usamos Plus puro, sem traço extra grosso */}
          <Plus size={18} strokeWidth={2} />
          {!isMobile && "Inserir"}
        </button>

        <button
          onClick={onEditar}
          disabled={!temSelecao}
          title="Editar Selecionado"
          style={{
            ...styles.btnAction,
            backgroundColor: temSelecao ? "#3b82f6" : "#f1f5f9",
            color: temSelecao ? "white" : "#94a3b8", // Cinza mais suave quando desativado
            cursor: temSelecao ? "pointer" : "not-allowed",
          }}
        >
          {/* Trocamos Edit3 por Pencil para um traço mais simples */}
          <Pencil size={16} strokeWidth={temSelecao ? 2 : 1.5} />
          {!isMobile && "Editar"}
        </button>

        <button
          onClick={onExcluir}
          disabled={!temSelecao}
          title="Excluir Selecionado"
          style={{
            ...styles.btnAction,
            backgroundColor: temSelecao ? "#ef4444" : "#f1f5f9",
            color: temSelecao ? "white" : "#94a3b8",
            cursor: temSelecao ? "pointer" : "not-allowed",
          }}
        >
          {/* Trash2 mantido, mas com traço fino */}
          <Trash2 size={16} strokeWidth={temSelecao ? 2 : 1.5} />
          {!isMobile && "Excluir"}
        </button>
        
        {/* Spacer final dinâmico para o scroll lateral */}
        <div style={{ minWidth: isMobile ? "16px" : "0px", height: "1px" }} />
      </div>
    </>
  );
}

// ==========================================================
// ESTILOS REFATORADOS PARA PROPORÇÃO E HARMONIA (PADRÃO 2026)
// ==========================================================
const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "8px", // Gap reduzido para maior densidade visual
    padding: "8px 12px", // Padding reduzido no topo/baixo
    background: "#ffffff",
    top: 0,
    zIndex: 100,
    border: "1px solid #e2e8f0",
    borderRadius: "12px", // Bordas suaves, mas não circulares
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
    height: "20px", // Divisor mais curto para não grudar nas bordas
    background: "#e2e8f0",
    flexShrink: 0,
    margin: "0 2px" // Margem interna do divisor reduzida
  },
  btnBase: {
    border: "none",
    // ALTURA OTIMIZADA: 36px é o equilíbrio entre densidade visual e touch target
    height: "36px", 
    padding: "0 12px", // Padding lateral reduzido
    borderRadius: "8px",
    fontWeight: "600",
    // FONTE NÃO GIGANTE: 13px é o padrão de leitura para labels de botões
    fontSize: "13px", 
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px", // Espaço ícone-texto reduzido
    flexShrink: 0, // Fundamental para o scroll não esmagar o botão
    transition: "all 0.2s ease",
    outline: "none",
    letterSpacing: "-0.2px" // Tipografia mais compacta
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