import { useState, useEffect } from "react"
import { supabase } from "../utils/supabaseClient"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts"

import ContainerTabela from "../components/ContainerTabela"
import DashboardCard from "../components/DashboardCard"

export default function Dashboard(){

const [grafico,setGrafico] = useState([])
const [ultimos,setUltimos] = useState([])

const [totais,setTotais] = useState({
  sepultamentos:0,
  falecimentos:0,
  pendentes:0
})

const [isMobile,setIsMobile] = useState(window.innerWidth <= 768)

const CORES = [
"#4a90e2","#f5a623","#f35d22","#50e3c2",
"#34a853","#ea4335","#fbbc05","#607d8b",
"#9c27b0","#ff6b6b","#00bcd4","#795548"
]

useEffect(()=>{

carregar()

const resize = ()=> setIsMobile(window.innerWidth <=768)

window.addEventListener("resize",resize)

return ()=> window.removeEventListener("resize",resize)

},[])


async function carregar(){

try{

const [
g,
s,
f,
p,
l
] = await Promise.all([

supabase.from("vw_dash_sepultamentos_12_meses").select("*"),

supabase.from("vw_dash_sepultamentos_mes").select("total").single(),

supabase.from("vw_dash_falecimentos_mes").select("total").single(),

supabase.from("vw_dash_obitos_pendentes").select("total").single(),

supabase
.from("vw_sepultamentos_v1")
.select("*")
.order("data_falecimento",{ascending:false})
.limit(10)

])

/* gráfico */

if(g.data){

const dados = g.data.map((item,index)=>{

const [ano,mes] = item.mes.split("-")
const data = new Date(ano,mes-1)

return{
mes:data.toLocaleDateString("pt-BR",{month:"short"}),
total:item.total,
cor: CORES[index % CORES.length]
}

})

setGrafico(dados)

}

/* cards */

setTotais({

sepultamentos:s.data?.total || 0,
falecimentos:f.data?.total || 0,
pendentes:p.data?.total || 0

})

/* tabela */

setUltimos(l.data || [])

}catch(e){

console.error("Erro dashboard:",e)

}

}

function formatar(data){

if(!data) return ""

const p = data.split("-")

return `${p[2]}/${p[1]}/${p[0]}`

}

return(

<div style={{
display:"flex",
flexDirection:"column",
height:"100%",
padding:isMobile ? 12 : 20,
background:"#f5f6fa",
fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto'
}}>

<h2 style={{marginBottom:20}}>Dashboard</h2>


{/* CARDS */}

<div style={{
display:"grid",
gridTemplateColumns:isMobile ? "1fr" : "repeat(3,1fr)",
gap:14,
marginBottom:20
}}>

<DashboardCard
titulo="Sepultamentos"
valor={totais.sepultamentos}
/>

<DashboardCard
titulo="Falecimentos"
valor={totais.falecimentos}
/>

<DashboardCard
titulo="Óbitos Pendentes"
valor={totais.pendentes}
cor="#ff6b6b"
/>

</div>


{/* CONTAINER COM ROLAGEM */}

<div
  style={{
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    overflowX: "hidden",
    paddingRight: 6
  }}
>

{/* GRAFICO */}

<div style={{
background:"#fff",
borderRadius:14,
padding:16,
marginBottom:25,
boxShadow:"0 2px 6px rgba(0,0,0,0.06)"
}}>

<h4 style={{marginBottom:10}}>
Sepultamentos últimos 12 meses
</h4>

<div style={{height:220}}>

<ResponsiveContainer width="100%" height="100%">

<BarChart data={grafico}>

<CartesianGrid strokeDasharray="3 3" vertical={false}/>

<XAxis dataKey="mes"/>

<YAxis/>

<Tooltip/>

<Bar dataKey="total" radius={[6,6,0,0]}>

{grafico.map((entry,index)=>(
<Cell key={index} fill={entry.cor}/>
))}

</Bar>

</BarChart>

</ResponsiveContainer>

</div>

</div>


{/* TABELA */}

<h3 style={{marginBottom:10}}>
Últimos Sepultamentos
</h3>

<ContainerTabela>

<table className="tabela">

<thead>

<tr>

<th>Nome</th>
<th>Quadra</th>
<th>Lote</th>
<th>Falecimento</th>
<th>Sepultamento</th>
<th>Funerária</th>
<th>Status</th>

</tr>

</thead>

<tbody>

{ultimos.map(s=>(

<tr key={s.id}>

<td style={{fontWeight:500}}>
{s.nome}
</td>

<td>{s.quadra}</td>

<td>{s.lote}/{s.gaveta}</td>

<td>{formatar(s.data_falecimento)}</td>

<td>{formatar(s.data_sepultamento)}</td>

<td>{s.funeraria}</td>

<td>

<span style={{
padding:"4px 8px",
borderRadius:10,
fontSize:12,
fontWeight:600,
background:s.obito_entregue ? "#e8f5e9" : "#fff3cd",
color:s.obito_entregue ? "#2e7d32" : "#856404"
}}>

{s.obito_entregue ? "Entregue" : "Pendente"}

</span>

</td>

</tr>

))}

</tbody>

</table>

</ContainerTabela>

</div>

</div>

)

}