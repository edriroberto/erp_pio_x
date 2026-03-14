import { useEffect,useState } from "react"
import { supabase } from "../utils/supabaseClient"
import Toolbar from "../components/Toolbar"
import "../styles/tabela.css"
import "../components/ContainerTabela"
import ContainerTabela from "../components/ContainerTabela"
export default function Sepultamentos(){

  const [dados,setDados] = useState([])

  useEffect(()=>{
    carregar()
  },[])

  async function carregar(){

    const {data} = await supabase
      .from("vw_sepultamentos_v1")
      .select("*")
      .order("data_sepultamento", { ascending:false })

    if(data) setDados(data)

  }
function formatarData(data){

    if(!data) return ""

    const partes = data.split("-")

    return `${partes[2]}-${partes[1]}-${partes[0]}`
  }
  return(

    <div>

     <h1><Toolbar /></h1> 

      <ContainerTabela>

        
        <div className="tabela-container">

      <table className="tabela">

        <thead>

          <tr>
                
            <th style={{width:300}}>Nome</th>
            <th style={{width:140}}>Quadra</th>
            <th style={{width:70}}>Lote</th>
            <th style={{width:45}}>Gaveta</th>
            <th style={{width:90}}>Nascimento</th>
            <th style={{width:90}}>Falecimento</th>
            <th style={{width:180}}>Funerária</th>
            <th style={{width:240}}>Observações</th>
          </tr>

        </thead>

        <tbody>

          {dados.map(s=>(

            <tr key={s.id}>

              <td style={{ fontSize: '12px', color: '#666' }}>{s.nome}</td>
              <td>{s.quadra}</td> 
              <td style={{width:80}}>{s.lote}</td>
              <td>{s.gaveta}</td>
              <td>{formatarData(s.data_nascimento)}</td>
              <td>{formatarData(s.data_falecimento)}</td>
              <td>{s.funeraria}</td>
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