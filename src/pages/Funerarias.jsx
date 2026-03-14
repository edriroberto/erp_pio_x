import { useEffect, useState } from "react"
import { supabase } from "../utils/supabaseClient"

export default function Funerarias() {

  const [funerarias, setFunerarias] = useState([])

  useEffect(() => {
    carregar()
  },[])

  async function carregar(){

    const {data,error} = await supabase
      .from("funerarias")
      .select("*")

    if(data) setFunerarias(data)

    console.log(error)
  }

  return (
    <div>

      <h2>Funerárias</h2>


     <div className="tabela-container">

      <table className="tabela">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Contato</th>
            <th>Telefone</th>
          </tr>
        </thead>

        <tbody>
          {funerarias.map(f=>(
            <tr key={f.id}>
              <td>{f.nome}</td>
              <td>{f.contato}</td>
              <td>{f.telefone}</td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
    </div>
  )
}