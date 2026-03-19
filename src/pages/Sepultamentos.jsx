import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../utils/supabaseClient"

import Toolbar from "../components/Toolbar"
import SepultamentoList from "../components/SepultamentoList"
import SepultamentoSearchBar from "../components/SepultamentoSearchBar"
import ContainerPagina from "../components/ContainerPagina";
import ContainerTabela from "../components/ContainerTabela";
import "../styles/tabela.css"


import "../styles/tabela.css"

export default function Sepultamentos() {
  const [dados, setDados] = useState([])
  const [dadosFiltrados, setDadosFiltrados] = useState([])
  const [selecionado, setSelecionado] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  const navigate = useNavigate()

  /* RESPONSIVO */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  /* CARREGAR DADOS */
  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    const { data, error } = await supabase
      .from("vw_sepultamentos_v1")
      .select("*")
      .order("data_sepultamento", { ascending: false })

    if (error) {
      alert("Erro ao carregar dados: " + error.message)
      return
    }

    if (data) {
      const dadosComIdade = data.map(s => ({
        ...s,
        idade: calcularIdade(s.data_nascimento, s.data_falecimento)
      }))
      setDados(dadosComIdade)
      setDadosFiltrados(dadosComIdade)
    }
  }

  /* REGRAS */
  function calcularIdade(dataNasc, dataFalec) {
    if (!dataNasc || !dataFalec) return "N/A"
    const nasc = new Date(dataNasc)
    const falec = new Date(dataFalec)
    let idade = falec.getFullYear() - nasc.getFullYear()
    const m = falec.getMonth() - nasc.getMonth()
    if (m < 0 || (m === 0 && falec.getDate() < nasc.getDate())) {
      idade--
    }
    return idade
  }

  function formatarData(data) {
    if (!data) return ""
    const partes = data.split("-")
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  /* BUSCA */
  function buscar(texto) {
    if (!texto) {
      setDadosFiltrados(dados)
      return
    }
    const t = texto.toLowerCase()
    const filtrado = dados.filter(s =>
      s.nome?.toLowerCase().includes(t) ||
      s.quadra?.toLowerCase().includes(t) ||
      s.lote?.toString().includes(t) ||
      s.funeraria?.toLowerCase().includes(t)
    )
    setDadosFiltrados(filtrado)
  }

  /* AÇÕES */
  const handleInserir = () => navigate("/cadastrar-sepultamento")

  const handleEditar = () => {
    if (!selecionado) return alert("Selecione um registro.")
    navigate("/cadastrar-sepultamento", { state: { registro: selecionado } })
  }

  const handleExcluir = async () => {
    if (!selecionado) return alert("Selecione um registro.")
    const confirmou = window.confirm(`Excluir definitivamente ${selecionado.nome}?`)
    if (!confirmou) return

    const { error } = await supabase.from("sepultamentos").delete().eq("id", selecionado.id)
    if (error) return alert("Erro: " + error.message)

    alert("Registro excluído!")
    setSelecionado(null)
    carregar()
  }

  return (

    <ContainerPagina>
{isMobile ? (

  // 📱 MOBILE (como já estava)
  <>
    <h2 style={{ marginBottom: 5 }}>Sepultamentos</h2>

    <Toolbar
      onInserir={handleInserir}
      onEditar={handleEditar}
      onExcluir={handleExcluir}
      itemSelecionado={selecionado}
      mostrarFiltro={false}
      fixa={true}
    />
  </>

) : (
  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  }}>
    
    <h2 style={{ margin: 0 }}>Sepultamentos</h2>

    <Toolbar
      onInserir={handleInserir}
      onEditar={handleEditar}
      onExcluir={handleExcluir}
      itemSelecionado={selecionado}
      mostrarFiltro={false}
      fixa={false} // importante aqui
    />

  </div>
)}

     <ContainerTabela>
        {isMobile ? (
          <SepultamentoList
            dados={dadosFiltrados}
            selecionado={selecionado}
            onSelecionar={setSelecionado}
            formatarData={formatarData}
          />
        ) : (
          
            <table className="tabela" style={{ minWidth: "max-content", minHeight: "max-content" }}>
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
                  
                  // Lógica baseada no seu código Delphi
                  // Se obito_entregue for falso, usamos um vermelho claro pastel
                  const pendenciaObito = s.obito_entregue === false;
                  
                  // Definição da cor de fundo (Prioridade: Seleção > Pendência > Transparente)
                  let corFundo = "transparent";
                  if (selecionadoLinha) {
                    corFundo = "#ebf8ff";
                  } else if (pendenciaObito) {
                    corFundo = "#fff0f0"; // Vermelho claro suave
                  }

                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelecionado(s)}
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
                      <td>{s.lote}</td>
                      <td>{s.gaveta}</td>
                      <td>{formatarData(s.data_nascimento)}</td>
                      <td>{formatarData(s.data_falecimento)}</td>
                      <td>{formatarData(s.data_sepultamento)}</td>
                      <td>{s.idade}</td>
                      <td>{s.funeraria}</td>
                      <td style={{ fontSize: 11, color: pendenciaObito ? "#c53030" : "#666" }}>
                        {s.observacoes}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
        
        )}
        
      </ContainerTabela>
  
   </ContainerPagina>

 
)

}