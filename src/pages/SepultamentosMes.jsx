import { useState, useEffect } from "react"
import { supabase } from "../utils/supabaseClient"
import "../styles/tabela.css"
import "../components/ContainerTabela"
import ContainerTabela from "../components/ContainerTabela"
export default function SepultamentosMes(){

  const hoje = new Date()

  const [mes,setMes] = useState(
    String(hoje.getMonth()+1).padStart(2,"0")
  )

  const [ano,setAno] = useState(
    hoje.getFullYear()
  )

  const [dados,setDados] = useState([])

  useEffect(()=>{
    buscar()
  },[])

  async function buscar(){

    // Substitua as linhas dataInicio e dataFim por isso:
const ultimoDia = new Date(ano, mes, 0).getDate(); // O dia "0" do mês seguinte é o último do mês atual
const dataInicio = `${ano}-${mes}-01`;
const dataFim = `${ano}-${mes}-${ultimoDia}`;
    
    const {data,error} = await supabase
      .from("vw_sepultamentos_v1")
      .select("*")
      .gte("data_falecimento", dataInicio)
      .lte("data_falecimento", dataFim)
      .order("nome")
      {/*.order("data_falecimento", { ascending:false }) */}
      

    if(data) setDados(data)

    console.log(error)
  }

  function formatarData(data){

    if(!data) return ""

    return new Date(data).toLocaleDateString("pt-BR")

  }

  return(

   
    <div>

      <h2>Sepultamentos por mês</h2>

      <div style={{marginBottom:20}}>

        <select value={mes} onChange={e=>setMes(e.target.value)}>

          <option value="01">Janeiro</option>
          <option value="02">Fevereiro</option>
          <option value="03">Março</option>
          <option value="04">Abril</option>
          <option value="05">Maio</option>
          <option value="06">Junho</option>
          <option value="07">Julho</option>
          <option value="08">Agosto</option>
          <option value="09">Setembro</option>
          <option value="10">Outubro</option>
          <option value="11">Novembro</option>
          <option value="12">Dezembro</option>

        </select>

        <input
          style={{marginLeft:10}}
          value={ano}
          onChange={e=>setAno(e.target.value)}
        />

        <button
          style={{marginLeft:10}}
          onClick={buscar}
        >
          Buscar
        </button>

      </div>
<ContainerTabela>


    <div className="tabela-container">

      <table className="tabela">

        <thead>

          <tr>
            <th style={{width:300}}>Nome</th>
            <th style={{width:140}}>Quadra</th>
            <th style={{width:80}}>Lote</th>
            <th style={{width:50}}>Gaveta</th>
            <th style={{width:100}}>Nascimento</th>
            <th style={{width:100}}>Falecimento</th>
            <th style={{width:100}}>Funerária</th>
            <th style={{width:250}}>Observações</th>
          </tr>

        </thead>

        <tbody>

          {dados.map(s=>(

            <tr key={s.id}>


              <td>{s.nome}</td>
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