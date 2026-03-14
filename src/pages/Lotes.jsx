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

      <h1>Coveiros</h1>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
          </tr>
        </thead>

        <tbody>
          {coveiros.map(c=>(
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.nome}</td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  )
}