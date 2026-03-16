import { useState, useEffect } from "react"
import { supabase } from "../utils/supabaseClient"
import { useNavigate } from "react-router-dom"

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

import DashboardCard from "../components/DashboardCard"
import SepultamentoCard from "../components/SepultamentoCard"

export default function Dashboard(){

const navigate = useNavigate()
const [grafico,setGrafico] = useState([])
const [ultimos,setUltimos] = useState([])

const [totais,setTotais] = useState({
sepultamentos:0,
falecimentos:0,
pendentes:0
})

const [isMobile,setIsMobile] = useState(window.innerWidth <= 768)

const CORES=[
"#4a90e2","#f5a623","#f35d22","#50e3c2",
"#34a853","#ea4335","#fbbc05","#607d8b",
"#9c27b0","#ff6b6b","#00bcd4","#795548"
]

useEffect(()=>{

carregar()

const resize=()=> setIsMobile(window.innerWidth<=768)

window.addEventListener("resize",resize)

return()=> window.removeEventListener("resize",resize)

},[])

function abrirCadastro(id){

  navigate(`/cadastroSepultamento/${id}`)

}

async function carregar(){

try{

const[
g,
s,
f,
p,
l
]=await Promise.all([

supabase.from("vw_dash_sepultamentos_12_meses").select("*"),

supabase.from("vw_dash_sepultamentos_mes").select("total").single(),

supabase.from("vw_dash_falecimentos_mes").select("total").single(),

supabase.from("vw_dash_obitos_pendentes").select("total").single(),

supabase
.from("vw_sepultamentos_v1")
.select("*")
.order("data_falecimento",{ascending:false})
.limit(15)

])

if(g.data){

const dados=g.data.map((item,index)=>{

const [ano,mes]=item.mes.split("-")
const data=new Date(ano,mes-1)

return{
mes:data.toLocaleDateString("pt-BR",{month:"short"}),
total:item.total,
cor:CORES[index % CORES.length]
}

})

setGrafico(dados)

}

setTotais({

sepultamentos:s.data?.total || 0,
falecimentos:f.data?.total || 0,
pendentes:p.data?.total || 0

})

setUltimos(l.data || [])

}catch(e){

console.error("Erro dashboard:",e)

}

}

function calcularIdade(dataNascimento,dataFalecimento){

if(!dataNascimento || !dataFalecimento) return ""

const nasc=new Date(dataNascimento)
const falec=new Date(dataFalecimento)

let idade=falec.getFullYear()-nasc.getFullYear()

const m=falec.getMonth()-nasc.getMonth()

if(m<0 || (m===0 && falec.getDate()<nasc.getDate()))
idade--

return idade

}

function formatar(data){

if(!data) return ""

const p=data.split("-")

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

<h2 style={{marginBottom:16}}>Dashboard</h2>


{/* KPIs */}

<div style={{
display:"grid",
gridTemplateColumns:"repeat(3,1fr)",
gap:10,
marginBottom:16
}}>

<DashboardCard
titulo="Sepultamentos"
valor={totais.sepultamentos}
cor="#4a90e2"
/>

<DashboardCard
titulo="Falecimentos"
valor={totais.falecimentos}
cor="#34a853"
/>

<DashboardCard
titulo="Pendentes"
valor={totais.pendentes}
cor="#ea4335"
/>

</div>


{/* CONTAINER ROLAGEM */}

<div style={{
flex:1,
overflowY:"auto",
overflowX:"hidden",
paddingRight:4
}}>


{/* GRÁFICO */}

<div style={{
background:"#fff",
borderRadius:14,
padding:12,
marginBottom:16,
boxShadow:"0 2px 6px rgba(0,0,0,0.06)"
}}>

<div style={{
fontSize:14,
fontWeight:600,
marginBottom:8
}}>
Sepultamentos últimos 12 meses
</div>

<div style={{height:160}}>

<ResponsiveContainer width="100%" height="100%">

<BarChart
  data={grafico}
  margin={{
    top: 5,
    right: 20,
    left: -25,
    bottom: 0
  }}
>

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


{/* LISTA DE CARDS */}

<div style={{fontWeight:600,marginBottom:8}}>
Últimos Sepultamentos
</div>

{ultimos.map(s=>(

<SepultamentoCard
key={s.id}
dado={{
nome:s.nome,
nascimento:formatar(s.data_nascimento),
falecimento:formatar(s.data_falecimento),
quadra:s.quadra,
lote:s.lote,
gaveta:s.gaveta,
funeraria:s.funeraria,
idade:calcularIdade(s.data_nascimento, s.data_falecimento),
obito_entregue:Boolean(s.obito_entregue),
observacoes:s.observacoes
}}onClick={()=>abrirCadastro(s.id)}
/>

))}

</div>

</div>

)

}