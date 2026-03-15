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

export default function Dashboard() {

  const [estatisticas, setEstatisticas] = useState([])
  const [totais, setTotais] = useState({ sepultamentos: 0, falecimentos: 0 })
  const [ultimosSepultamentos, setUltimosSepultamentos] = useState([])
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  const CORES = [
    '#4a90e2','#f5a623','#f35d22','#50e3c2','#4a90e2',
    '#34a853','#ea4335','#fbbc05','#607d8b','#9c27b0'
  ]

  useEffect(() => {

    carregarDados()

    const handleResize = () =>
      setIsMobile(window.innerWidth <= 768)

    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)

  }, [])

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

  async function carregarDados() {

    try {

      const [
        respGrafico,
        respResumoSep,
        respResumoFal,
        respLista
      ] = await Promise.all([

        supabase.from("vw_dash_sepultamentos_12_meses").select("*"),

        supabase.from("vw_dash_sepultamentos_mes")
        .select("total").single(),

        supabase.from("vw_dash_falecimentos_mes")
        .select("total").single(),

        supabase
        .from("vw_sepultamentos_v1")
        .select("*")
        .order("data_falecimento", { ascending: false })
        .limit(10)
      ])

      if (respGrafico.data) {

        const formatados = respGrafico.data.map((item, index) => {

          const [ano, mes] = item.mes.split('-')

          const dataObj = new Date(ano, mes - 1, 1)

          return {
            nome: dataObj.toLocaleDateString(
              'pt-BR',
              { month: 'short', year: '2-digit' }
            ),
            total: item.total,
            cor: CORES[index % CORES.length]
          }
        })

        setEstatisticas(formatados)
      }

      setTotais({
        sepultamentos: respResumoSep.data?.total || 0,
        falecimentos: respResumoFal.data?.total || 0
      })

      if (respLista.data) {

        const dadosComIdade = respLista.data.map(s => ({
          ...s,
          idade: calcularIdade(
            s.data_nascimento,
            s.data_falecimento
          )
        }))

        setUltimosSepultamentos(dadosComIdade)
      }

    } catch (error) {
      console.error("Erro dashboard:", error)
    }
  }

  function formatarData(data) {

    if (!data) return ""

    const partes = data.split("-")

    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  /* CARD MOBILE */

  const CartaoMobileRecente = ({ s }) => {

    const entregue = s.obito_entregue

    return (

      <div style={{
        background:'#fff',
        borderRadius:'16px',
        padding:'14px',
        marginBottom:'12px',
        boxShadow:'0 1px 4px rgba(0,0,0,0.08)'
      }}>

        <div style={{
          fontSize:16,
          fontWeight:'600',
          marginBottom:4
        }}>
          {s.nome}
        </div>

        <div style={{
          fontSize:12,
          color:'#666',
          marginBottom:6
        }}>
          Nasc: {formatarData(s.data_nascimento)}
          {" • "}
          Falec: {formatarData(s.data_falecimento)}
        </div>

        <div style={{
          fontSize:13,
          marginBottom:6
        }}>
          Quadra {s.quadra}
          {" • "}
          Lote {s.lote}/{s.gaveta}
        </div>

        <div style={{
          display:'flex',
          justifyContent:'space-between',
          alignItems:'center',
          fontSize:13
        }}>

          <span>
            {s.funeraria}
          </span>

          <span style={{
            fontSize:11,
            padding:'3px 8px',
            borderRadius:10,
            background: entregue
              ? '#e8f5e9'
              : '#fff3cd',
            color: entregue
              ? '#2e7d32'
              : '#856404',
            fontWeight:'600'
          }}>
            {entregue ? 'Entregue' : 'Pendente'}
          </span>

        </div>

        {s.observacoes && (

          <div style={{
            fontSize:12,
            color:'#888',
            marginTop:6
          }}>
            {s.observacoes}
          </div>

        )}

      </div>
    )
  }

  return (

    <div style={{
      padding: isMobile ? '14px 10px' : '18px',
      background:'#f2f2f7',
      minHeight:'100vh',
      fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto'
    }}>

      <h2 style={{
        fontSize:22,
        fontWeight:'600',
        marginBottom:16
      }}>
        Resumo
      </h2>


      {/* CARDS ESTATÍSTICA */}

      <div style={{
        display:'flex',
        gap:10,
        marginBottom:18
      }}>

        <div style={{
          flex:1,
          background:'#fff',
          borderRadius:14,
          padding:14,
          boxShadow:'0 1px 3px rgba(0,0,0,0.08)'
        }}>
          <div style={{fontSize:12,color:'#777'}}>
            Sepultamentos
          </div>
          <div style={{
            fontSize:24,
            fontWeight:'600'
          }}>
            {totais.sepultamentos}
          </div>
        </div>

        <div style={{
          flex:1,
          background:'#fff',
          borderRadius:14,
          padding:14,
          boxShadow:'0 1px 3px rgba(0,0,0,0.08)'
        }}>
          <div style={{fontSize:12,color:'#777'}}>
            Falecimentos
          </div>
          <div style={{
            fontSize:24,
            fontWeight:'600'
          }}>
            {totais.falecimentos}
          </div>
        </div>

      </div>


      {/* GRÁFICO */}

      <div style={{
        background:'#fff',
        borderRadius:16,
        padding:14,
        marginBottom:20,
        boxShadow:'0 1px 3px rgba(0,0,0,0.08)'
      }}>

        <h4 style={{
          fontSize:14,
          fontWeight:'500',
          marginBottom:8
        }}>
          Tendência últimos 12 meses
        </h4>

        <div style={{
          width:'100%',
          height:isMobile ? 160 : 220
        }}>

          <ResponsiveContainer width="100%" height="100%">

            <BarChart
              data={estatisticas}
              margin={{ top:10,right:5,left:-20,bottom:0 }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#eee"
              />

              <XAxis
                dataKey="nome"
                tick={{fontSize:10}}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{fontSize:10}}
                axisLine={false}
                tickLine={false}
                width={25}
              />

              <Tooltip cursor={{fill:'#f5f5f5'}} />

              <Bar
                dataKey="total"
                radius={[4,4,0,0]}
                barSize={isMobile ? 18 : 35}
              >

                {estatisticas.map((entry,index)=>(
                  <Cell key={index} fill={entry.cor}/>
                ))}

              </Bar>

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>


      {/* LISTA */}

      <h3 style={{
        fontSize:16,
        fontWeight:'600',
        marginBottom:10
      }}>
        Últimos Sepultamentos
      </h3>


      {isMobile ? (

        <div style={{paddingBottom:80}}>

          {ultimosSepultamentos.map(s =>
            <CartaoMobileRecente key={s.id} s={s} />
          )}

        </div>

      ) : (

        <ContainerTabela>
          {/* mantém sua tabela desktop */}
        </ContainerTabela>

      )}

    </div>
  )
}