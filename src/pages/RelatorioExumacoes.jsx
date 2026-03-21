import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../utils/supabaseClient";

import ContainerPagina from "../components/ContainerPagina";
import ContainerTabela from "../components/ContainerTabela";
import ExumacaoLogList from "../components/ExumacaoLogList";

import { gerarRelatorioExumacoes } from "../utils/relatorioPDF";

import { FileText, Trash2, Search } from "lucide-react";

import "../styles/tabela.css";

export default function RelatorioExumacoes() {
  const [dados, setDados] = useState([]);
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // ==============================
  // RESPONSIVO
  // ==============================
  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // ==============================
  // CARREGAR DADOS
  // ==============================
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

  // ==============================
  // FILTRO (MEMOIZADO)
  // ==============================
  const dadosFiltrados = useMemo(() => {
    if (!busca) return dados;

    const t = busca.toLowerCase();

    return dados.filter(item =>
      item.nome_falecido?.toLowerCase().includes(t) ||
      item.quadra_lote?.toLowerCase().includes(t) ||
      item.destino?.toLowerCase().includes(t)
    );
  }, [busca, dados]);

  // ==============================
  // FORMATAÇÕES
  // ==============================


  const formatarData = (dataISO) => {
    if (!dataISO) return "—";
    const data = new Date(dataISO);
  if (isNaN(data)) return "";
    return data.toLocaleDateString("pt-BR");
  };
  // ==============================
  // AÇÕES
  // ==============================
  const handleExcluir = async (item) => {
    const confirmou = window.confirm(
      `Deseja remover o registro de ${item.nome_falecido}?`
    );
    if (!confirmou) return;

    const { error } = await supabase
      .from("exumacoes")
      .delete()
      .eq("id", item.id);

    if (error) return alert("Erro ao excluir: " + error.message);

    setSelecionado(null);
    carregar();
  };

  const handleGerarPDF = () => {
    if (dadosFiltrados.length === 0) {
      return alert("Não há dados para gerar o PDF");
    }

    gerarRelatorioExumacoes(dadosFiltrados);
  };

  // ==============================
  // RENDER
  // ==============================
  return (
    <ContainerPagina titulo="Histórico de Exumações">

      {/* HEADER */}
      <div style={styles.header}>
        
        <div style={styles.searchBox}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar por nome, local ou destino..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.actions}>
          <span style={styles.count}>
            {dadosFiltrados.length} registros
          </span>

          <button onClick={handleGerarPDF} style={styles.btnPdf}>
            <FileText size={16} />
            PDF
          </button>

          {selecionado && (
            <button
              onClick={() => handleExcluir(selecionado)}
              style={styles.btnDelete}
            >
              <Trash2 size={16} />
              Excluir
            </button>
          )}
        </div>
      </div>

      {/* TABELA */}
      <ContainerTabela>

        {loading ? (
          <div style={styles.empty}>Carregando dados...</div>
        ) : dadosFiltrados.length === 0 ? (
          <div style={styles.empty}>
            Nenhum registro encontrado
          </div>
        ) : isMobile ? (

          <div style={{ paddingBottom: 20 }}>
            <ExumacaoLogList
              dados={dadosFiltrados}
              selecionado={selecionado}
              onSelecionar={setSelecionado}
              formatarData={formatarData}
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
                      backgroundColor:
                        isSelected
                          ? "#ebf8ff"
                          : isFam
                          ? "#e6fffa"
                          : isOss
                          ? "#fffaf0"
                          : "transparent",
                    }}
                  >
                    <td>{formatarData(item.data_exumacao)}</td>

                    <td style={{ fontWeight: 600 }}>
                      {item.nome_falecido}
                    </td>

                    <td>{item.quadra_lote || "—"}</td>

                    <td>
                      <span
                        style={{
                          ...styles.badge,
                          background: isOss ? "#fbd38d" : "#b2f5ea",
                          color: isOss ? "#744210" : "#234e52",
                        }}
                      >
                        {item.destino}
                      </span>
                    </td>

                    <td>{item.responsavel}</td>

                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExcluir(item);
                        }}
                        style={styles.btnIcon}
                      >
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
    </ContainerPagina>
  );
}

// ==============================
// ESTILOS
// ==============================
const styles = {
  header: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "-8px",
    marginTop: "-5px"
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "8px 12px"
  },

  input: {
    border: "none",
    outline: "none",
    fontSize: "14px"
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },

  count: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: 600
  },

  btnPdf: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600
  },

  btnDelete: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    background: "#fff5f5",
    color: "#e53e3e",
    border: "1px solid #feb2b2",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600
  },

  btnIcon: {
    background: "none",
    border: "none",
    cursor: "pointer"
  },

  badge: {
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "bold"
  },

  empty: {
    textAlign: "center",
    padding: "30px",
    color: "#94a3b8"
  }
};