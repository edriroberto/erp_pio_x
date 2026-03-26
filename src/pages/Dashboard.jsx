import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import { AlertCircle, WifiOff } from "lucide-react"; 

import { formatarData, calcularIdade } from "../utils/formatarData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";

import DashboardCard from "../components/DashboardCard";
import SepultamentoCard from "../components/SepultamentoCard";
import ContainerTabela from "../components/ContainerTabela";
import "../styles/tabela.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [grafico, setGrafico] = useState([]);
  const [ultimos, setUltimos] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [totais, setTotais] = useState({ sepultamentos: 0, falecimentos: 0, pendentes: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const CORES = ["#4a90e2", "#f5a623", "#f35d22", "#50e3c2", "#34a853", "#ea4335"];

  useEffect(() => {
    // 1. Carregar cache local imediatamente (Sincronia)
    const cacheSalvo = localStorage.getItem("cache_ultimos_sepultamentos");
    if (cacheSalvo) {
      setUltimos(JSON.parse(cacheSalvo));
    }

    // 2. Tentar carregar dados atualizados da rede
    carregarDashboard();

    // 3. Listeners de sistema
    const resize = () => setIsMobile(window.innerWidth <= 768);
    const handleStatus = () => setIsOffline(!navigator.onLine);
    
    window.addEventListener("resize", resize);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);
    
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  async function carregarDashboard() {
    try {
      // Carregamos os dados em paralelo para velocidade
      const [g, s, f, p, l] = await Promise.all([
        supabase.from("vw_dash_sepultamentos_12_meses").select("*"),
        supabase.from("vw_dash_sepultamentos_mes").select("total").single(),
        supabase.from("vw_dash_falecimentos_mes").select("total").single(),
        supabase.from("vw_dash_obitos_pendentes").select("total").single(),
        supabase.from("vw_sepultamentos_v1").select("*").order("data_falecimento", { ascending: false }).limit(15)
      ]);

      if (l.data) {
        setUltimos(l.data);
        // Atualiza o cache apenas com a lista de sepultamentos
        localStorage.setItem("cache_ultimos_sepultamentos", JSON.stringify(l.data));
      }

      if (s.data) setTotais({
        sepultamentos: s.data?.total || 0,
        falecimentos: f.data?.total || 0,
        pendentes: p.data?.total || 0
      });

      if (g.data) {
        // Lógica simplificada de processamento do gráfico
        const processados = g.data.map((item, idx) => ({
          ...item,
          mes: item.mes.split('-').reverse().join('/'), // Formata MM-YYYY para YYYY-MM
          cor: CORES[idx % CORES.length]
        }));
        setGrafico(processados);
      }

    } catch (e) {
      console.error("Modo Offline: Mantendo dados do cache.");
    }
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      padding: isMobile ? 12 : 20, background: "#f5f6fa",
      fontFamily: 'sans-serif', margin: '0 -10px'
    }}>
      
      {isOffline && (
        <div style={{
          background: "#fff5f5", color: "#c53030", padding: "10px", 
          borderRadius: "8px", marginBottom: "15px", display: "flex", 
          alignItems: "center", gap: "10px", fontSize: "14px", border: "1px solid #feb2b2"
        }}>
          <WifiOff size={18} /> 
          <strong>Você está offline.</strong> Exibindo lista salva no celular.
        </div>
      )}

      <h2 style={{ marginBottom: "16px", color: "#1a202c", marginTop: isOffline ? 0 : "-15px" }}>
        Dashboard
      </h2>

      {/* KPIs - Só aparecem valores se houver sinal ou se o estado foi populado */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
        <DashboardCard titulo="Sepultamentos" valor={totais.sepultamentos} cor="#4a90e2" />
        <DashboardCard titulo="Falecimentos" valor={totais.falecimentos} cor="#34a853" />
        <DashboardCard titulo="Pendentes" valor={totais.pendentes} cor="#ea4335" />
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingRight: 4, margin: '0 -20px 0 -15px' }}>
        
        {/* Gráfico - Só renderiza se houver dados */}
        {grafico.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 14, padding: 12, marginBottom: 16, boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Histórico 12 Meses</div>
            <div style={{ height: isMobile ? 140 : 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={grafico}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="mes" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {grafico.map((entry, index) => <Cell key={index} fill={entry.cor} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* LISTA DE ÚLTIMOS SEPULTAMENTOS - Prioridade Máxima */}
        <div style={{ padding: "0 15px" }}>
          <div style={{ fontWeight: 600, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>Últimos Sepultamentos</span>
            {ultimos.length > 0 && <span style={{ fontSize: 10, color: '#999' }}>{ultimos.length} registros</span>}
          </div>

          {isMobile ? (
            ultimos.map(s => (
              <SepultamentoCard
                key={s.id}
                dado={{
                  ...s,
                  nascimento: formatarData(s.data_nascimento),
                  falecimento: formatarData(s.data_falecimento),
                  idade: calcularIdade(s.data_nascimento, s.data_falecimento)
                }}
                onClick={() => navigate(`/cadastroSepultamento/${s.id}`)}
              />
            ))
          ) : (
            <ContainerTabela>
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Quadra</th>
                    <th>Lote</th>
                    <th>Falecimento</th>
                    <th>Funerária</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimos.map((s) => (
                    <tr key={s.id} onClick={() => navigate(`/cadastroSepultamento/${s.id}`)} style={{ cursor: 'pointer' }}>
                      <td style={{ fontWeight: '500' }}>{s.nome}</td>
                      <td>{s.quadra}</td>
                      <td>{s.lote}</td>
                      <td>{formatarData(s.data_falecimento)}</td>
                      <td>{s.funeraria}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ContainerTabela>
          )}
        </div>
      </div>
    </div>
  );
}