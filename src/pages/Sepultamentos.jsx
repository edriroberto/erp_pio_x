import { useEffect, useState } from "react"
import { supabase } from "../utils/supabaseClient"
import Toolbar from "../components/Toolbar"
import ContainerTabela from "../components/ContainerTabela"
import "../styles/tabela.css"

export default function Sepultamentos() {
  const [dados, setDados] = useState([])
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    carregar()
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Função para calcular a idade (equivalente ao que faríamos no OnCalcFields)
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


  async function carregar() {
    // Certifique-se de que o campo 'idade' está na sua view do Supabase
    const { data } = await supabase
      .from("vw_sepultamentos_v1")
      .select("*") 
      .order("data_sepultamento", { ascending: false })

  if (data) {
      // Adicionamos a idade calculada em cada registro antes de salvar no state
      const dadosComIdade = data.map(s => ({
        ...s,
        idade: calcularIdade(s.data_nascimento, s.data_falecimento)
      }))
      setDados(dadosComIdade)
    }
  }

  function formatarData(data) {
    if (!data) return ""
    const partes = data.split("-")
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  // Componente de Card para o iPhone (Estilo da foto)
  const CartaoMobile = ({ s }) => (
    <div style={{
      background: '#fff',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '15px',
      borderLeft: '6px solid #2f3542',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#08060d', marginBottom: '5px' }}>
        {s.nome}
      </div>
      <div style={{ fontSize: '14px', color: '#6b6375' }}>
        <strong>Nasc:</strong> {formatarData(s.data_nascimento)} - <strong>Falec:</strong> {formatarData(s.data_falecimento)}
      </div>
      <div style={{ fontSize: '15px', margin: '8px 0', color: '#08060d' }}>
        <strong>LOCAL:</strong> {s.quadra} - <strong>LOTE:</strong> {s.lote} {s.gaveta ? `- GAVETA: ${s.gaveta}` : ''}
      </div>
      <div style={{ fontSize: '14px', fontWeight: '500' }}>
        Funerária: <span style={{ color: '#aa3bff' }}>{s.funeraria}</span>
      </div>
      <div style={{ 
        marginTop: '10px', 
        paddingTop: '8px', 
        borderTop: '1px solid #eee', 
        display: 'flex', 
        justifyContent: 'space-between',
        fontSize: '13px',
        color: '#9ca3af'
      }}>
        <span>Idade: {s.idade ? `${s.idade} anos` : 'N/A'}</span>
        <span>Óbito em: {formatarData(s.data_sepultamento)}</span>
      </div>
    </div>
  )

  return (
    <div>
      <Toolbar />
      <ContainerTabela>
        {isMobile ? (
          // VISÃO IPHONE: Lista de Cards
          <div style={{ padding: '10px' }}>
            {dados.map(s => <CartaoMobile key={s.id} s={s} />)}
          </div>
        ) : (
          // VISÃO PC: Tabela normal
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
                  <th>Idade</th>
                  <th style={{width:100}}>Funerária</th>
                  <th style={{width:250}}>Observações</th>

            
                </tr>
              </thead>
              <tbody>
                {dados.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontSize: '12px', color: '#666' }}>{s.nome}</td>
                    <td>{s.quadra}</td>
                    <td style={{ width: 80 }}>{s.lote}</td>
                    <td>{s.gaveta}</td>
                    <td>{formatarData(s.data_nascimento)}</td>
                    <td>{formatarData(s.data_falecimento)}</td>
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
    </div>
  )
}