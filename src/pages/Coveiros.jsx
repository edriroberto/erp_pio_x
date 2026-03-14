import { useEffect, useState } from "react"
import { supabase } from "../utils/supabaseClient"

export default function Coveiros() {

  const [coveiros,setCoveiros] = useState([])

  useEffect(() => {
    carregar()
  },[])

  async function carregar(){

    const {data,error} = await supabase
      .from("coveiros")
      .select("*")

    if(data) setCoveiros(data)

    console.log(error)
  }

  return (
    <div>

      <h2>Coveiros</h2>


     <div className="tabela-container">

      <table className="tabela">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Contato</th>
          </tr>
        </thead>

        <tbody>
          {coveiros.map(c=>(
            <tr key={c.id}>
              <td>{c.nome}</td>
              <td>{c.telefone}</td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
    </div>
  )
}