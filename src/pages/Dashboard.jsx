import { useState, useEffect } from "react"
import { supabase } from "../utils/supabaseClient"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import ContainerTabela from "../components/ContainerTabela"
import "../styles/tabela.css"

export default function Dashboard() {
  const [estatisticas, setEstatisticas] = useState([])
  const [totais, setTotais] = useState({ sepultamentos: 0, falecimentos: 0 })
  const [ultimosSepultamentos, setUltimosSepultamentos] = useState([])
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  const CORES = ['#4a90e2', '#f5a623', '#f35d22', '#50e3c2', '#4a90e2', '#34a853', '#ea4335', '#fbbc05', '#607d8b', '#9c27b0', '#795548', '#d0021b'];

  useEffect(() => {
    carregarDados()
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
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
      const [respGrafico, respResumoSep, respResumoFal, respLista] = await Promise.all([
        supabase.from("vw_dash_sepultamentos_12_meses").select("*"),
        supabase.from("vw_dash_sepultamentos_mes").select("total").single(),
        supabase.from("vw_dash_falecimentos_mes").select("total").single(),
        supabase.from("vw_sepultamentos_v1").select("*").order("data_falecimento", { ascending: false }).limit(15)
      ])

      if (respGrafico.data) {
        const formatados = respGrafico.data.map((item, index) => {
          const [ano, mes] = item.mes.split('-')
          const dataObj = new Date(ano, mes - 1, 1)
          return {
            nome: dataObj.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
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
          idade: calcularIdade(s.data_nascimento, s.data_falecimento)
        }))
        setUltimosSepultamentos(dadosComIdade)
      }

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error)
    }
  }

  function formatarData(data) {
    if (!data) return ""
    const partes = data.split("-")
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  // Componente de Card para Mobile (Mesmo estilo do Sepultamentos)
  const CartaoMobileRecente = ({ s }) => (
  <div style={{
    background: '#fff',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '12px',
    borderLeft: '5px solid #2f3542',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
  }}>

    <div style={{
      fontSize: '16px',
      fontWeight: 'bold',
      marginBottom: '4px'
    }}>
      {s.nome}
    </div>

    <div style={{
      fontSize: '12px',
      color: '#777',
      marginBottom: '6px'
    }}>
      Falecimento: {formatarData(s.data_falecimento)}
    </div>

    <div style={{
      fontSize: '13px',
      display: 'flex',
      justifyContent: 'space-between'
    }}>
      <span><strong>Quadra:</strong> {s.quadra}</span>
      <span><strong>Lote:</strong> {s.lote}</span>
      <span><strong>Idade:</strong> {s.idade}</span>
    </div>

  </div>
)

  return (
    <div style={{ padding: isMobile ? '12px 8px'  : '18px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '24px', color: '#333' }}>Resumo</h2>

      {/* CARDS DE TOTAIS */}
      <div style={{ display: 'flex', gap: isMobile ? '10px' : '20px', justifyContent: 'center', marginBottom: '20px' }}>
        <div className="card-estatistica" style={{ textAlign: 'center', flex: 1, maxWidth: '200px' }}>
          <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '5px' }}>
            Sepultamentos/Mês
          </label>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#2c3e50' }}>
            {totais.sepultamentos}
          </div>
        </div>
        <div className="card-estatistica" style={{ textAlign: 'center', flex: 1, maxWidth: '200px' }}>
          <label style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '5px' }}>
            Falecimentos/Mês
          </label>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#2c3e50' }}>
            {totais.falecimentos}
          </div>
        </div>
      </div>

      {/* GRÁFICO */}
<div style={{
  background: '#fff',
  padding: isMobile ? '10px 5px' : '15px',
  borderRadius: '10px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
  marginBottom: '20px'
}}>
  <h4 style={{
    textAlign: 'center',
    marginBottom: '10px',
    fontWeight: '500',
    fontSize: isMobile ? '13px' : '14px'
  }}>
    Tendência últimos 12 meses
  </h4>

  <div style={{ width: '100%', height: isMobile ? 160 : 200 }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={estatisticas}
        margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />

        <XAxis
          dataKey="nome"
          tick={{ fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          tick={{ fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={25}
        />

        <Tooltip cursor={{ fill: '#f5f5f5' }} />

        <Bar
          dataKey="total"
          radius={[4, 4, 0, 0]}
          barSize={isMobile ? 18 : 35}
        >
          {estatisticas.map((entry, index) => (
            <Cell key={index} fill={entry.cor} />
          ))}
        </Bar>

      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

      {/* LISTA RECENTE (HÍBRIDA) */}
      <h3 style={{ fontSize: '17px', marginBottom: '12px', color: '#333', paddingLeft: '4px' }}>Últimos Registros</h3>
      
      {isMobile ? (
        // Mobile: Cards
        <div style={{ paddingBottom: '80px' }}>
          {ultimosSepultamentos.map(s => <CartaoMobileRecente key={s.id} s={s} />)}
        </div>
      ) : (
        // Desktop: Tabela
        <ContainerTabela>
          <div className="tabela-container">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Falecido</th>
                  <th>Quadra</th>
                  <th>Lote</th>
                  <th>Nascimento</th>
                  <th>Falecimento</th>
                  <th>Idade</th>
                  <th>Gaveta</th>
                </tr>
              </thead>
              <tbody>
                {ultimosSepultamentos.map((s) => (
                  <tr key={s.id} style={{ backgroundColor: s.data_nascimento === s.data_falecimento ? '#ffebee' : 'transparent' }}>
                    <td>{s.nome}</td>
                    <td>{s.quadra}</td>
                    <td>{s.lote}</td>
                    <td>{formatarData(s.data_nascimento)}</td>
                    <td>{formatarData(s.data_falecimento)}</td>
                    <td>{s.idade}</td>
                    <td>{s.gaveta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ContainerTabela>
      )}
    </div>
  )
}