import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, WifiOff } from "lucide-react"; // Adicionado ícone de offline

// Hooks Customizados
import { useSepultamentos } from "../Hooks/useSepultamentos";
import { useIsMobile } from "../Hooks/useMobile";

// Componentes
import Toolbar from "../components/Toolbar";
import SepultamentoList from "../components/SepultamentoList";
import SepultamentoSearchBar from "../components/SepultamentoSearchBar";
import ContainerPagina from "../components/ContainerPagina";
import ContainerTabela from "../components/ContainerTabela";

// Utilitários
import { formatarData } from "../utils/formatarData"; 

import "../styles/tabela.css";

export default function Sepultamentos() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const { dados, loading, carregar, excluir } = useSepultamentos();
  
  const [selecionado, setSelecionado] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [isOffline, setIsOffline] = useState(!navigator.onLine); // Estado de conexão

  // Monitorar status da internet
  useEffect(() => {
    const handleStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);
    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  // Carrega os dados e gerencia o cache do PWA
  useEffect(() => {
    const carregarComCache = async () => {
      await carregar();
    };
    carregarComCache();
  }, [carregar]);

  // Lógica de Persistência: Sempre que 'dados' atualizar via rede, salvamos no cache
  useEffect(() => {
    if (dados && dados.length > 0) {
      localStorage.setItem("cache_sepultamentos", JSON.stringify(dados));
    }
  }, [dados]);

  // Dados Finais: Se estiver carregando e não houver dados, tentamos ler o cache imediatamente
  const dadosExibicao = (dados.length === 0 && !loading) 
    ? JSON.parse(localStorage.getItem("cache_sepultamentos") || "[]")
    : dados;

  // Filtro local (Busca rápida em memória)
  const dadosFiltrados = dadosExibicao.filter(s => {
    if (!filtro) return true;
    const t = filtro.toLowerCase();
    return (
      s.nome?.toLowerCase().includes(t) ||
      s.quadra?.toLowerCase().includes(t) ||
      s.lote?.toString().includes(t) ||
      s.funeraria?.toLowerCase().includes(t)
    );
  });

  // Handlers de Ação
  const handleInserir = () => navigate("/cadastrar-sepultamento");

  const handleEditar = () => {
    if (!selecionado) return alert("Selecione um registro.");
    navigate("/cadastrar-sepultamento", { state: { registro: selecionado } });
  };

  const handleExcluir = async () => {
    if (isOffline) return alert("Não é possível excluir registros sem conexão com a internet.");
    if (!selecionado) return alert("Selecione um registro.");
    
    const confirmou = window.confirm(`Excluir definitivamente ${selecionado.nome}?`);
    if (!confirmou) return;

    const res = await excluir(selecionado.id);
    
    if (res.success) {
      alert("Registro excluído!");
      setSelecionado(null);
    } else {
      alert("Erro ao excluir: " + res.error);
    }
  };

  return (
    <ContainerPagina>
      {/* AVISO DE MODO OFFLINE */}
      {isOffline && (
        <div style={{
          background: "#feebc8", color: "#c05621", padding: "8px 15px", 
          borderRadius: "8px", marginBottom: "15px", display: "flex", 
          alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: "bold"
        }}>
          <WifiOff size={18} /> Modo Offline: Exibindo dados salvos localmente.
        </div>
      )}

      {/* HEADER DINÂMICO */}
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: "space-between",
        gap: isMobile ? "8px" : "20px",
        marginBottom: "-5px",
        marginTop: "-10px"
      }}>
        <h2 style={{ margin: 0, fontSize: isMobile ? "20px" : "24px", color: "#1a202c" }}>
          Sepultamentos
        </h2>

        <div style={{ 
          flex: isMobile ? "none" : 1, 
          maxWidth: isMobile ? "100%" : "500px",
          marginBottom: "-10px",
          marginTop: "-5px"
        }}>
          <SepultamentoSearchBar onBuscar={setFiltro} />
        </div>

        <Toolbar
          onInserir={handleInserir}
          onEditar={handleEditar}
          onExcluir={handleExcluir}
          itemSelecionado={selecionado}
          mostrarFiltro={false}
          fixa={isMobile}
        />
      </div>
<div style={{
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  maxHeight: '450px'
}}>

      <ContainerTabela>
   
        {loading && dadosExibicao.length === 0 && <p style={{ padding: 20 }}>Carregando...</p>}
        
        {(!loading || dadosExibicao.length > 0) && isMobile ? (
          <SepultamentoList
            dados={dadosFiltrados}
            selecionado={selecionado}
            onSelecionar={setSelecionado}
            formatarData={formatarData}
          />
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
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
              {dadosFiltrados.map((s) => {
                const selecionadoLinha = selecionado?.id === s.id;
                const pendenciaObito = s.obito_entregue === false;

                const bgRow = selecionadoLinha ? "#ebf8ff" : (pendenciaObito ? "#fff5f5" : "transparent");
                const textColor = selecionadoLinha ? "#2b6cb0" : (pendenciaObito ? "#c53030" : "#2d3748");

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
                    <td style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
                      {pendenciaObito && (
                        <AlertCircle size={16} color="#e53e3e" strokeWidth={2.5} title="Óbito pendente" />
                      )}
                      {s.nome}
                    </td>
                    <td>{s.quadra}</td>
                    <td>{s.lote}</td>
                    <td>{s.gaveta || "-"}</td>
                    <td>{formatarData(s.data_nascimento)}</td>
                    <td>{formatarData(s.data_falecimento)}</td>
                    <td>{formatarData(s.data_sepultamento)}</td>
                    <td>{s.idade}</td>
                    <td>{s.funeraria}</td>
                    <td style={{ fontSize: "11px", opacity: 0.8 }}>{s.observacoes}</td>
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