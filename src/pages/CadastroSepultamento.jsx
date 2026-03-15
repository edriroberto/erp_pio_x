import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom" // Adicionado useLocation
import { supabase } from "../utils/supabaseClient"
import { useParams } from "react-router-dom"

export default function CadastroSepultamento() {
  const navigate = useNavigate()
  const location = useLocation() // Captura os dados vindos da Toolbar
  const { id } = useParams()
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  const [quadras, setQuadras] = useState([])
  const [lotes, setLotes] = useState([])
  const [gavetas, setGavetas] = useState([])
  const [funerarias, setFunerarias] = useState([])
  const [coveiros, setCoveiros] = useState([])

  const [form, setForm] = useState({
    nome: "",
    quadra_id: "",
    lote_id: "",
    gaveta_id: "",
    funeraria_id: "",
    coveiro_id: "",
    data_nascimento: "",
    data_falecimento: new Date().toISOString().split('T')[0],
    data_sepultamento: new Date().toISOString().split('T')[0],
    obito_entregue: false,
    observacoes: ""
  })

  //EFEITO: Captura ID passado como parámetro da dashboard
  useEffect(()=>{

    if(id){
    carregarSepultamento(id)
    }

    },[id])


  // EFITO: Captura dados da Toolbar para Edição
  useEffect(() => {
    if (location.state && location.state.registro) {
      // Se existe um registro vindo da navegação, preenche o form
      setForm(location.state.registro)
    }
  }, [location.state])

  // Carregamento inicial (Listas base)
  useEffect(() => {
    async function carregarBase() {
      const [resQ, resF, resC] = await Promise.all([
        supabase.from("quadras").select("id, nome").order("nome"),
        supabase.from("funerarias").select("id, nome").order("nome"),
        supabase.from("coveiros").select("id, nome").order("nome")
      ])
      if (resQ.data) setQuadras(resQ.data)
      if (resF.data) setFunerarias(resF.data)
      if (resC.data) setCoveiros(resC.data)
    }
    carregarBase()
  }, [])

  // Busca Lotes (Relacionado a Quadra)
  useEffect(() => {
    if (!form.quadra_id) { setLotes([]); return }
    async function buscarLotes() {
      const { data } = await supabase
        .from("lotes")
        .select(`id, numero, tipos_lote ( descricao )`)
        .eq("quadra_id", form.quadra_id)
        .order("numero")
      
      if (data) {
        setLotes(data)
        // Só limpa se for uma nova inserção, para não quebrar a edição
        if (!form.id) setForm(prev => ({ ...prev, lote_id: "", gaveta_id: "" }))
      }
    }
    buscarLotes()
  }, [form.quadra_id])

  // Busca Gavetas (Relacionado a Lote)
  useEffect(() => {
    if (!form.lote_id) { setGavetas([]); return }
    async function buscarGavetas() {
      const { data } = await supabase
        .from("gavetas")
        .select("id, numero")
        .eq("lote_id", form.lote_id)
        .order("numero")
      if (data) {
        setGavetas(data)
        if (!form.id) setForm(prev => ({ ...prev, gaveta_id: "" }))
      }
    }
    buscarGavetas()
  }, [form.lote_id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : (name === "nome" || name === "observacoes" ? value.toUpperCase() : value)
    setForm(prev => ({ ...prev, [name]: val }))
  }

  async function carregarSepultamento(id){

  const { data, error } = await supabase
    .from("vw_sepultamentos_v1")
    .select("*")
    .eq("id", id)
    .single()

  if(error){
    alert("Erro ao carregar registro: " + error.message)
    return
  }

  if(data){

    setForm({
      id: data.id,
      nome: data.nome || "",
      quadra_id: data.quadra_id || "",
      lote_id: data.lote_id || "",
      gaveta_id: data.gaveta_id || "",
      funeraria_id: data.funeraria_id || "",
      coveiro_id: data.coveiro_id || "",
      data_nascimento: data.data_nascimento || "",
      data_falecimento: data.data_falecimento || "",
      data_sepultamento: data.data_sepultamento || "",
      obito_entregue: data.obito_entregue || false,
      observacoes: data.observacoes || ""
    })

  }

}
  async function handleSalvar() {
    // 1. Validação básica (o "BeforePost")
    if (!form.nome || !form.quadra_id || !form.gaveta_id || !form.coveiro_id) {
      alert("ATENÇÃO: PREENCHA O NOME, A LOCALIZAÇÃO COMPLETA E O COVEIRO.");
      return;
    }

    // 2. Preparar os dados para o banco
    // Removemos campos que vêm da VIEW (como nomes de quadra/lote) 
    // e mantemos apenas as colunas REAIS da tabela 'sepultamentos'
    const dadosParaSalvar = {
      nome: form.nome,
      quadra_id: form.quadra_id,
      lote_id: form.lote_id,
      gaveta_id: form.gaveta_id,
      funeraria_id: form.funeraria_id,
      coveiro_id: form.coveiro_id,
      data_nascimento: form.data_nascimento,
      data_falecimento: form.data_falecimento,
      data_sepultamento: form.data_sepultamento,
      obito_entregue: form.obito_entregue,
      observacoes: form.observacoes
    };

    try {
      let response;

      if (form.id) {
        // --- MODO EDIÇÃO (UPDATE) ---
        response = await supabase
          .from("sepultamentos")
          .update(dadosParaSalvar)
          .eq("id", form.id); // Onde o ID seja igual ao do registro carregado
      } else {
        // --- MODO INSERÇÃO (INSERT) ---
        response = await supabase
          .from("sepultamentos")
          .insert([dadosParaSalvar]);
      }

      if (response.error) throw response.error;

      alert(form.id ? "ALTERAÇÕES SALVAS COM SUCESSO!" : "NOVO REGISTRO SALVO!");
      navigate("/sepultamentos");

    } catch (error) {
      console.error("Erro completo:", error);
      alert("ERRO AO SALVAR: " + error.message);
    }
  }

  async function handleExcluir() {
    const confirmou = window.confirm(`ATENÇÃO: DESEJA REALMENTE EXCLUIR O REGISTRO DE: ${form.nome}?`);
    if (confirmou) {
      const { error } = await supabase.from("sepultamentos").delete().eq("id", form.id)
      if (error) alert("ERRO AO EXCLUIR: " + error.message)
      else {
        alert("REGISTRO EXCLUÍDO!");
        navigate("/sepultamentos")
      }
    }
  }

  // Estilos
  const groupStyle = { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }
  const labelStyle = { fontWeight: '600', color: '#4a5568', fontSize: '0.85rem' }
//  const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '1rem', background: 'white' }
const inputStyle = { 
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #cbd5e0',
  fontSize: '1rem',
  background: '#ffffff',
  color: '#2d3748',
  appearance: "none",
  WebkitAppearance: "none"
}
const disabledStyle = { ...inputStyle, background: '#f7fafc', cursor: 'not-allowed', color: '#a0aec0' }

  const localizacaoDefinida = form.quadra_id && form.lote_id && form.gaveta_id;

  return (
<div className="pagina-rolavel" style={{ 
//      maxWidth: '1100px', 
      maxWidth: isMobile ? "100%" : "1100px",
      width: "100%",
//      boxSizing: "border-box",
      margin: '0 auto', 
      padding: isMobile ? '10px 15px 120px 15px' : '20px', // Aumentamos o padding inferior no mobile
      fontFamily: 'sans-serif',
      overflowY: 'auto' // Reforço local do scroll
    }}>

      <div style={{
  marginTop: isMobile ? "4px" : "10px",
  marginBottom: "10px"
}}>

  <h4 style={{
    color: '#2d3748',
    borderBottom: '1px solid #edf2f7',
    paddingBottom: '6px',
    fontSize: isMobile ? "15px" : "18px",
    fontWeight: 600,
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  }}>

    {form.id 
      ? `Editando: ${form.nome}` 
      : "Novo Registro de Sepultamento"}

  </h4>

</div>
      
      {/* Grid de Formulário (Mesma estrutura que definimos antes) */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '30px', marginTop: '20px' }}>
        
        {/* COLUNA 1: LOCALIZAÇÃO */}
        <div style={{ background: '#ffffff', padding: isMobile ? "10px" : "15px", borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#4a5568', fontSize: '1.1rem', borderLeft: '4px solid #4a90e2', paddingLeft: '10px' }}>1. Localização</h3>
          
          <div style={groupStyle}>
            <label style={labelStyle}>QUADRA</label>
            <select name="quadra_id" value={form.quadra_id} onChange={handleChange} style={inputStyle}>
              <option value="">SELECIONE...</option>
              {quadras.map(q => <option key={q.id} value={q.id}>{q.nome}</option>)}
            </select>
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>LOTE</label>
            <select name="lote_id" value={form.lote_id} onChange={handleChange} style={form.quadra_id ? inputStyle : disabledStyle} disabled={!form.quadra_id}>
              <option value="">SELECIONE...</option>
              {lotes.map(l => (
                <option key={l.id} value={l.id}>
                  {l.numero} {l.tipos_lote?.descricao ? `(${l.tipos_lote.descricao})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>GAVETA / POSIÇÃO</label>
            <select name="gaveta_id" value={form.gaveta_id} onChange={handleChange} style={form.lote_id ? inputStyle : disabledStyle} disabled={!form.lote_id}>
              <option value="">SELECIONE...</option>
              {gavetas.map(g => <option key={g.id} value={g.id}>{g.numero}</option>)}
            </select>
          </div>
        </div>

        {/* COLUNA 2: DADOS PESSOAIS */}
        <div style={{ background: '#ffffff', padding: isMobile ? "10px" : "15px", borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#4a5568', fontSize: '1.1rem', borderLeft: '4px solid #4a90e2', paddingLeft: '10px' }}>2. Dados do Sepultamento</h3>
          
          <div style={groupStyle}>
            <label style={labelStyle}>NOME COMPLETO</label>
            <input name="nome" value={form.nome} onChange={handleChange} style={inputStyle} placeholder="NOME DO FALECIDO" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={groupStyle}>
              <label style={labelStyle}>DATA NASCIMENTO</label>
              <input type="date" name="data_nascimento" value={form.data_nascimento} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={groupStyle}>
              <label style={labelStyle}>DATA FALECIMENTO</label>
              <input type="date" name="data_falecimento" value={form.data_falecimento} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div style={groupStyle}>
            <label style={{ ...labelStyle, color: '#38a169' }}>DATA DO SEPULTAMENTO</label>
            <input type="date" name="data_sepultamento" value={form.data_sepultamento} onChange={handleChange} style={{ ...inputStyle, border: '1px solid #38a169', fontWeight: 'bold' }} />
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>COVEIRO RESPONSÁVEL</label>
            <select name="coveiro_id" value={form.coveiro_id} onChange={handleChange} style={localizacaoDefinida ? inputStyle : disabledStyle} disabled={!localizacaoDefinida}>
              <option value="">SELECIONE...</option>
              {coveiros.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>FUNERÁRIA</label>
            <select name="funeraria_id" value={form.funeraria_id} onChange={handleChange} style={localizacaoDefinida ? inputStyle : disabledStyle} disabled={!localizacaoDefinida}>
              <option value="">SELECIONE...</option>
              {funerarias.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* OBSERVAÇÕES E BOTÕES */}
      <div style={{ background: '#ffffff', padding: isMobile ? "18px" : "25px", borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginTop: '30px' }}>
        <div style={groupStyle}>
          <label style={labelStyle}>OBSERVAÇÕES ADICIONAIS</label>
          <textarea name="observacoes" value={form.observacoes} onChange={handleChange} rows="3" style={{ ...inputStyle, resize: 'none' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #edf2f7', paddingTop: '20px' }}>
          
          {/* BOTÃO EXCLUIR: Só aparece se estiver editando */}
          

          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => navigate("/sepultamentos")} style={{ padding: '12px 25px', borderRadius: '6px', border: '1px solid #cbd5e0', background: 'white', cursor: 'pointer' }}>CANCELAR</button>
            <button onClick={handleSalvar} style={{ padding: '12px 45px', borderRadius: '6px', border: 'none', background: '#38a169', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
              {form.id ? "SALVAR ALTERAÇÕES" : "SALVAR REGISTRO"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}