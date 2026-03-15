import { useState, useEffect } from "react"
import { supabase } from "../utils/supabaseClient"
import ContainerTabela from "../components/ContainerTabela"
import "../styles/tabela.css"

export default function SepultamentosPorNome() {

  const [busca, setBusca] = useState("")
  const [dados, setDados] = useState([])
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  // controle responsivo
  useEffect(() => {

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)

  }, [])

  // busca sempre que o nome mudar
  useEffect(() => {
    buscar()
  }, [busca])


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


  async function buscar() {

    let query = supabase
      .from("vw_sepultamentos_v1")
      .select("*")
      .order("nome")

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


  // Card mobile
  const CartaoMobileBusca = ({ s }) => (

    <div style={{
      background: "#fff",
      borderRadius: "8px",
      padding: "15px",
      marginBottom: "12px",
      borderLeft: "6px solid #aa3bff",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
    }}>

      <div style={{
        fontSize: "17px",
        fontWeight: "bold",
        marginBottom: "4px"
      }}>
        {s.nome}
      </div>

      <div style={{
        fontSize: "13px",
        color: "#6b6375",
        marginBottom: "6px"
      }}>
        <strong>LOCAL:</strong> {s.quadra} - <strong>LOTE:</strong> {s.lote}
      </div>

      <div style={{
        fontSize: "13px",
        display: "flex",
        justifyContent: "space-between"
      }}>
        <span>Falecimento: {formatarData(s.data_falecimento)}</span>
        <span>Idade: <strong>{s.idade}</strong></span>
      </div>

    </div>
  )


  return (

    <div style={{ padding: isMobile ? "10px" : "5px" }}>

      <h2 style={{ marginBottom: 15 }}>
        Consultar por Nome
      </h2>


      {/* BUSCA */}

      <div style={{
        marginBottom: 20,
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        gap: 10,
        flexWrap: "wrap"
      }}>

        <input
          type="text"
          placeholder="DIGITE O NOME..."
          value={busca}
          onChange={(e) => setBusca(e.target.value.toUpperCase())}
          style={{
            padding: "12px",
            width: isMobile ? "100%" : "320px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "16px",
            textTransform: "uppercase"
          }}
        />

        <span style={{
          fontSize: 14,
          color: "#666",
          fontWeight: 500
        }}>
          {dados.length} registros encontrados
        </span>

      </div>



      <ContainerTabela>

        {isMobile ? (

          <div style={{ paddingBottom: "80px" }}>
            {dados.map(s => (
              <CartaoMobileBusca key={s.id} s={s} />
            ))}
          </div>

        ) : (

          <div className="tabela-container">

            <table className="tabela">

              <thead>

                <tr>

                  <th style={{ width: 300 }}>Nome</th>

                  <th style={{ width: 120 }}>Quadra</th>

                  <th style={{ width: 80 }}>Lote</th>

                  <th style={{ width: 100 }}>Gaveta</th>

                  <th style={{ width: 110 }}>Nascimento</th>

                  <th style={{ width: 110 }}>Falecimento</th>

                  <th style={{ width: 110 }}>Sepultamento</th>

                  <th style={{ width: 70 }}>Idade</th>

                  <th style={{ width: 120 }}>Funerária</th>

                  <th style={{ width: 350 }}>Observações</th>

                </tr>

              </thead>

              <tbody>

                {dados.map((s) => (

                  <tr key={s.id}>

                    <td style={{ fontWeight: 500 }}>{s.nome}</td>

                    <td>{s.quadra}</td>

                    <td>{s.lote}</td>

                    <td>{s.gaveta}</td>

                    <td>{formatarData(s.data_nascimento)}</td>

                    <td>{formatarData(s.data_falecimento)}</td>

                    <td>{formatarData(s.data_sepultamento)}</td>

                    <td>{s.idade}</td>

                    <td>{s.funeraria}</td>

                    <td style={{ fontSize: 12, color: "#666" }}>
                      {s.observacoes}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </ContainerTabela>

    </div>
  )
}