import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { Calendar, FileText, Filter, AlertCircle, Search } from "lucide-react";
import ContainerPagina from "../components/ContainerPagina";
import ContainerTabela from "../components/ContainerTabela";
import { gerarRelatorioSepultamentos } from "../utils/relatorioPDF";
import "../styles/tabela.css";

export default function SepultamentosPeriodo() {
  const [dataDe, setDataDe] = useState("");
  const [dataAte, setDataAte] = useState("");
  const [dados, setDados] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);

    const hoje = new Date();
    const tresMesesAtras = new Date();
    tresMesesAtras.setMonth(hoje.getMonth() - 3);

    const dataFim = hoje.toISOString().split("T")[0];
    const dataInicio = tresMesesAtras.toISOString().split("T")[0];
    
    setDataDe(dataInicio);
    setDataAte(dataFim);
    carregarDados(dataInicio, dataFim);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function calcularIdade(dataNasc, dataFalec) {
    if (!dataNasc || !dataFalec) return "N/A";
    const nasc = new Date(dataNasc);
    const falec = new Date(dataFalec);
    let idade = falec.getFullYear() - nasc.getFullYear();
    const m = falec.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && falec.getDate() < nasc.getDate())) idade--;
    return idade;
  }

  async function carregarDados(inicio, fim) {
    setLoading(true);
    const { data, error } = await supabase
      .from("vw_sepultamentos_v1")
      .select("*")
      .gte("data_falecimento", inicio)
      .lte("data_falecimento", fim)
      .order("nome", { ascending: true });

    if (data) {
      setDados(data.map(s => ({ ...s, idade: calcularIdade(s.data_nascimento, s.data_falecimento) })));
    }
    if (error) console.error(error);
    setLoading(false);
  }

  const handleGerarPDF = () => {
    if (dados.length === 0) return alert("Não há dados para gerar o PDF");
    gerarRelatorioSepultamentos(dados, formatarData(dataDe), formatarData(dataAte));
  };

  function formatarData(data) {
    if (!data) return "";
    const [year, month, day] = data.split("-");
    return `${day}/${month}/${year}`;
  }

  const CartaoMobilePeriodo = ({ s }) => {
    const pendencia = s.obito_entregue === false;
    return (
      <div style={{
        ...styles.mobileCard,
        borderLeft: `5px solid ${pendencia ? "#ef4444" : "#1e293b"}`,
        backgroundColor: pendencia ? "#fff5f5" : "#fff",
      }}>
        <div style={styles.cardHeader}>
          {pendencia && <AlertCircle size={18} color="#ef4444" strokeWidth={2.5} />}
          <span style={{ color: pendencia ? "#c53030" : "#0f172a" }}>{s.nome}</span>
        </div>
        <div style={styles.cardBody}>
          <p><strong>LOCAL:</strong> {s.quadra} — <strong>LOTE:</strong> {s.lote}</p>
          <div style={styles.cardFooter}>
            <span>Falec: {formatarData(s.data_falecimento)}</span>
            <span>Idade: <strong>{s.idade} anos</strong></span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ContainerPagina titulo="Relatório por Período">
      
      {/* SEÇÃO DE FILTROS REESTILIZADA */}
      <div style={{
        ...styles.filterContainer,
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        marginBottom: "-12px",
        marginTop: "-5px"
      }}>
        <div style={{ 
          display: "flex", 
          gap: "10px", 
          alignItems: "center",
          marginBottom: "-5px",
          marginTop: "-5px"
           }}>
          <div style={styles.inputGroup}>
            <Calendar size={16} color="#64748b" />
            <input 
              type="date" 
              value={dataDe} 
              onChange={(e) => setDataDe(e.target.value)} 
              style={styles.dateInput} 
            />
          </div>
          <span style={{ color: "#94a3b8" }}>até</span>
          <div style={styles.inputGroup}>
            <Calendar size={16} color="#64748b" />
            <input 
              type="date" 
              value={dataAte} 
              onChange={(e) => setDataAte(e.target.value)} 
              style={styles.dateInput} 
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={() => carregarDados(dataDe, dataAte)} 
            disabled={loading}
            style={styles.btnFiltrar}
          >
            {loading ? "..." : <Filter size={18} />}
            Filtrar
          </button>
          
          <button onClick={handleGerarPDF} style={styles.btnPdf}>
            <FileText size={18} />
            Gerar PDF
          </button>
        </div>

        <div style={styles.countBadge}>
          {dados.length} registros
        </div>
      </div>

      <ContainerTabela>
        {isMobile ? (
          <div style={{ paddingBottom: "80px" }}>
            {dados.map(s => <CartaoMobilePeriodo key={s.id} s={s} />)}
          </div>
        ) : (
          <table className="tabela" style={{ minWidth: "1200px" }}>
            <thead>
              <tr>
                <th style={{ width: '350px' }}>Nome</th>
                <th>Quadra</th>
                <th>Lote</th>
                <th>Gaveta</th>
                <th>Nascimento</th>
                <th>Falecimento</th>
                <th>Idade</th>
                <th>Funerária</th>
                <th style={{ width: '200px' }}>Observações</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((s) => {
                const pendencia = s.obito_entregue === false;
                return (
                  <tr 
                    key={s.id} 
                    style={{ 
                      backgroundColor: pendencia ? "#fff5f5" : "transparent",
                      color: pendencia ? "#c53030" : "inherit" 
                    }}
                  >
                    <td style={{ fontWeight: '600', display: "flex", alignItems: "center", gap: "8px" }}>
                      {pendencia && <AlertCircle size={16} color="#ef4444" strokeWidth={2.5} />}
                      {s.nome}
                    </td>
                    <td>{s.quadra}</td>
                    <td>{s.lote}</td>
                    <td>{s.gaveta}</td>
                    <td>{formatarData(s.data_nascimento)}</td>
                    <td>{formatarData(s.data_falecimento)}</td>
                    <td>{s.idade}</td>
                    <td>{s.funeraria}</td>
                    <td style={{ fontSize: '11px', opacity: 0.8 }}>{s.observacoes}</td>
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

const styles = {
  filterContainer: {
    display: "flex",
    gap: "15px",
    background: "#fff",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
  },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: "0 12px",
    borderRadius: "8px",
  },
  dateInput: {
    border: "none",
    background: "transparent",
    padding: "10px 0",
    fontSize: "14px",
    color: "#1e293b",
    outline: "none",
    fontFamily: "inherit"
  },
  btnFiltrar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#1e293b",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "opacity 0.2s"
  },
  btnPdf: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px"
  },
  countBadge: {
    marginLeft: "auto",
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "600",
    background: "#f1f5f9",
    padding: "6px 14px",
    borderRadius: "20px"
  },
  // Estilos Mobile
  mobileCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "16px",
    fontWeight: "700",
    marginBottom: "8px"
  },
  cardBody: {
    fontSize: "13px",
    color: "#475569"
  },
  cardFooter: {
    marginTop: "10px",
    paddingTop: "10px",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    color: "#94a3b8"
  }
};