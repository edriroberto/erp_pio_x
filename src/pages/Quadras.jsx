import { useEffect, useState, useRef } from "react"
import { supabase } from "../utils/supabaseClient"

export default function Quadras() {

  const [quadras, setQuadras] = useState([])
  const [lotes, setLotes] = useState([])
  const [quadraSelecionada, setQuadraSelecionada] = useState(null)

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  const lotesScrollRef = useRef(null)

  useEffect(() => {

    carregarQuadras()

    const resize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener("resize", resize)

    return () => window.removeEventListener("resize", resize)

  }, [])


  async function carregarQuadras(){

    const { data, error } = await supabase
      .from("quadras")
      .select("*")
      .order("nome")

    if(error) return console.error(error)

    setQuadras(data || [])

  }


  async function carregarLotes(q){

    setQuadraSelecionada(q)

    const { data, error } = await supabase
      .from("lotes")
      .select(`
        id,
        numero,
        tipos_lote (
          descricao
        )
      `)
      .eq("quadra_id", q.id)
      .order("numero")

    if(error) return console.error(error)

    setLotes(data || [])

    // volta o scroll para o topo
    if(lotesScrollRef.current){
      lotesScrollRef.current.scrollTop = 0
    }

  }


  return(

    <div
      style={{
        padding: isMobile ? 5 : 5,
        background:"#f2f2f7",
        display:"flex",
        flexDirection: isMobile ? "column" : "row",
        gap:10,
        height:"100%"
      }}
    >


      {/* COLUNA QUADRAS */}

      <div
        style={{
          flex: isMobile ? "0 0 auto" : 1,
          background:"#fff",
          borderRadius:12,
          padding:15,
          display:"flex",
          flexDirection:"column",
          minHeight: isMobile ? 200 : 0
          
        }}
      >

        <h2>Quadras</h2>

        <div
          style={{
            overflowY:"auto",
            flex:1,
            maxHeight: isMobile ? 180 : "100%",
            marginTop: "-10px"
          }}
        >

          <table className="tabela">

            <thead>
              <tr>
                <th>Nome</th>
              </tr>
            </thead>

            <tbody>

              {quadras.map(q => {

                const selecionada = quadraSelecionada?.id === q.id

                return (

                  <tr
                    key={q.id}
                    onClick={()=>carregarLotes(q)}
                    style={{
                      cursor:"pointer",
                      background: selecionada ? "#e8f2ff" : "transparent",
                      fontWeight: selecionada ? "600" : "normal",
                      color: selecionada ? "#1a73e8" : "inherit"
                    }}
                  >

                    <td>{q.nome}</td>

                  </tr>

                )

              })}

            </tbody>

          </table>

        </div>

      </div>



      {/* COLUNA LOTES */}

      <div
        style={{
          flex:2,
          background:"#fff",
          borderRadius:12,
          padding:16,
          display:"flex",
          flexDirection:"column",
          minHeight:0
          
        }}
      >

        <h2 style={{marginBottom:5}}>
          {quadraSelecionada
            ? `Lotes de ${quadraSelecionada.nome}`
            : "Selecione uma quadra"}
        </h2>


        {quadraSelecionada && (

          <div
            ref={lotesScrollRef}
            style={{
              overflowY:"auto",
              flex:1
            }}
          >

            <table className="tabela">

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

          </div>

        )}

      </div>


    </div>

  )

}