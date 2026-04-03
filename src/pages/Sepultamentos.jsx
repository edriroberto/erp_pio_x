import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, WifiOff } from "lucide-react";

// Hooks Customizados
import { useSepultamentos } from "../Hooks/useSepultamentos";
import { useIsMobile } from "../Hooks/useMobile";
import { useAuth } from "../Hooks/useAuth"; // Importado para gerenciar permissões

// Componentes
import Toolbar from "../components/Toolbar";
import SepultamentoList from "../components/SepultamentoList";
import SepultamentoSearchBar from "../components/SepultamentoSearchBar";
import ContainerPagina from "../components/ContainerPagina";
import ContainerTabela from "../components/ContainerTabela";
import Permissao from "../components/Permissao";

// Utilitários
import { formatarData } from "../utils/formatarData"; 
import "../styles/tabela.css";

export default function Sepultamentos() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { perfil } = useAuth(); // Obtém o nível (master, admin, consulta)
  
  const { dados, loading, carregar, excluir } = useSepultamentos();
  
  const [selecionado, setSelecionado] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // --- MONITORAMENTO DE CONEXÃO ---
  useEffect(() => {
    const handleStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);
    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  // --- CARREGAMENTO INICIAL ---
  useEffect(() => {
    carregar();
  }, [carregar]);

  // --- PERSISTÊNCIA DE CACHE (LocalStorage) ---
  useEffect(() => {
    if (dados?.length > 0) {
      localStorage.setItem("cache_sepultamentos", JSON.stringify(dados));
    }
  }, [dados]);

  // --- LÓGICA DE EXIBIÇÃO ---
  const dadosExibicao = useMemo(() => {
    if (dados.length === 0 && !loading) {
      return JSON.parse(localStorage.getItem("cache_sepultamentos") || "[]");
    }
    return dados;
  }, [dados, loading]);

  // Filtro local otimizado
  const dadosFiltrados = useMemo(() => {
    const t = filtro.toLowerCase();
    return dadosExibicao.filter(s => 
      !filtro || 
      s.nome?.toLowerCase().includes(t) ||
      s.quadra?.toLowerCase().includes(t) ||
      s.lote?.toString().includes(t) ||
      s.funeraria?.toLowerCase().includes(t)
    );
  }, [dadosExibicao, filtro]);

  // --- HANDLERS ---
  const handleInserir = () => navigate("/cadastrar-sepultamento");

  const handleEditar = () => {
    if (!selecionado) return alert("Selecione um registro.");
    navigate("/cadastrar-sepultamento", { state: { registro: selecionado } });
  };

  const handleExcluir = async () => {
    if (isOffline) return alert("A exclusão requer conexão com a internet.");
    if (!selecionado) return alert("Selecione um registro.");
    
    if (window.confirm(`Excluir definitivamente o registro de ${selecionado.nome}?`)) {
      const res = await excluir(selecionado.id);
      if (res.success) {
        setSelecionado(null);
      } else {
        alert("Erro ao excluir: " + res.error);
      }
    }
  };

  return (
    <ContainerPagina>
      {/* STATUS OFFLINE */}
      {isOffline && (
        <div style={styles.offlineBadge}>
          <WifiOff size={18} /> Modo Offline: Dados carregados do cache local.
        </div>
      )}

      {/* CABEÇALHO E FERRAMENTAS */}
      <div style={{
        ...styles.header,
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
      }}>
        <h2 style={{ ...styles.title, fontSize: isMobile ? "20px" : "24px" }}>
          Sepultamentos
        </h2>

        <div style={{ flex: isMobile ? "none" : 1, maxWidth: isMobile ? "100%" : "500px" }}>
          <SepultamentoSearchBar onBuscar={setFiltro} />
        </div>

        {/* TOOLBAR COM CONTROLE DE PERMISSÃO */}
        <Toolbar
          onInserir={handleInserir}
          onEditar={handleEditar}
          onExcluir={handleExcluir}
          itemSelecionado={selecionado}
          mostrarFiltro={false}
          fixa={isMobile}
          // Passamos o perfil para a Toolbar decidir internamente o que mostrar, 
          // ou garantimos que ela aceite o nível 'consulta' para o onInserir
          nivelUsuario={perfil?.nivel} 
        />
      </div>

      {/* ÁREA DA TABELA / LISTA */}
      <div style={styles.contentWrapper}>
        <ContainerTabela>
          {loading && dadosExibicao.length === 0 ? (
            <p style={{ padding: 20 }}>Carregando registros...</p>
          ) : isMobile ? (
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
                  <th>Vaga</th>
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
                  const isSel = selecionado?.id === s.id;
                  const pendente = s.obito_entregue === false;
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelecionado(s)}
                      className={`linha-tabela ${isSel ? 'selecionada' : ''} ${pendente ? 'pendente' : ''}`}
                      style={{
                        cursor: "pointer",
                        backgroundColor: isSel ? "#ebf8ff" : (pendente ? "#fff5f5" : "transparent"),
                        color: isSel ? "#2b6cb0" : (pendente ? "#c53030" : "#2d3748"),
                      }}
                    >
                      <td style={styles.nameCell}>
                        {pendente && <AlertCircle size={16} color="#e53e3e" title="Óbito pendente" />}
                        {s.nome}
                      </td>
                      <td>{s.quadra}</td>
                      <td>{s.lote}</td>
                      <td style={{ textAlign: 'center' }}>{s.gaveta || "-"}</td>
                      
                      <td>{formatarData(s.data_nascimento)}</td>
                      <td>{formatarData(s.data_falecimento)}</td>
                      <td>{formatarData(s.data_sepultamento)}</td>
                      <td>{s.idade}</td>
                      <td>{s.funeraria}</td>
                      <td style={styles.obsCell}>{s.observacoes}</td>
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

// Estilos extraídos para limpeza do render
const styles = {
  offlineBadge: {
    background: "#feebc8",
    color: "#c05621",
    padding: "8px 15px",
    borderRadius: "8px",
    marginBottom: "5px",
    display: "flex",
    marginTop: "5px",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    fontWeight: "bold"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "3px",
    marginTop: "-10px"
  },
  title: {
    margin: '10px 0 5px',
    color: "#1a202c"
  },
  contentWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    height: "100%",
  },
  nameCell: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "600"
  },
  obsCell: {
    fontSize: "11px",
    opacity: 0.8
  }
};