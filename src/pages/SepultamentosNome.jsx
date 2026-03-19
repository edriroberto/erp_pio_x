import { useState, useEffect } from "react"
import { supabase } from "../utils/supabaseClient"
import ContainerPagina from "../components/ContainerPagina";
import ContainerTabela from "../components/ContainerTabela";
import "../styles/tabela.css"

export default function SepultamentosPorNome() {
  const [busca, setBusca] = useState("")
  const [dados, setDados] = useState([])
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    buscar()
  }, [busca])

  function calcularIdade(dataNasc, dataFalec) {
    if (!dataNasc || !dataFalec) return "N/A"
    const nasc = new Date(dataNasc)
    const falec = new Date(dataFalec)
    let idade = falec.getFullYear() - nasc.getFullYear()
    const m = falec.getMonth() - nasc.getMonth()
    if (m < 0 || (m === 0 && falec.getDate() < nasc.getDate())) idade--
    return idade
  }

  async function buscar() {
    let query = supabase.from("vw_sepultamentos_v1").select("*").order("nome")
    if (busca.trim() !== "") {
      query = query.ilike("nome", `%${busca}%`)
    }
    const { data, error } = await query
    if (error) {
      console.error("Erro na busca:", error.message)
      return
    }
    if (data) {
      const dadosComIdade = data.map(s => ({
        ...s,
        idade: calcularIdade(s.data_nascimento, s.data_falecimento)
      }))
      setDados(dadosComIdade)
    }
  }

  function formatarData(data) {
    if (!data) return ""
    const partes = data.split("-")
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  const CartaoMobileBusca = ({ s }) => {
    const pendencia = s.obito_entregue === false;
    return (
      <div style={{
        background: "#fff",
        borderRadius: "8px",
        padding: "15px",
        marginBottom: "12px",
        borderLeft: `6px solid ${pendencia ? "#e53e3e" : "#aa3bff"}`,
        backgroundColor: pendencia ? "#fff5f5" : "#fff",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
      }}>
        <div style={{ fontSize: "17px", fontWeight: "bold", marginBottom: "4px" }}>
          {pendencia && <span style={{ marginRight: 5 }}>⚠️</span>}
          {s.nome}
        </div>
        <div style={{ fontSize: "13px", color: "#6b6375", marginBottom: "6px" }}>
          <strong>LOCAL:</strong> {s.quadra} - <strong>LOTE:</strong> {s.lote}
        </div>
        <div style={{ fontSize: "13px", display: "flex", justifyContent: "space-between" }}>
          <span>Falecimento: {formatarData(s.data_falecimento)}</span>
          <span>Idade: <strong>{s.idade}</strong></span>
        </div>
      </div>
    )
  }

  return (
    <ContainerPagina titulo="Consulta por Nome">
            
      <div className="header-busca" style={{ flex: "0 0 auto" }}>
        <input
          type="text"
          placeholder="DIGITE O NOME..."
          value={busca}
          onChange={(e) => setBusca(e.target.value.toUpperCase())}
          style={{ padding: "12px", width: isMobile ? "100%" : "320px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "16px", textTransform: "uppercase" }}
        />
        <span style={{ fontSize: 14, color: "#666", fontWeight: 500, marginLeft: "15px" }}>
          {dados.length} registros encontrados
        </span>
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
                  <th style={{ width: 300 }}>Nome</th>
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
                  return (
                    <tr 
                      key={s.id} 
                      style={{ 
                        backgroundColor: pendencia ? "#fff0f0" : "transparent",
                        color: pendencia ? "#c53030" : "inherit" // Texto em vermelho escuro se pendente
                      }}
                    >
                      <td style={{ fontWeight: 600 }}>
                        {pendencia && <span style={{ marginRight: 5 }}>⚠️</span>}
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
                      <td style={{ fontSize: 12, color: pendencia ? "#c53030" : "#666" }}>{s.observacoes}</td>
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