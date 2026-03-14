import { useState, useEffect } from "react"
import { supabase } from "../utils/supabaseClient"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import ContainerTabela from "../components/ContainerTabela"
import "../styles/tabela.css"

export default function Dashboard() {
  const [estatisticas, setEstatisticas] = useState([])
  const [totais, setTotais] = useState({ sepultamentos: 0, falecimentos: 0 })
  const [ultimosSepultamentos, setUltimosSepultamentos] = useState([])

  // Array de cores para imitar o visual da sua imagem
  const CORES = ['#4a90e2', '#f5a623', '#f35d22', '#50e3c2', '#4a90e2', '#34a853', '#ea4335', '#fbbc05', '#607d8b', '#9c27b0', '#795548', '#d0021b'];

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      // 1. Executa todas as chamadas em paralelo (como no seu Service Delphi)
      const [respGrafico, respResumoSep, respResumoFal, respLista] = await Promise.all([
        supabase.from("vw_dash_sepultamentos_12_meses").select("*"),
        supabase.from("vw_dash_sepultamentos_mes").select("total").single(),
        supabase.from("vw_dash_falecimentos_mes").select("total").single(),
        supabase.from("vw_sepultamentos_v1").select("*").order("data_falecimento", { ascending: false }).limit(15)
      ])

      // 2. Formata dados do gráfico (MMM/YY)
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

      // 3. Define Totais do Kardex
      setTotais({
        sepultamentos: respResumoSep.data?.total || 0,
        falecimentos: respResumoFal.data?.total || 0
      })

      // 4. Define Lista Recente
      if (respLista.data) setUltimosSepultamentos(respLista.data)

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error)
    }
  }

  function formatarData(data) {
    if (!data) return ""
    const partes = data.split("-")
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  return (
   <div style={{ padding: '18px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
  {/* Título menor e centralizado */}
  <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '24px', color: '#333' }}>Resumo</h2>

  {/* Cards com números centralizados */}
  <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '20px' }}>
    <div className="card-estatistica" style={{ textAlign: 'center', minWidth: '180px' }}>
      <label style={{ fontSize: '16px', color: '#666', display: 'block', marginBottom: '5px' }}>
        Sepultamentos do Mês
      </label>
      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>
        {totais.sepultamentos}
      </div>
    </div>
    <div className="card-estatistica" style={{ textAlign: 'center', minWidth: '180px' }}>
      <label style={{ fontSize: '16px', color: '#666', display: 'block', marginBottom: '5px' }}>
        Falecimentos do Mês
      </label>
      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>
        {totais.falecimentos}
      </div>
    </div>
  </div>

      {/* 2. GRÁFICO */}
      <div style={{ 
        background: '#fff', 
        padding: '10px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px',
        border: '1px solid #ddd'
      }}>
        <h4 style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 'normal' }}>Gráfico últimos 12 meses</h4>
        <div style={{ width: '100%', height: 180 }}>
          <ResponsiveContainer>
           <BarChart data={estatisticas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="nome" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f5f5f5'}} />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={35} label={{ position: 'top', fontSize: 11 }}>
                {estatisticas.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. TABELA DE RECENTES */}
      <ContainerTabela>
        <div className="tabela-container">
          <table className="tabela">
            <thead>
              <tr>
                <th>Falecido</th>
                <th style={{width:120}}>Quadra</th>
                <th style={{width:70}}>Lote</th>
                <th>Nascimento</th>
                <th>Falecimento</th>
                <th>Idade</th>
                <th>Gaveta</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              {ultimosSepultamentos.map((s) => (
                <tr key={s.id} style={{ 
                  backgroundColor: s.data_nascimento === s.data_falecimento ? '#ffebee' : 'transparent' 
                }}>
                  <td>{s.nome}</td>
                  <td>{s.quadra}</td>
                  <td>{s.lote}</td>
                  <td>{formatarData(s.data_nascimento)}</td>
                  <td>{formatarData(s.data_falecimento)}</td>
                  <td>{s.idade}</td>
                  <td>{s.gaveta}</td>
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