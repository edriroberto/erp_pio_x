import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../utils/supabaseClient";
import { useIsMobile } from "../Hooks/useMobile";
import { formatarData } from "../utils/formatarData"; // Importação adicionada

import ContainerPagina from "../components/ContainerPagina";
import ContainerTabela from "../components/ContainerTabela";
import ExumacaoLogList from "../components/ExumacaoLogList";
import SepultamentoSearchBar from "../components/SepultamentoSearchBar";

import { gerarRelatorioExumacoes } from "../utils/relatorioPDF";
import { Trash2, Search } from "lucide-react";

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

  // AÇÕES
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
      <div style={{
        ...styles.searchHeader,
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Search size={24} color="#4fd1c5" />
          <h2 style={{ margin: 0, fontSize: "20px" }}>Histórico de Exumações</h2>
        </div>

        <div style={{ flex: 1, maxWidth: isMobile ? "100%" : "450px" }}>
          <SepultamentoSearchBar onBuscar={setBusca} />
        </div>    

        <div style={styles.actions}>
          <span style={styles.count}>{dadosFiltrados.length} registros</span>
          <button onClick={handleGerarPDF} style={{
            ...styles.btnPdfPersonalizado,
            padding: isMobile ? "6px 12px" : "10px 18px",
            fontSize: isMobile ? "12px" : "14px",
          }}>📄 PDF</button>

          {selecionado && (
            <button onClick={() => handleExcluir(selecionado)} style={styles.btnDelete}>
              <Trash2 size={16} /> Excluir
            </button>
          )}
        </div>
      </div>
<div style={{
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  maxHeight: '400px'
}}>

      <ContainerTabela>
        {loading ? (
          <div style={styles.empty}>Carregando dados...</div>
        ) : dadosFiltrados.length === 0 ? (
          <div style={styles.empty}>Nenhum registro encontrado</div>
        ) : isMobile ? (
          <div style={{ paddingBottom: 20 }}>
            <ExumacaoLogList
              dados={dadosFiltrados}
              selecionado={selecionado}
              onSelecionar={setSelecionado}
              formatarData={formatarData} // Passando a função do seu utilitário
            />
          </div>
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
                      backgroundColor: isSelected ? "#ebf8ff" : isFam ? "#e6fffa" : isOss ? "#fffaf0" : "transparent",
                    }}
                  >
                    {/* AQUI: Usando o seu formatarData.js */}
                    <td>{formatarData(item.data_exumacao)}</td> 
                    <td style={{ fontWeight: 600 }}>{item.nome_falecido}</td>
                    <td>{item.quadra_lote || "—"}</td>
                    <td>
                      <span style={{
                        ...styles.badge,
                        background: isOss ? "#fbd38d" : "#b2f5ea",
                        color: isOss ? "#744210" : "#234e52",
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
  searchHeader: { borderRadius: '6px', border: '1px solid #cbd5e0', background: '#ffffff', padding: '10px', display: "flex", flexWrap: 'wrap', justifyContent: "space-between", gap: "10px", marginBottom: "15px", marginTop: "-10px" },
  actions: { display: "flex", alignItems: "center", gap: "10px" },
  count: { fontSize: 13, color: "#64748b", fontWeight: 600 },
  btnPdfPersonalizado: { display: "flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" },
  btnDelete: { display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: "#fff5f5", color: "#e53e3e", border: "1px solid #feb2b2", borderRadius: "6px", cursor: "pointer", fontSize: 13, fontWeight: 600 },
  btnIcon: { background: "none", border: "none", cursor: "pointer", fontSize: "16px" },
  badge: { padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold", display: "inline-block" },
  empty: { textAlign: "center", padding: "30px", color: "#94a3b8" }
};