import { useEffect, useState } from "react"
import { supabase } from "../utils/supabaseClient"
import QuadraCard from "../components/QuadraCard"
import LoteCard from "../components/LoteCard"

export default function Quadras() {
  const [quadras, setQuadras] = useState([])
  const [lotes, setLotes] = useState([])
  const [quadraSelecionada, setQuadraSelecionada] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    carregarQuadras()
    const resize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [])

  async function carregarQuadras() {
    const { data, error } = await supabase
      .from("quadras")
      .select("*")
      .order("nome")
    if (error) return console.error(error)
    setQuadras(data || [])
  }

  async function carregarLotes(q) {
    setQuadraSelecionada(q)
    const { data, error } = await supabase
      .from("lotes")
      .select(`id, numero, tipo_id, tipos_lote ( descricao )`)
      .eq("quadra_id", q.id)
      .order("numero")
    if (error) return console.error(error)
    setLotes(data || [])
  }

  return (
    <div style={{
      padding: isMobile ? 12 : 20,
      background: "#f2f2f7",
      flex: 1,
      minHeight: 0,
      overflow: "hidden",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: 20
    }}>

      {/* COLUNA DE QUADRAS */}
      <div className="coluna-scroll-container" style={{ flex: 1, background: "#fff", borderRadius: 12, padding: "0 20px 20px 20px" }}>
  <h2 className="titulo-fixo">Quadras</h2>
  
  {!isMobile && (
    <table className="tabela-container">
      <thead>
        <tr>
          <th>Nome</th>
        </tr>
      </thead>
      <tbody>
        {quadras.map(q => (
          <tr key={q.id} onClick={() => carregarLotes(q)} style={{ cursor: "pointer" }}>
            <td>Quadra {q.nome}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>

{/* COLUNA DE LOTES */}
<div className="coluna-scroll-container" style={{ flex: 2, background: "#fff", borderRadius: 12, padding: "0 20px 20px 20px" }}>
  <h2 className="titulo-fixo">
    {quadraSelecionada ? `Lotes de ${quadraSelecionada.nome}` : "Selecione uma quadra"}
  </h2>

  {quadraSelecionada && !isMobile && (
    <table className="tabela-container">
      <thead>
        <tr>
          <th>Lote</th>
          <th>Tipo</th>
        </tr>
      </thead>
      <tbody>
        {lotes.map(l => (
          <tr key={l.id}>
            <td>{l.numero}</td>
            <td>{l.tipos_lote?.descricao}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>
</div>
  )
}