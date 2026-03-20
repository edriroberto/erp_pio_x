import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

import DashboardCard from "../components/DashboardCard";
import SepultamentoCard from "../components/SepultamentoCard";
import ContainerTabela from "../components/ContainerTabela"; // Importado para manter o padrão
import "../styles/tabela.css"; // Importado para usar os estilos de tabela

export default function Dashboard() {
  const navigate = useNavigate();
  const [grafico, setGrafico] = useState([]);
  const [ultimos, setUltimos] = useState([]);
  const [selecionado, setSelecionado] = useState(null); // Adicionado para controle de seleção
  const [totais, setTotais] = useState({
    sepultamentos: 0,
    falecimentos: 0,
    pendentes: 0
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const CORES = [
    "#4a90e2", "#f5a623", "#f35d22", "#50e3c2",
    "#34a853", "#ea4335", "#fbbc05", "#607d8b",
    "#9c27b0", "#ff6b6b", "#00bcd4", "#795548"
  ];

  useEffect(() => {
    carregarDashboard();
    const resize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  function abrirCadastro(id) {
    navigate(`/cadastroSepultamento/${id}`);
  }

  function calcularIdade(dataNascimento, dataFalecimento) {
    if (!dataNascimento || !dataFalecimento) return "";
    const nasc = new Date(dataNascimento);
    const falec = new Date(dataFalecimento);
    let idade = falec.getFullYear() - nasc.getFullYear();
    const m = falec.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && falec.getDate() < nasc.getDate())) idade--;
    return idade;
  }

  function formatar(data) {
    if (!data) return "";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  const formatChave = (ano, mes) => `${ano}-${String(mes).padStart(2, "0")}`;

  async function carregarDashboard() {
    try {
      const [g, s, f, p, l] = await Promise.all([
        supabase.from("vw_dash_sepultamentos_12_meses").select("*"),
        supabase.from("vw_dash_sepultamentos_mes").select("total").single(),
        supabase.from("vw_dash_falecimentos_mes").select("total").single(),
        supabase.from("vw_dash_obitos_pendentes").select("total").single(),
        supabase
          .from("vw_sepultamentos_v1")
          .select("*")
          .order("data_falecimento", { ascending: false })
          .limit(15)
      ]);

      const meses12 = [];
      const hoje = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const chave = formatChave(d.getFullYear(), d.getMonth() + 1);
        meses12.push({
          chave,
          mes: `${d.toLocaleDateString("pt-BR", { month: "short" })}/${d.getFullYear()}`,
          total: 0
        });
      }

      if (g.data) {
        g.data.forEach(item => {
          const [ano, mes] = item.mes.split("-");
          const chave = formatChave(ano, mes);
          const index = meses12.findIndex(m => m.chave === chave);
          if (index !== -1) meses12[index].total = item.total;
        });
      }

      const dadosComCor = meses12.map((m, idx) => ({
        ...m,
        cor: CORES[idx % CORES.length]
      }));

      setGrafico(dadosComCor);
      setTotais({
        sepultamentos: s.data?.total || 0,
        falecimentos: f.data?.total || 0,
        pendentes: p.data?.total || 0
      });
      setUltimos(l.data || []);
    } catch (e) {
      console.error("Erro dashboard:", e);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: isMobile ? 12 : 20,
        background: "#f5f6fa",
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto'
      }}
    >
      <h2 style={{ marginBottom: 16 }}>Dashboard</h2>

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 8,
          marginBottom: 16
        }}
      >
        <DashboardCard titulo="Sepultamentos" valor={totais.sepultamentos} cor="#4a90e2" />
        <DashboardCard titulo="Falecimentos" valor={totais.falecimentos} cor="#34a853" />
        <DashboardCard titulo="Pendentes" valor={totais.pendentes} cor="#ea4335" />
      </div>

      {/* Container rolagem */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: 4
        }}
      >
        {/* Gráfico */}
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            padding: 12,
            marginBottom: 16,
            boxShadow: "0 2px 6px rgba(0,0,0,0.06)"
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            Sepultamentos últimos 12 meses
          </div>

          <div style={{ height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={grafico}
                margin={{ top: 5, right: 20, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {grafico.map((entry, index) => (
                    <Cell key={index} fill={entry.cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LISTA DE ÚLTIMOS SEPULTAMENTOS */}
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Últimos Sepultamentos</div>

        {isMobile ? (
          // MOBILE: Usa a lista de cards (DIVs)
          ultimos.map(s => (
            <SepultamentoCard
              key={s.id}
              dado={{
                id: s.id,
                nome: s.nome,
                nascimento: formatar(s.data_nascimento),
                falecimento: formatar(s.data_falecimento),
                quadra: s.quadra,
                lote: s.lote,
                gaveta: s.gaveta,
                funeraria: s.funeraria,
                idade: calcularIdade(s.data_nascimento, s.data_falecimento),
                obito_entregue: Boolean(s.obito_entregue),
                observacoes: s.observacoes
              }}
              selecionado={selecionado?.id === s.id}
              onClick={() => {
                setSelecionado(s);
                abrirCadastro(s.id);
              }}
            />
          ))
        ) : (
          // DESKTOP: Usa a técnica de tabela do sepultamentos.jsx
          <ContainerTabela>
            <table className="tabela">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Quadra</th>
                  <th style={{ textAlign: 'center' }}>Lote</th>
                  <th style={{ textAlign: 'center' }}>Gaveta</th>
                  <th>Nascimento</th>
                  <th>Falecimento</th>
                  <th style={{ textAlign: 'center' }}>Idade</th>
                  <th>Funerária</th>
                  <th>Observações</th>
                </tr>
              </thead>
              <tbody>
                {ultimos.map((s) => {
                  const selecionadoLinha = selecionado?.id === s.id;
                  const pendenciaObito = s.obito_entregue === false;
                  
                  // Mesma lógica de cores de Sepultamentos.jsx
                  let corFundo = "transparent";
                  if (selecionadoLinha) {
                    corFundo = "#ebf8ff";
                  } else if (pendenciaObito) {
                    corFundo = "#fff5f5";
                  }

                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelecionado(s)}
                      onDoubleClick={() => abrirCadastro(s.id)}
                      style={{
                        cursor: "pointer",
                        backgroundColor: corFundo,
                        color: selecionadoLinha ? "#2b6cb0" : (pendenciaObito ? "#c53030" : "inherit"),
                        fontWeight: selecionadoLinha ? "600" : "400",
                        transition: "background-color .2s"
                      }}
                      className="linha-tabela"
                    >
                      <td style={{ fontWeight: '500' }}>
                        {pendenciaObito && <span title="Óbito pendente" style={{ marginRight: 5 }}>⚠️</span>}
                        {s.nome}
                      </td>
                      <td>{s.quadra}</td>
                      <td style={{ textAlign: 'center' }}>{s.lote}</td>
                      <td style={{ textAlign: 'center' }}>{s.gaveta || "-"}</td>
                      <td>{formatar(s.data_nascimento)}</td>
                      <td>{formatar(s.data_falecimento)}</td>
                      <td style={{ textAlign: 'center' }}>
                        {calcularIdade(s.data_nascimento, s.data_falecimento)}
                      </td>
                      <td>{s.funeraria}</td>
                      <td style={{ fontSize: 11, color: pendenciaObito ? "#c53030" : "#666" }}>
                        {s.observacoes}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ContainerTabela>
        )}
      </div>
    </div>
  );
}