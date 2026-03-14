import { useState, useEffect } from "react"
import { supabase } from "../utils/supabaseClient"
import ContainerTabela from "../components/ContainerTabela"
import "../styles/tabela.css"

export default function SepultamentosPorNome() {
  const [busca, setBusca] = useState("")
  const [dados, setDados] = useState([])

  // Dispara a busca sempre que o texto mudar
  useEffect(() => {
    buscar()
  }, [busca])

  async function buscar() {
    let query = supabase
      .from("vw_sepultamentos_v1")
      .select("*")
      .order("nome")
      //.limit(100) // Aumentei o limite para a listagem inicial ser generosa

    // Se houver texto, aplica o filtro LIKE (ilike)
    if (busca.trim() !== "") {
      query = query.ilike("nome", `%${busca}%`)
    }

    const { data, error } = await query

    if (data) setDados(data)
    if (error) console.error("Erro na busca:", error.message)
  }

  function formatarData(data) {
    if (!data) return ""
    const partes = data.split("-")
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  return (
    <div>
      <h2>Consultar por Nome</h2>

      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 15 }}>
        <input
          type="text"
          placeholder="DIGITE O NOME..."
          style={{
            padding: "8px 12px",
            width: "400px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "16px",
            textTransform: "uppercase" // Faz o texto aparecer em maiúsculo visualmente
          }}
          value={busca}
          // Transforma o valor em UpperCase antes de salvar no estado
          onChange={(e) => setBusca(e.target.value.toUpperCase())} 
          autoFocus // Já abre com o cursor pronto para digitar
        />
        
        <span style={{ color: "#666", fontSize: 14 }}>
          {dados.length} registros exibidos
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