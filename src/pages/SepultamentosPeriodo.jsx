import { useState, useEffect } from "react"
import { supabase } from "../utils/supabaseClient"
import "../styles/tabela.css"
import ContainerTabela from "../components/ContainerTabela"

export default function SepultamentosPeriodo() {
  const [dataDe, setDataDe] = useState("")
  const [dataAte, setDataAte] = useState("")
  const [dados, setDados] = useState([])

  useEffect(() => {
    // 1. Definir o período padrão (Últimos 3 meses)
    const hoje = new Date()
    const tresMesesAtras = new Date()
    tresMesesAtras.setMonth(hoje.getMonth() - 3)

    // 2. Formatar para o padrão do input date (YYYY-MM-DD)
    const dataFim = hoje.toISOString().split("T")[0]
    const dataInicio = tresMesesAtras.toISOString().split("T")[0]

    // 3. Atualizar os estados para o usuário ver o filtro aplicado
    setDataDe(dataInicio)
    setDataAte(dataFim)

    // 4. Carregar os dados iniciais com esse filtro
    carregarInicial(dataInicio, dataFim)
  }, [])

  async function carregarInicial(inicio, fim) {
    const { data, error } = await supabase
      .from("vw_sepultamentos_v1")
      .select("*")
      .gte("data_falecimento", inicio)
      .lte("data_falecimento", fim)
      .order("nome", { ascending: true })

    if (data) setDados(data)
    if (error) console.error(error)
  }

  async function buscarPorPeriodo() {
    if (!dataDe || !dataAte) return

    const { data, error } = await supabase
      .from("vw_sepultamentos_v1")
      .select("*")
      .gte("data_falecimento", dataDe)
      .lte("data_falecimento", dataAte)
      .order("nome", { ascending: true })

    if (data) setDados(data)
  }

  function formatarData(data) {
    if (!data) return ""
    const partes = data.split("-")
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Sepultamentos por período</h2>
        <p style={{ fontSize: "14px", color: "#666" }}>
          Exibindo registros de {formatarData(dataDe)} até {formatarData(dataAte)}
        </p>
      </div>

      <div style={{ 
        marginBottom: 10, 
        display: "flex", 
        alignItems: "center", 
        gap: 10,
        background: "#f9f9f9",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #eee"
      }}>
        <label>De:</label>
        <input
          type="date"
          value={dataDe}
          onChange={(e) => setDataDe(e.target.value)}
          style={{ padding: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
        />

        <label style={{ marginLeft: 10 }}>Até:</label>
        <input
          type="date"
          value={dataAte}
          onChange={(e) => setDataAte(e.target.value)}
          style={{ padding: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
        />

        <button
          onClick={buscarPorPeriodo}
          style={{
            marginLeft: 20,
            padding: "8px 20px",
            backgroundColor: "#2c3e50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Filtrar Período
        </button>

        <span style={{ marginLeft: "auto", fontWeight: "bold", color: "#2c3e50" }}>
          {dados.length} registros encontrados
        </span>
      </div>

      <ContainerTabela>
        <div className="tabela-container">
          <table className="tabela">
            <thead>
              <tr>
                <th style={{ width: 300 }}>Nome</th>
                <th style={{ width: 140 }}>Quadra</th>
                <th style={{ width: 80 }}>Lote</th>
                <th style={{ width: 50 }}>Gaveta</th>
                <th style={{ width: 100 }}>Falecimento</th>
                <th style={{ width: 250 }}>Observações</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((s) => (
                <tr key={s.id}>
                  <td>{s.nome}</td>
                  <td>{s.quadra}</td>
                  <td>{s.lote}</td>
                  <td>{s.gaveta}</td>
                  <td>{formatarData(s.data_falecimento)}</td>
                  <td style={{ fontSize: '12px', color: '#666' }}>{s.observacoes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContainerTabela>
    </div>
  )
}