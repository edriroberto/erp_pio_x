import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../utils/supabaseClient";
import { useIsMobile } from "../Hooks/useMobile";
import { formatarData } from "../utils/formatarData";

import ContainerPagina from "../components/ContainerPagina";
import ContainerTabela from "../components/ContainerTabela";
import ExumacaoLogList from "../components/ExumacaoLogList";
import SepultamentoSearchBar from "../components/SepultamentoSearchBar";

import { gerarRelatorioExumacoes } from "../utils/relatorioPDF";
import { Trash2, Search, FileText } from "lucide-react";

import "../styles/tabela.css";

export default function RelatorioExumacoes() {
  const isMobile = useIsMobile();
  const [dados, setDados] = useState([]);
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("exumacoes")
        .select("*")
        .order("data_exumacao", { ascending: false });

      if (error) throw error;
      setDados(data || []);
    } catch (err) {
      console.error("Erro ao carregar:", err.message);
    } finally {
      setLoading(false);
    }
  }

  const dadosFiltrados = useMemo(() => {
    if (!dados) return [];
    if (!busca) return dados;

    const t = busca.toLowerCase();
    return dados.filter(item =>
      item.nome_falecido?.toLowerCase().includes(t) ||
      item.quadra_lote?.toLowerCase().includes(t) ||
      item.destino?.toLowerCase().includes(t)
    );
  }, [busca, dados]);

  const handleExcluir = async (item) => {
    const confirmou = window.confirm(`Deseja remover o registro de ${item.nome_falecido}?`);
    if (!confirmou) return;

    const { error } = await supabase.from("exumacoes").delete().eq("id", item.id);
    if (error) return alert("Erro ao excluir: " + error.message);

    setSelecionado(null);
    carregar();
  };

  const handleGerarPDF = () => {
    if (dadosFiltrados.length === 0) return alert("Não há dados para gerar o PDF");
    gerarRelatorioExumacoes(dadosFiltrados);
  };

  return (
    <ContainerPagina>
      {/* Cabeçalho de Busca - Paleta Jardim */}
      <div style={{
        ...styles.searchHeader,
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Search size={22} color="var(--jardim-primaria)" />
          <h2 style={{ 
            margin: 0, 
            fontSize: isMobile ? "18px" : "20px", 
            color: "var(--jardim-primaria)",
            fontWeight: "800" 
          }}>
            Histórico
          </h2>
        </div>

        <div style={{ flex: 1, maxWidth: isMobile ? "100%" : "400px" }}>
          <SepultamentoSearchBar onBuscar={setBusca} />
        </div>    

        <div style={styles.actions}>
          <span style={styles.count}>{dadosFiltrados.length} exumações</span>
          
          <button onClick={handleGerarPDF} style={styles.btnPdfPersonalizado}>
            <FileText size={16} /> PDF
          </button>

          {selecionado && (
            <button onClick={() => handleExcluir(selecionado)} style={styles.btnDelete}>
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ÁREA DE SCROLL GARANTIDA */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",      // Ativa o scroll vertical
        maxHeight: isMobile ? "calc(100vh - 250px)" : "600px", // Limite de altura
        WebkitOverflowScrolling: "touch", // Scroll suave no iPhone
        width: "100%",
        boxSizing: "border-box",
        paddingBottom: "80px"   // Espaço para não cobrir o último card
      }}>
        <ContainerTabela>
          {loading ? (
            <div style={styles.empty}>Carregando dados...</div>
          ) : dadosFiltrados.length === 0 ? (
            <div style={styles.empty}>Nenhum registro encontrado</div>
          ) : isMobile ? (
            <ExumacaoLogList
              dados={dadosFiltrados}
              selecionado={selecionado}
              onSelecionar={setSelecionado}
              formatarData={formatarData}
            />
          ) : (
            <table className="tabela">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Nome</th>
                  <th>Local</th>
                  <th>Destino</th>
                  <th>Responsável</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {dadosFiltrados.map((item) => {
                  const isSelected = selecionado?.id === item.id;
                  const isFam = item.destino?.includes("Família");
                  const isOss = item.destino?.includes("Ossário");

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelecionado(item)}
                      style={{
                        cursor: "pointer",
                        backgroundColor: isSelected 
                          ? "#f0fdf4" 
                          : isFam ? "#ebf2ea" : isOss ? "#fffbeb" : "transparent",
                        borderLeft: isSelected ? "4px solid var(--jardim-primaria)" : "none"
                      }}
                    >
                      <td>{formatarData(item.data_exumacao)}</td> 
                      <td style={{ fontWeight: 700, color: "var(--jardim-primaria)" }}>
                        {item.nome_falecido?.toUpperCase()}
                      </td>
                      <td>{item.quadra_lote || "—"}</td>
                      <td>
                        <span style={{
                          ...styles.badge,
                          background: isOss ? "#FEF3C7" : "#ebf2ea",
                          color: isOss ? "#92400E" : "#2d5a27",
                          border: `1px solid ${isOss ? "#FDE68A" : "#8ca67a"}`
                        }}>{item.destino}</span>
                      </td>
                      <td>{item.responsavel}</td>
                      <td>
                        <button onClick={(e) => { e.stopPropagation(); handleExcluir(item); }} style={styles.btnIcon}>
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </ContainerTabela>
      </div>
    </ContainerPagina>
  );
}

const styles = {
  searchHeader: { 
    borderRadius: '12px', 
    border: '1px solid #e2e8f0', 
    background: 'var(--jardim-pedra)', 
    padding: '12px 15px', 
    display: "flex", 
    justifyContent: "space-between", 
    gap: "12px", 
    marginBottom: "10px", 
    marginTop: "-5px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    boxSizing: "border-box"
  },
  actions: { 
    display: "flex", 
    alignItems: "center", 
    gap: "8px",
    justifyContent: "space-between" 
  },
  count: { 
    fontSize: "11px", 
    color: "var(--jardim-texto)", 
    fontWeight: "800",
    background: "#f1f5f9",
    padding: "4px 10px",
    borderRadius: "20px",
    textTransform: "uppercase"
  },
  btnPdfPersonalizado: { 
    display: "flex", 
    alignItems: "center", 
    gap: "6px", 
    padding: "8px 14px",
    background: "#991b1b", 
    color: "#fff", 
    border: "none", 
    borderRadius: "8px", 
    cursor: "pointer", 
    fontWeight: "700",
    fontSize: "13px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)" 
  },
  btnDelete: { 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center",
    width: "36px",
    height: "36px",
    background: "#fff5f5", 
    color: "#e53e3e", 
    border: "1px solid #feb2b2", 
    borderRadius: "8px", 
    cursor: "pointer" 
  },
  btnIcon: { background: "none", border: "none", cursor: "pointer", fontSize: "16px", opacity: 0.7 },
  badge: { 
    padding: "4px 12px", 
    borderRadius: "20px", 
    fontSize: "10px", 
    fontWeight: "800", 
    display: "inline-block",
    textTransform: "uppercase" 
  },
  empty: { textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: "14px", fontWeight: "500" }
};