import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { AlertCircle } from "lucide-react"; // Novo ícone

import Toolbar from "../components/Toolbar";
import SepultamentoList from "../components/SepultamentoList";
import SepultamentoSearchBar from "../components/SepultamentoSearchBar";
import ContainerPagina from "../components/ContainerPagina";
import ContainerTabela from "../components/ContainerTabela";

import "../styles/tabela.css";

export default function Sepultamentos() {
  const [dados, setDados] = useState([]);
  const [dadosFiltrados, setDadosFiltrados] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data, error } = await supabase
      .from("vw_sepultamentos_v1")
      .select("*")
      .order("data_sepultamento", { ascending: false });

    if (error) {
      alert("Erro ao carregar dados: " + error.message);
      return;
    }

    if (data) {
      const dadosComIdade = data.map(s => ({
        ...s,
        idade: calcularIdade(s.data_nascimento, s.data_falecimento)
      }));
      setDados(dadosComIdade);
      setDadosFiltrados(dadosComIdade);
    }
  }

  function calcularIdade(dataNasc, dataFalec) {
    if (!dataNasc || !dataFalec) return "N/A";
    const nasc = new Date(dataNasc);
    const falec = new Date(dataFalec);
    let idade = falec.getFullYear() - nasc.getFullYear();
    const m = falec.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && falec.getDate() < nasc.getDate())) {
      idade--;
    }
    return idade;
  }

  function formatarData(data) {
    if (!data) return "";
    const [year, month, day] = data.split("-");
    return `${day}/${month}/${year}`;
  }

  function buscar(texto) {
    if (!texto) {
      setDadosFiltrados(dados);
      return;
    }
    const t = texto.toLowerCase();
    const filtrado = dados.filter(s =>
      s.nome?.toLowerCase().includes(t) ||
      s.quadra?.toLowerCase().includes(t) ||
      s.lote?.toString().includes(t) ||
      s.funeraria?.toLowerCase().includes(t)
    );
    setDadosFiltrados(filtrado);
  }

  const handleInserir = () => navigate("/cadastrar-sepultamento");

  const handleEditar = () => {
    if (!selecionado) return alert("Selecione um registro.");
    navigate("/cadastrar-sepultamento", { state: { registro: selecionado } });
  };

  const handleExcluir = async () => {
    if (!selecionado) return alert("Selecione um registro.");
    const confirmou = window.confirm(`Excluir definitivamente ${selecionado.nome}?`);
    if (!confirmou) return;

    const { error } = await supabase.from("sepultamentos").delete().eq("id", selecionado.id);
    if (error) return alert("Erro: " + error.message);

    alert("Registro excluído!");
    setSelecionado(null);
    carregar();
  };

  return (
    <ContainerPagina>
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
          maxWidth: isMobile ? "100%" : "500px" ,
          marginBottom: "-10px",
          marginTop: "-5px"
          
          }}>
          <SepultamentoSearchBar onBuscar={buscar} />
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

      <ContainerTabela>
        {isMobile ? (
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

                // Estilos de cor baseados no estado
                let bgRow = "transparent";
                let textColor = "#2d3748";

                if (selecionadoLinha) {
                  bgRow = "#ebf8ff";
                  textColor = "#2b6cb0";
                } else if (pendenciaObito) {
                  bgRow = "#fff5f5"; // Vermelho pastel muito suave
                  textColor = "#c53030";
                }

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
                        <AlertCircle 
                          size={16} 
                          color="#e53e3e" 
                          strokeWidth={2.5}
                          title="Óbito pendente" 
                        />
                      )}
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
    </ContainerPagina>
  );
}