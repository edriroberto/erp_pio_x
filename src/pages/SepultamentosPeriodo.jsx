import { useState, useEffect } from "react"
import { supabase } from "../utils/supabaseClient"
import "../styles/tabela.css"
import ContainerTabela from "../components/ContainerTabela"

export default function SepultamentosPeriodo() {
  const [dataDe, setDataDe] = useState("")
  const [dataAte, setDataAte] = useState("")
  const [dados, setDados] = useState([])
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener("resize", handleResize)

    const hoje = new Date()
    const tresMesesAtras = new Date()
    tresMesesAtras.setMonth(hoje.getMonth() - 3)

    const dataFim = hoje.toISOString().split("T")[0]
    const dataInicio = tresMesesAtras.toISOString().split("T")[0]

    setDataDe(dataInicio)
    setDataAte(dataFim)

    carregarDados(dataInicio, dataFim)

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

  async function carregarDados(inicio, fim) {
    const { data, error } = await supabase
      .from("vw_sepultamentos_v1")
      .select("*")
      .gte("data_falecimento", inicio)
      .lte("data_falecimento", fim)
      .order("nome", { ascending: true })

    if (data) {
      const dadosComIdade = data.map(s => ({
        ...s,
        idade: calcularIdade(s.data_nascimento, s.data_falecimento)
      }))
      setDados(dadosComIdade)
    }
    if (error) console.error(error)
  }

  async function buscarPorPeriodo() {
    if (!dataDe || !dataAte) return
    carregarDados(dataDe, dataAte)
  }

  function formatarData(data) {
    if (!data) return ""
    const partes = data.split("-")
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  // Componente de Card para o iPhone (Padronizado)
  const CartaoMobilePeriodo = ({ s }) => (
    <div style={{
      background: '#fff',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '15px',
      borderLeft: '6px solid #2c3e50', // Cor azul escuro para o período
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#08060d', marginBottom: '4px' }}>
        {s.nome}
      </div>
      <div style={{ fontSize: '13px', color: '#6b6375', marginBottom: '6px' }}>
        <strong>LOCAL:</strong> {s.quadra} - <strong>LOTE:</strong> {s.lote}
      </div>
      <div style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
        <span>Falecimento: {formatarData(s.data_falecimento)}</span>
        <span>Idade: <strong>{s.idade} anos</strong></span>
      </div>
    </div>
  )

  return (
    <div style={{ padding: isMobile ? '10px' : '5' }}>
      <div style={{ 
        display: "flex", 
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between", 
        alignItems: isMobile ? "flex-start" : "center",
        marginBottom: 15
      }}>
        <h2 style={{ margin: 0 }}>Por período</h2>
        <p style={{ fontSize: "14px", color: "#666", marginTop: isMobile ? 5 : 0, marginBottom: isMobile ? 5 : 0 }}>
          {formatarData(dataDe)} até {formatarData(dataAte)}
        </p>
      </div>

      {/* FILTROS RESPONSIVOS - AJUSTADO */}
<div style={{ 
  marginBottom: 20, 
  display: "flex", 
  flexDirection: isMobile ? "column" : "row",
  alignItems: isMobile ? "stretch" : "flex-end", // Alinha o botão pela base no PC
  gap: 15,
  background: "#f9f9f9",
  padding: "5px",
  borderRadius: "8px",
  border: "1px solid #eee"
}}>
  <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
    <div style={{ width: isMobile ? '100%' : '160px' }}>
      <label style={{ fontSize: 12, fontWeight: 'bold', display: 'block', marginBottom: 5 }}>De:</label>
      <input
        type="date"
        value={dataDe}
        onChange={(e) => setDataDe(e.target.value)}
        style={{ 
          width: '100%', 
          padding: "10px", 
          borderRadius: "4px", 
          border: "1px solid #ccc",
          fontSize: "14px" 
        }}
      />
    </div>
    <div style={{ width: isMobile ? '100%' : '160px' }}>
      <label style={{ fontSize: 12, fontWeight: 'bold', display: 'block', marginBottom: 5 }}>Até:</label>
      <input
        type="date"
        value={dataAte}
        onChange={(e) => setDataAte(e.target.value)}
        style={{ 
          width: '100%', 
          padding: "10px", 
          borderRadius: "4px", 
          border: "1px solid #ccc",
          fontSize: "14px" 
        }}
      />
    </div>
  </div>

  <button
    onClick={buscarPorPeriodo}
    style={{
      padding: "11px 25px", // Ajustado para alinhar com a altura dos inputs
      backgroundColor: "#2c3e50",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "14px",
      transition: "background 0.2s",
      height: "42px", // Altura fixa para casar com os inputs no PC
      alignSelf: isMobile ? "stretch" : "flex-end"
    }}
  >
    Filtrar Período
  </button>

  {!isMobile && (
    <div style={{ marginLeft: "auto", textAlign: 'right' }}>
      <span style={{ fontSize: "12px", color: "#666", display: "block" }}>Total do período</span>
      <span style={{ fontWeight: "bold", color: "#2c3e50", fontSize: "18px" }}>
        {dados.length} <small style={{fontSize: '12px'}}>registros</small>
      </span>
    </div>
  )}
</div>

      <ContainerTabela>
        {isMobile ? (
          <div style={{ paddingBottom: '80px' }}>
             <div style={{ color: "#666", fontSize: 13, marginBottom: 10, textAlign: 'right' }}>
               {dados.length} registros encontrados
             </div>
            {dados.map(s => <CartaoMobilePeriodo key={s.id} s={s} />)}
          </div>
        ) : (
          <div className="tabela-container">
            <table className="tabela">
              <thead>
          
                <tr>
                  <th style={{ width: '300px', minWidth: '300px' }}>Nome</th>
                  
                  <th style={{ width: '100px', minWidth: '100px'}}>Quadra</th>
                  <th style={{ width: '80px', minWidth: '80px' }}>Lote</th>
                  <th style={{ width: '100px', minWidth: '100px' }}>Gaveta</th>
                  <th style={{ width: '80px', minWidth: '80px' }}>Nascimento</th>
                  <th style={{ width: '80px', minWidth: '80px' }}>Falecimento</th>
                  
                  <th>Sepultamento</th>
                  <th>Idade</th>
                  
                  <th style={{width:100}}>Funerária</th>
                  <th style={{ width: 350 }}>Observações</th>
                </tr>
              </thead>
              <tbody>
                {dados.map((s) => (
                  <tr key={s.id}>
                      <td style={{ fontWeight: '500' }}>{s.nome}</td>
                      <td>{s.quadra}</td>
                      <td>{s.lote}</td>
                      <td>{s.gaveta}</td>
                      <td>{formatarData(s.data_nascimento)}</td>
                      <td>{formatarData(s.data_falecimento)}</td>
                      <td>{formatarData(s.data_sepultamento)}</td>
                      <td>{s.idade}</td>
                      <td>{s.funeraria}</td>
                      <td style={{ fontSize: '12px', color: '#666' }}>{s.observacoes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ContainerTabela>
        <style>{`
          .linha-tabela:hover{
            background-color:#f7fafc !important;
          }
          `}
        </style>
    </div>
  )
  
}