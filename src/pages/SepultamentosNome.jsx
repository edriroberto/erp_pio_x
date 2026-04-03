import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { AlertCircle, UserSearch } from "lucide-react"; 

// Hooks e Componentes
import ContainerPagina from "../components/ContainerPagina";
import ContainerTabela from "../components/ContainerTabela";
import SepultamentoSearchBar from "../components/SepultamentoSearchBar";
import SepultamentoList from "../components/SepultamentoList"; // Componente padronizado

// Utilitários padronizados
import { formatarData, calcularIdade } from "../utils/formatarData";
import { useIsMobile } from "../Hooks/useMobile"; // Usando seu hook de mobile

import "../styles/tabela.css";

export default function SepultamentosPorNome() {
  const [busca, setBusca] = useState("");
  const [dados, setDados] = useState([]);
  const [selecionado, setSelecionado] = useState(null); // Estado para seleção
  const isMobile = useIsMobile();

  // Busca sempre que o termo de busca mudar
  useEffect(() => {
    buscar();
  }, [busca]);

  async function buscar() {
    try {
      let query = supabase.from("vw_sepultamentos_v1").select("*").order("nome");
      
      if (busca.trim() !== "") {
        query = query.ilike("nome", `%${busca}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        const dadosProcessados = data.map(s => ({
          ...s,
          // Mantendo a compatibilidade de nomes de campos entre as views/tabelas
          idade: s.idade || calcularIdade(s.data_nascimento, s.data_falecimento)
        }));
        setDados(dadosProcessados);
      }
    } catch (error) {
      console.error("Erro na busca:", error.message);
    }
  }

  return (
    <ContainerPagina>
      {/* HEADER DE BUSCA */}
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        gap: "15px",
        marginBottom: "20px",
        marginTop: "-10px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <UserSearch size={24} color="#4fd1c5" />
          <h2 style={{ margin: 0, fontSize: "22px", color: "#1a202c" }}>Consulta por Nome</h2>
        </div>

        <div style={{ flex: 1, maxWidth: isMobile ? "100%" : "450px" }}>
          <SepultamentoSearchBar onBuscar={setBusca} />
        </div>

        <div style={{ 
          fontSize: "13px", 
          color: "#64748b", 
          fontWeight: "600",
          background: "#f1f5f9",
          padding: "6px 12px",
          borderRadius: "20px",
          textAlign: "center"
        }}>
          {dados.length} registros
        </div>
      </div>

      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        height: "100%"
      }}>
        <ContainerTabela>
          {isMobile ? (
            /* Substituído pelo componente padronizado do Sepultamentos.jsx */
            <SepultamentoList
              dados={dados}
              selecionado={selecionado}
              onSelecionar={setSelecionado}
              formatarData={formatarData}
            />
          ) : (
            <table className="tabela">
              <thead>
                <tr>
                  <th style={{ width: 350 }}>Nome</th>
                  <th>Quadra</th>
                  <th>Lote</th>
                  <th>Vaga</th>
                  <th>Nascimento</th>
                  <th>Falecimento</th>
                  <th>Sepultamento</th>
                  <th style={{ textAlign: 'center' }}>Idade</th>
                  <th>Funerária</th>
                  <th>Observações</th>
                </tr>
              </thead>
              <tbody>
                {dados.map((s) => {
                  const selecionadoLinha = selecionado?.id === s.id;
                  const pendencia = s.obito_entregue === false;
                  
                  const bgRow = selecionadoLinha ? "#ebf8ff" : (pendencia ? "#fff5f5" : "transparent");
                  const textColor = selecionadoLinha ? "#2b6cb0" : (pendencia ? "#c53030" : "#1e293b");

                  return (
                    <tr 
                      key={s.id} 
                      onClick={() => setSelecionado(s)}
                      style={{ 
                        cursor: "pointer",
                        backgroundColor: bgRow,
                        color: textColor,
                        fontWeight: selecionadoLinha ? "600" : "400",
                        transition: "all 0.2s ease"
                      }}
                      className="linha-tabela"
                    >
                      <td style={{ fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                        {pendencia && <AlertCircle size={16} color="#ef4444" strokeWidth={2.5} />}
                        {s.nome}
                      </td>
                      <td>{s.quadra}</td>
                      <td>{s.lote}</td>
                      <td style={{ textAlign: 'center' }}>{s.gaveta || "-"}</td>
                      <td>{formatarData(s.data_nascimento)}</td>
                      <td>{formatarData(s.data_falecimento)}</td>
                      <td>{formatarData(s.data_sepultamento)}</td>
                      <td style={{ textAlign: 'center' }}>{s.idade}</td>
                      <td>{s.funeraria}</td>
                      <td style={{ fontSize: "11px", opacity: 0.8 }}>
                        {s.observacoes}
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