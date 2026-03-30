import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Filter, Loader2 } from "lucide-react";
import { useAuth } from "../Hooks/useAuth";

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
  const { perfil, loading } = useAuth(); // Hook de permissões
  
  const temSelecao = !!itemSelecionado;

  // Lógica de Permissões baseada no banco de dados
  const podeEscrever = perfil?.nivel === 'master' || perfil?.nivel === 'admin';
  const podeExcluir = perfil?.nivel === 'master';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Enquanto as permissões carregam, mostramos um estado neutro (esqueleto)
  if (loading) {
    return (
      <div style={{ ...styles.container, justifyContent: 'center', opacity: 0.6 }}>
        <Loader2 size={16} className="animate-spin" />
        <span style={{ fontSize: '12px', marginLeft: '8px' }}>Validando acessos...</span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .toolbar-scroll::-webkit-scrollbar { display: none; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div 
        className="toolbar-scroll"
        style={{
          ...styles.container,
          position: fixa ? "sticky" : "relative",
          boxShadow: fixa ? "0 4px 12px rgba(0,0,0,0.03)" : "none",
        }}
      >
        {/* BOTÃO FILTRAR: Visível para todos os níveis */}
        {mostrarFiltro && (
          <button onClick={onFiltrar} style={styles.btnSecondary} title="Filtrar">
            <Filter size={16} strokeWidth={1.5} />
            {!isMobile && "Filtrar"}
          </button>
        )}

        {/* ÁREA DE ESCRITA: Apenas Master e Admin */}
        {podeEscrever && (
          <>
            {mostrarFiltro && <div style={styles.divider} />}

            <button onClick={onInserir} style={styles.btnPrimary} title="Inserir Novo">
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
                color: temSelecao ? "white" : "#94a3b8",
                cursor: temSelecao ? "pointer" : "not-allowed",
              }}
            >
              <Pencil size={16} strokeWidth={temSelecao ? 2 : 1.5} />
              {!isMobile && "Editar"}
            </button>
          </>
        )}

        {/* BOTÃO EXCLUIR: Exclusivo para nível Master */}
        {podeExcluir && (
          <button
            onClick={onExcluir}
            disabled={!temSelecao}
            title="Excluir Selecionado"
            style={{
              ...styles.btnAction,
              backgroundColor: temSelecao ? "#ef4444" : "#f1f5f9",
              color: temSelecao ? "white" : "#94a3b8",
              cursor: temSelecao ? "pointer" : "not-allowed",
              marginLeft: podeEscrever ? '0' : '8px' 
            }}
          >
            <Trash2 size={16} strokeWidth={temSelecao ? 2 : 1.5} />
            {!isMobile && "Excluir"}
          </button>
        )}
        
        <div style={{ minWidth: isMobile ? "16px" : "0px", height: "1px" }} />
      </div>
    </>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    background: "#ffffff",
    top: 0,
    zIndex: 100,
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    transition: "all 0.2s ease-in-out",
    overflowX: "auto",
    whiteSpace: "nowrap",
    flexWrap: "nowrap",
    scrollbarWidth: "none",
    WebkitOverflowScrolling: "touch",
  },
  divider: {
    width: "1px",
    height: "20px",
    background: "#e2e8f0",
    flexShrink: 0,
    margin: "0 2px"
  },
  btnBase: {
    border: "none",
    height: "36px", 
    padding: "0 12px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "13px", 
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    flexShrink: 0,
    transition: "all 0.2s ease",
    outline: "none",
    letterSpacing: "-0.2px"
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