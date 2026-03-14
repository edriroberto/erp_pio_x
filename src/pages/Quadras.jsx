import { useEffect, useState } from "react"
import { supabase } from "../utils/supabaseClient"

export default function Quadras() {

  const [quadras,setQuadras] = useState([])
  const [lotes,setLotes] = useState([])
  const [quadraSelecionada,setQuadraSelecionada] = useState(null)

  useEffect(()=>{
    carregarQuadras()
  },[])

  async function carregarQuadras(){

    const {data,error} = await supabase
      .from("quadras")
      .select("*")

    if(data) setQuadras(data)

    console.log(error)
  }

  async function carregarLotes(q){

    setQuadraSelecionada(q)

    const {data,error} = await supabase
      .from("lotes")
      .select("*")
      .eq("quadra_id", q.id)

    if(data) setLotes(data)

    console.log(error)
  }

  return (

    <div style={{display:"flex", gap:40}}>

      {/* QUADRAS */}

      <div>

        <h2>Quadras</h2>

        <table border="1" cellPadding="10">

          <thead>
            <tr>
              <th>Nome</th>
            </tr>
          </thead>

          <tbody>

            {quadras.map(q=>(

              <tr
                key={q.id}
                onClick={()=>carregarLotes(q)}
                style={{
                  cursor:"pointer",
                  background:
                    quadraSelecionada?.id === q.id
                      ? "#d0e4ff"
                      : "white"
                }}
              >

                <td>{q.nome}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>


      {/* LOTES */}

      <div>

        <h2>
          {quadraSelecionada
            ? `Lotes da ${quadraSelecionada.nome}`
            : "Selecione uma quadra"}
        </h2>

        {quadraSelecionada && (

          <table border="1" cellPadding="10">

            <thead>
              <tr>
                <th>Número</th>
              </tr>
            </thead>

            <tbody>

              {lotes.map(l=>(
                <tr key={l.id}>
                  <td>{l.numero}</td>
                </tr>
              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>

  )

}