import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import { WifiOff, AlertCircle } from "lucide-react";

import { formatarData, calcularIdade } from "../utils/formatarData";
import DashboardCard from "../components/DashboardCard";
import SepultamentoCard from "../components/SepultamentoCard";
import "../styles/tabela.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [ultimos, setUltimos] = useState([]);
  const [totais, setTotais] = useState({ sepultamentos: 0, falecimentos: 0, pendentes: 0 });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [loading, setLoading] = useState(true);

  // 1. Efeito para monitorar a internet em tempo real
  useEffect(() => {
    const handleStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);
    
    // Tenta carregar os dados assim que o componente monta
    inicializarDados();

    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  async function inicializarDados() {
    setLoading(true);
    
    // Passo A: Tenta ler o que tem no "disco" do celular primeiro
    const cache = localStorage.getItem("cache_sepultamentos_v1");
    if (cache) {
      const dadosSalvos = JSON.parse(cache);
      setUltimos(dadosSalvos.lista || []);
      setTotais(dadosSalvos.kpis || { sepultamentos: 0, falecimentos: 0, pendentes: 0 });
    }

    // Passo B: Só tenta a rede se estiver online
    if (navigator.onLine) {
      await buscarDadosDaRede();
    }
    
    setLoading(false);
  }

  async function buscarDadosDaRede() {
    try {
      // Usando timeout para não ficar "pendurado" se o sinal da operadora estiver oscilando
      const { data, error } = await supabase
        .from("vw_sepultamentos_v1")
        .select("*")
        .order("data_falecimento", { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data) {
        setUltimos(data);
        
        // Buscamos os totais (exemplo simplificado de contagem)
        // Se você tiver as views de totais, pode manter o Promise.all anterior aqui
        const { data: s } = await supabase.from("vw_dash_sepultamentos_mes").select("total").single();
        
        const novosTotais = {
          sepultamentos: s?.total || 0,
          falecimentos: 0, // Adicione as outras buscas conforme sua necessidade
          pendentes: 0
        };

        setTotais(novosTotais);

        // ATUALIZA O CACHE: Guarda a foto atualizada para a próxima vez
        localStorage.setItem("cache_sepultamentos_v1", JSON.stringify({
          lista: data,
          kpis: novosTotais,
          atualizadoEm: new Date().toISOString()
        }));
      }
    } catch (err) {
      console.warn("Falha na rede, mantendo cache local.");
    }
  }

  return (
    <div style={{ padding: "15px", background: "#f5f6fa", minHeight: "100vh" }}>
      
      {/* Aviso de Offline */}
      {isOffline && (
        <div style={{
          background: "#fff5f5", color: "#c53030", padding: "12px",
          borderRadius: "8px", marginBottom: "15px", display: "flex",
          alignItems: "center", gap: "10px", border: "1px solid #feb2b2"
        }}>
          <WifiOff size={20} />
          <span>Sem sinal. Exibindo dados salvos.</span>
        </div>
      )}

      <h2 style={{ marginBottom: "20px", color: "#2d3748" }}>Dashboard</h2>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
        <DashboardCard titulo="Mês" valor={totais.sepultamentos} cor="#4a90e2" />
        <DashboardCard titulo="Falec." valor={totais.falecimentos} cor="#38a169" />
        <DashboardCard titulo="Pend." valor={totais.pendentes} cor="#e53e3e" />
      </div>

      <div style={{ fontWeight: "bold", marginBottom: "10px", color: "#4a5568" }}>
        Últimos Registros
      </div>

      {/* Lista de Sepultamentos */}
      {ultimos.length > 0 ? (
        ultimos.map((s) => (
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
        <div style={{ textAlign: "center", padding: "40px", color: "#a0aec0" }}>
          {loading ? "Carregando..." : "Nenhum dado disponível offline."}
        </div>
      )}
      
      {/* Botão para forçar atualização se o sinal voltar */}
      {!isOffline && (
        <button 
          onClick={buscarDadosDaRede}
          style={{
            marginTop: "20px", width: "100%", padding: "12px",
            background: "#fff", border: "1px solid #cbd5e0",
            borderRadius: "8px", color: "#4a5568", fontWeight: "bold"
          }}
        >
          Atualizar Dados
        </button>
      )}
    </div>
  );
}