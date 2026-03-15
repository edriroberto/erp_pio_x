import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../utils/supabaseClient"
import Toolbar from "../components/Toolbar"
import ContainerTabela from "../components/ContainerTabela"
import "../styles/tabela.css"

export default function Sepultamentos() {

  const [dados, setDados] = useState([])
  const [selecionado, setSelecionado] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  const navigate = useNavigate()


  /* ---------------- RESPONSIVIDADE ---------------- */

  useEffect(() => {

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)

  }, [])


  /* ---------------- CARREGAR DADOS ---------------- */

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
    }
  }


  /* ---------------- REGRAS DE NEGÓCIO ---------------- */

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


  /* ---------------- AÇÕES DA TOOLBAR ---------------- */

  const handleInserir = () => {
    navigate("/cadastrar-sepultamento")
  }

  const handleEditar = () => {

    if (!selecionado) {
      alert("Selecione um registro para editar.")
      return
    }

    navigate("/cadastrar-sepultamento", {
      state: { registro: selecionado }
    })
  }


  const handleExcluir = async () => {

    if (!selecionado) {
      alert("Selecione um registro para excluir.")
      return
    }

    const confirmou = window.confirm(
      `⚠️ DESEJA EXCLUIR DEFINITIVAMENTE: ${selecionado.nome}?`
    )

    if (!confirmou) return

    const { error } = await supabase
      .from("sepultamentos")
      .delete()
      .eq("id", selecionado.id)

    if (error) {
      alert("Erro ao excluir: " + error.message)
      return
    }

    alert("Registro removido com sucesso!")

    setSelecionado(null)

    carregar()
  }


  /* ---------------- CARD MOBILE ---------------- */

  const CartaoMobile = ({ s }) => {

    const isSelected = selecionado?.id === s.id

    return (

      <div
        onClick={() => setSelecionado(s)}
        style={{
          background: "#fff",
          borderRadius: "10px",
          padding: "15px",
          marginBottom: "12px",
          borderLeft: isSelected
            ? "6px solid #3498db"
            : "6px solid #2f3542",
          boxShadow: isSelected
            ? "0 4px 12px rgba(52,152,219,0.25)"
            : "0 2px 4px rgba(0,0,0,0.05)",
          transform: isSelected ? "scale(1.01)" : "scale(1)",
          transition: "all .2s",
          cursor: "pointer"
        }}
      >

        <div style={{
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 5
        }}>
          {s.nome}
        </div>

        <div style={{
          fontSize: 13,
          color: "#666",
          marginBottom: 8
        }}>
          📅 {formatarData(s.data_sepultamento)} | 🎂 {s.idade} anos
        </div>

        <div style={{
          padding: "8px 0",
          borderTop: "1px solid #eee"
        }}>
          <strong>LOCAL:</strong> Q:{s.quadra} - L:{s.lote} - G:{s.gaveta}
        </div>

        <div style={{
          fontSize: 13,
          color: "#555"
        }}>
          Funerária: {s.funeraria}
        </div>

      </div>
    )
  }


  /* ---------------- RENDER ---------------- */

  return (

    <div style={{ padding: "0 10px" }}>

      <Toolbar
        onInserir={handleInserir}
        onEditar={handleEditar}
        onExcluir={handleExcluir}
        itemSelecionado={selecionado}
      />

      <ContainerTabela>

        {isMobile ? (

          <div style={{ paddingBottom: 20 }}>
            {dados.map(s => (
              <CartaoMobile key={s.id} s={s} />
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

                {dados.map((s) => {

                  const isSelected = selecionado?.id === s.id

                  return (

                    <tr
                      key={s.id}
                      onClick={() => setSelecionado(s)}
                      style={{
                        cursor: "pointer",
                        backgroundColor: isSelected
                          ? "#ebf8ff"
                          : "transparent",
                        color: isSelected
                          ? "#2b6cb0"
                          : "inherit",
                        fontWeight: isSelected
                          ? 600
                          : 400
                      }}
                      className="linha-tabela"
                    >

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

                  )
                })}

              </tbody>

            </table>

          </div>

        )}

      </ContainerTabela>


      <style>{`
        .linha-tabela:hover {
          background-color: #f7fafc !important;
        }
      `}</style>

    </div>
  )
}