import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

// Componentes do Sistema
import ContainerPagina from "../components/ContainerPagina";
import ContainerTabela from "../components/ContainerTabela";
import ExumacaoLogList from "../components/ExumacaoLogList"; 

// Estilos
import "../styles/tabela.css";

export default function RelatorioExumacoes() {
  const [dados, setDados] = useState([]);
  const [dadosFiltrados, setDadosFiltrados] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [busca, setBusca] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(true);

  // --- CONTROLE DE RESPONSIVIDADE ---
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- CARGA E FILTRO DE DADOS ---
  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    executarBusca();
  }, [busca, dados]);

  async function carregar() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("exumacoes")
        .select("*")
        .order("data_exumacao", { ascending: false });

      if (error) throw error;
      setDados(data || []);
    } catch (error) {
      console.error("Erro ao carregar:", error.message);
    } finally {
      setLoading(false);
    }
  }

  function executarBusca() {
    if (!busca) {
      setDadosFiltrados(dados);
      return;
    }
    const t = busca.toLowerCase();
    const filtrado = dados.filter(item =>
      item.nome_falecido?.toLowerCase().includes(t) ||
      item.quadra_lote?.toLowerCase().includes(t) ||
      item.destino?.toLowerCase().includes(t)
    );
    setDadosFiltrados(filtrado);
  }

  const formatarData = (dataISO) => {
    if (!dataISO) return "—";
    const partes = dataISO.split("-");
    if (partes.length < 3) return dataISO;
    return `${partes[2].substring(0,2)}/${partes[1]}/${partes[0]}`;
  };

  // --- AÇÃO DE EXCLUSÃO (DISPARADA AO SELECIONAR OU BOTÃO AUXILIAR) ---
  const handleExcluir = async (item) => {
    const confirmou = window.confirm(`Deseja remover o registro de exumação de ${item.nome_falecido}?`);
    if (!confirmou) return;

    const { error } = await supabase.from("exumacoes").delete().eq("id", item.id);
    if (error) return alert("Erro ao excluir: " + error.message);

    setSelecionado(null);
    carregar();
  };

  return (
    <ContainerPagina titulo="Histórico de Exumações">
      
      {/* HEADER DE BUSCA (Padrão SepultamentosPorNome) */}
      <div className="header-busca" style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "15px",
        marginBottom: "-5px",
        marginTop: "-5px"
      }}>
        <input
          type="text"
          placeholder="BUSCAR POR NOME OU DESTINO..."
          value={busca}
          onChange={(e) => setBusca(e.target.value.toUpperCase())}
          style={{ 
            padding: "12px", 
            width: isMobile ? "100%" : "350px", 
            borderRadius: "8px", 
            border: "1px solid #e2e8f0", 
            fontSize: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}
        />
        
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
           <span style={{ 
            fontSize: 14, 
            color: "#718096", 
            fontWeight: 500 ,
            marginTop: "-10px",
            
            }}>
            {dadosFiltrados.length} registros
          </span>
          {selecionado && (
            <button 
              onClick={() => handleExcluir(selecionado)}
              style={{
                padding: "8px 15px",
                backgroundColor: "#fff5f5",
                color: "#e53e3e",
                border: "1px solid #feb2b2",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px"
              }}
            >
              EXCLUIR SELECIONADO
            </button>
          )}
        </div>
      </div>

      <ContainerTabela>
        {loading ? (
          <p style={{ textAlign: "center", padding: "20px", color: "#718096" }}>Carregando histórico...</p>
        ) : isMobile ? (
          <div style={{ paddingBottom: "20px" }}>
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
                <th>Nome do Falecido</th>
                <th>Local Original</th>
                <th>Destino</th>
                <th>Responsável</th>
                <th>Ações</th>
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
                    <td>{formatarData(item.data_exumacao)}</td>
                    <td style={{ fontWeight: "600", color: "#2d3748" }}>{item.nome_falecido}</td>
                    <td>{item.quadra_lote || "—"}</td>
                    <td>
                      <span style={{
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        background: isOss ? "#fbd38d" : "#b2f5ea",
                        color: isOss ? "#744210" : "#234e52",
                      }}>
                        {item.destino}
                      </span>
                    </td>
                    <td>{item.responsavel}</td>
                    <td>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleExcluir(item); }}
                        style={{ background: "none", border: "none", color: "#e53e3e", cursor: "pointer", fontSize: "16px" }}
                        title="Excluir Registro"
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

        {!loading && dadosFiltrados.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#a0aec0" }}>
            Nenhum registro encontrado para "{busca}".
          </div>
        )}
      </ContainerTabela>
    </ContainerPagina>
  );
}