import { useState, useEffect } from "react"
import { supabase } from "../utils/supabaseClient"
import "../styles/tabela.css"
import ContainerTabela from "../components/ContainerTabela"

export default function SepultamentosPeriodo() {
  const [dataDe, setDataDe] = useState("")
  const [dataAte, setDataAte] = useState("")
  const [dados, setDados] = useState([])
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener("resize", handleResize)
    const hoje = new Date()
    const tresMesesAtras = new Date()
    tresMesesAtras.setMonth(hoje.getMonth() - 3)
    const dataFim = hoje.toISOString().split("T")[0]
    const dataInicio = tresMesesAtras.toISOString().split("T")[0]
    setDataDe(dataInicio); setDataAte(dataFim)
    carregarDados(dataInicio, dataFim)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  function calcularIdade(dataNasc, dataFalec) {
    if (!dataNasc || !dataFalec) return "N/A"
    const nasc = new Date(dataNasc); const falec = new Date(dataFalec)
    let idade = falec.getFullYear() - nasc.getFullYear()
    const m = falec.getMonth() - nasc.getMonth()
    if (m < 0 || (m === 0 && falec.getDate() < nasc.getDate())) idade--
    return idade
  }

  async function carregarDados(inicio, fim) {
    const { data, error } = await supabase
      .from("vw_sepultamentos_v1")
      .select("*")
      .gte("data_falecimento", inicio)
      .lte("data_falecimento", fim)
      .order("nome", { ascending: true })

    if (data) {
      setDados(data.map(s => ({ ...s, idade: calcularIdade(s.data_nascimento, s.data_falecimento) })))
    }
    if (error) console.error(error)
  }

  const CartaoMobilePeriodo = ({ s }) => {
    const pendencia = s.obito_entregue === false;
    return (
      <div style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '15px',
        borderLeft: `6px solid ${pendencia ? "#e53e3e" : "#2c3e50"}`,
        backgroundColor: pendencia ? "#fff5f5" : "#fff",
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#08060d', marginBottom: '4px' }}>
          {pendencia && <span style={{ marginRight: 5 }}>⚠️</span>}
          {s.nome}
        </div>
        <div style={{ fontSize: '13px', color: '#6b6375', marginBottom: '6px' }}>
          <strong>LOCAL:</strong> {s.quadra} - <strong>LOTE:</strong> {s.lote}
        </div>
        <div style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Falecimento: {formatarData(s.data_falecimento)}</span>
          <span>Idade: <strong>{s.idade} anos</strong></span>
        </div>
      </div>
    )
  }

  function formatarData(data) {
    if (!data) return ""
    const partes = data.split("-")
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  return (
    <div style={{ padding: isMobile ? '10px' : '5px' }}>
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>Por período</h3>
        <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>{formatarData(dataDe)} até {formatarData(dataAte)}</p>
      </div>

      <div style={{ marginBottom: 15, display: "flex", flexDirection: isMobile ? "column" : "row", gap: 15, background: "#f9f9f9", padding: "10px", borderRadius: "8px", border: "1px solid #eee" }}>
        <div style={{ display: 'flex', gap: 15 }}>
          <input type="date" value={dataDe} onChange={(e) => setDataDe(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
          <input type="date" value={dataAte} onChange={(e) => setDataAte(e.target.value)} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
        </div>
        <button onClick={() => carregarDados(dataDe, dataAte)} style={{ padding: "8px 20px", backgroundColor: "#2c3e50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
          Filtrar
        </button>
      </div>

      <ContainerTabela>
        {isMobile ? (
          <div style={{ paddingBottom: '80px' }}>
            <div style={{ textAlign: 'right', fontSize: 13, color: '#666', marginBottom: 10 }}>{dados.length} registros</div>
            {dados.map(s => <CartaoMobilePeriodo key={s.id} s={s} />)}
          </div>
        ) : (
          <div className="tabela-container">
            <table className="tabela">
              <thead>
                <tr>
                  <th style={{ width: '300px' }}>Nome</th>
                  <th>Quadra</th>
                  <th>Lote</th>
                  <th>Gaveta</th>
                  <th>Falecimento</th>
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
                      color: pendencia ? "#c53030" : "inherit" 
                    }}
                    >
                      <td style={{ fontWeight: '600' }}>
                        {pendencia && <span style={{ marginRight: 5 }}>⚠️</span>}
                        {s.nome}
                      </td>
                      <td>{s.quadra}</td>
                      <td>{s.lote}</td>
                      <td>{s.gaveta}</td>
                      <td>{formatarData(s.data_falecimento)}</td>
                      <td>{s.idade}</td>
                      <td>{s.funeraria}</td>
                      <td style={{ fontSize: '12px', color: pendencia ? "#c53030" : "#666" }}>{s.observacoes}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </ContainerTabela>
    </div>
  )
}