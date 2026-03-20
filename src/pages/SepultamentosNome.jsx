import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { AlertCircle, UserSearch } from "lucide-react"; // Ícones modernos
import ContainerPagina from "../components/ContainerPagina";
import ContainerTabela from "../components/ContainerTabela";
import SepultamentoSearchBar from "../components/SepultamentoSearchBar";

import "../styles/tabela.css";

export default function SepultamentosPorNome() {
  const [busca, setBusca] = useState("");
  const [dados, setDados] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    buscar();
  }, [busca]);

  function calcularIdade(dataNasc, dataFalec) {
    if (!dataNasc || !dataFalec) return "N/A";
    const nasc = new Date(dataNasc);
    const falec = new Date(dataFalec);
    let idade = falec.getFullYear() - nasc.getFullYear();
    const m = falec.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && falec.getDate() < nasc.getDate())) idade--;
    return idade;
  }

  async function buscar() {
    let query = supabase.from("vw_sepultamentos_v1").select("*").order("nome");
    
    if (busca.trim() !== "") {
      query = query.ilike("nome", `%${busca}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Erro na busca:", error.message);
      return;
    }
    
    if (data) {
      const dadosComIdade = data.map(s => ({
        ...s,
        idade: calcularIdade(s.data_nascimento, s.data_falecimento)
      }));
      setDados(dadosComIdade);
    }
  }

  function formatarData(data) {
    if (!data) return "";
    const [year, month, day] = data.split("-");
    return `${day}/${month}/${year}`;
  }

  // Componente de Cartão Mobile Refatorado
  const CartaoMobileBusca = ({ s }) => {
    const pendencia = s.obito_entregue === false;
    return (
      <div style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "12px",
        borderLeft: `5px solid ${pendencia ? "#ef4444" : "#4fd1c5"}`,
        backgroundColor: pendencia ? "#fff5f5" : "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        transition: "transform 0.2s"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          {pendencia && <AlertCircle size={18} color="#ef4444" strokeWidth={2.5} />}
          <span style={{ fontSize: "16px", fontWeight: "700", color: pendencia ? "#c53030" : "#1a202c" }}>
            {s.nome}
          </span>
        </div>
        
        <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "8px" }}>
          <strong style={{ color: "#475569" }}>LOCAL:</strong> {s.quadra} — <strong>LOTE:</strong> {s.lote}
        </div>
        
        <div style={{ 
          fontSize: "12px", 
          display: "flex", 
          justifyContent: "space-between",
          paddingTop: "8px",
          borderTop: "1px solid rgba(0,0,0,0.04)"
        }}>
          <span style={{ color: "#94a3b8" }}>Falecimento: {formatarData(s.data_falecimento)}</span>
          <span style={{ color: "#1a202c" }}>Idade: <strong>{s.idade} anos</strong></span>
        </div>
      </div>
    );
  };

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
          <h2 style={{ margin: 0, fontSize: "22px" }}>Consulta por Nome</h2>
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

      <ContainerTabela>
        {isMobile ? (
          <div style={{ paddingBottom: "80px" }}>
            {dados.map(s => <CartaoMobileBusca key={s.id} s={s} />)}
          </div>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th style={{ width: 350 }}>Nome</th>
                <th>Quadra</th>
                <th>Lote</th>
                <th>Gaveta</th>
                <th>Nascimento</th>
                <th>Falecimento</th>
                <th>Sepultamento</th>
                <th>Idade</th>
                <th>Funerária</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((s) => {
                const pendencia = s.obito_entregue === false;
                const textColor = pendencia ? "#c53030" : "#1e293b";
                const bgColor = pendencia ? "#fff5f5" : "transparent";

                return (
                  <tr 
                    key={s.id} 
                    style={{ 
                      backgroundColor: bgColor,
                      color: textColor,
                      transition: "background 0.2s"
                    }}
                  >
                    <td style={{ fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                      {pendencia && <AlertCircle size={16} color="#ef4444" strokeWidth={2.5} />}
                      {s.nome}
                    </td>
                    <td>{s.quadra}</td>
                    <td>{s.lote}</td>
                    <td>{s.gaveta}</td>
                    <td>{formatarData(s.data_nascimento)}</td>
                    <td>{formatarData(s.data_falecimento)}</td>
                    <td>{formatarData(s.data_sepultamento)}</td>
                    <td>{s.idade}</td>
                    <td>{s.funeraria}</td>
                    <td style={{ 
                      fontSize: "11px", 
                      color: pendencia ? "#c53030" : "#64748b",
                      opacity: 0.8 
                    }}>
                      {s.observacoes}
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