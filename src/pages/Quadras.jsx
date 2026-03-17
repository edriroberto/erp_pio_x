import { useEffect, useState, useRef } from "react"
import { supabase } from "../utils/supabaseClient"

export default function Quadras() {

  const [quadras, setQuadras] = useState([])
  const [lotes, setLotes] = useState([])
  const [quadraSelecionada, setQuadraSelecionada] = useState(null)

  // Adicione estes estados ao seu componente Quadras
  const [showModal, setShowModal] = useState(false);
  const [tiposLote, setTiposLote] = useState([]);
  const [novoLote, setNovoLote] = useState({ numero: "", tipo_id: "", capacidade: 1 });

  const [loteSelecionado, setLoteSelecionado] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  const lotesScrollRef = useRef(null)

  useEffect(() => {

    carregarQuadras()
    carregarTipos()

    const resize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener("resize", resize)

    return () => window.removeEventListener("resize", resize)

  }, [])


  async function carregarQuadras(){

    const { data, error } = await supabase
      .from("quadras")
      .select("*")
      .order("nome")

    if(error) return console.error(error)

    setQuadras(data || [])

  }


    async function carregarLotes(q){
      setQuadraSelecionada(q);
      setLoteSelecionado(null);

      const { data, error } = await supabase
        .from("lotes")
        .select(`
          id,
          numero,
          capacidade_gavetas,
          tipo_id,
          tipos_lote (
            id,
            descricao
          )
        `) // 🔹 ADICIONADO capacidade_gavetas e tipo_id
        .eq("quadra_id", q.id)
        .order("numero");

      if(error) return console.error(error);
      setLotes(data || []);

      if(lotesScrollRef.current){
        lotesScrollRef.current.scrollTop = 0;
      }
    }

  async function carregarTipos() {
    const { data } = await supabase.from("tipos_lote").select("*").order("descricao");
    setTiposLote(data || []);
  }

 function prepararEdicao(lote) {
  setModoEdicao(true);
  
  // 🔹 Preenche o estado com os dados reais vindos do banco
  setNovoLote({
    id: lote.id,
    numero: lote.numero,
    tipo_id: lote.tipo_id, // Agora ele existe no SELECT
    capacidade: lote.capacidade_gavetas // Agora ele existe no SELECT
  });
  
  setShowModal(true);
}
 {/*
function prepararEdicao(lote) {
    setLoteSelecionado(lote);
    setModoEdicao(true);
    setNovoLote({
      id: lote.id, // Guardamos o ID para o Update
      numero: lote.numero,
      tipo_id: lote.tipo_id || lote.tipos_lote?.id || "",
      capacidade: lote.capacidade_gavetas || 0
    });
    setShowModal(true);
  }
*/}

  async function handleSalvarLote() {
    if (!quadraSelecionada) return;

    const dadosLote = {
      numero: novoLote.numero,
      quadra_id: quadraSelecionada.id,
      tipo_id: parseInt(novoLote.tipo_id),
      capacidade_gavetas: parseInt(novoLote.capacidade)
    };

    let erroSalvar = null;
    let idLoteProcessado = novoLote.id;

    if (modoEdicao) {
      // UPDATE
      const { error } = await supabase
        .from("lotes")
        .update(dadosLote)
        .eq("id", novoLote.id);
      erroSalvar = error;
    } else {
      // INSERT
      const { data, error } = await supabase
        .from("lotes")
        .insert([dadosLote])
        .select()
        .single();
      erroSalvar = error;
      idLoteProcessado = data?.id;
    }

    if (erroSalvar) return alert("Erro ao salvar: " + erroSalvar.message);

    // 🔹 Sincroniza as gavetas (A mesma RPC que resolveu o problema no Delphi!)
    await supabase.rpc('sincronizar_capacidade_lote', {
      p_lote_id: idLoteProcessado,
      p_nova_capacidade: parseInt(novoLote.capacidade)
    });

    setShowModal(false);
    setModoEdicao(false);
    setLoteSelecionado(null);
    carregarLotes(quadraSelecionada);
  }

  return(

    <div
      style={{
        padding: isMobile ? 5 : 5,
        background:"#f2f2f7",
        display:"flex",
        flexDirection: isMobile ? "column" : "row",
        gap:10,
        height:"100%"
      }}
    >


      {/* COLUNA QUADRAS */}

      <div
        style={{
          flex: isMobile ? "0 0 auto" : 1,
          background:"#fff",
          borderRadius:12,
          padding:15,
          display:"flex",
          flexDirection:"column",
          minHeight: isMobile ? 200 : 0
          
        }}
      >

        <h2>Quadras</h2>

        <div
          style={{
            overflowY:"auto",
            flex:1,
            maxHeight: isMobile ? 180 : "100%",
            marginTop: "-10px"
          }}
        >

          <table className="tabela">

            <thead>
              <tr>
                <th>Nome</th>
              </tr>
            </thead>

            <tbody>

              {quadras.map(q => {

                const selecionada = quadraSelecionada?.id === q.id

                return (

                  <tr
                    key={q.id}
                    onClick={()=>carregarLotes(q)}
                    style={{
                      cursor:"pointer",
                      background: selecionada ? "#e8f2ff" : "transparent",
                      fontWeight: selecionada ? "600" : "normal",
                      color: selecionada ? "#1a73e8" : "inherit"
                    }}
                  >

                    <td>{q.nome}</td>

                  </tr>

                )

              })}

            </tbody>

          </table>

        </div>

      </div>



      {/* COLUNA LOTES */}



      <div
        style={{
          flex:2,
          background:"#fff",
          borderRadius:12,
          padding:16,
          display:"flex",
          flexDirection:"column",
          minHeight:0
          
        }}
      >




{/* Dentro da COLUNA LOTES, acima do título ou ao lado */}


          
{/*}

  {quadraSelecionada && (
    <button 
      onClick={() => setShowModal(true)}
      style={{ padding: "8px 16px", background: "#1a73e8", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
    >
      + Novo Lote
    </button>
  )}
</div>

*/}
<div style={{ display: "flex", justifyContent: "space-between", 
              alignItems: "center", marginBottom: 10, marginRight: isMobile ? 2 : 150, padding: "15" }}>
  <h2 style={{marginBottom:5}}>
    {quadraSelecionada ? `Lotes de ${quadraSelecionada.nome}` : "Selecione uma quadra"}
  </h2>

  {quadraSelecionada && (
    <>
      {/* Botão Editar: Só aparece se houver lote selecionado */}
      {loteSelecionado && (
        <button 
          onClick={() => prepararEdicao(loteSelecionado)}
          style={{ 
            padding: "8px 16px", 
            background: "#fff", 
            color: "#1a73e8", 
            border: "1px solid #1a73e8", 
            borderRadius: 8, 
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          Editar Lote
        </button>
      )}

      {/* Botão Novo */}
      <button 
        onClick={() => {
          setModoEdicao(false);
          setNovoLote({ numero: "", tipo_id: "", capacidade: 1 });
          setShowModal(true);
        }}
        style={{ 
          padding: "8px 16px", 
          background: "#1a73e8", 
          color: "#fff", 
          border: "none", 
          borderRadius: 8, 
          cursor: "pointer",
          fontWeight: "600"
        }}
      >
        + Novo Lote
      </button>
    </>
  )}
</div>

{/* MODAL SIMPLES (Pode ser um componente separado depois) */}
{showModal && (
  <div style={{
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  }}>
    <div style={{ background: '#fff', padding: 25, borderRadius: 12, width: isMobile ? '90%' : 400 }}>
      <h3>Novo Lote em {quadraSelecionada.nome}</h3>
      
      <label>Número do Lote:</label>
      <input 
        type="text" 
        style={{ width: '100%', marginBottom: 15, padding: 8 }}
        value={novoLote.numero}
        onChange={e => setNovoLote({...novoLote, numero: e.target.value})}
      />

      <label>Tipo:</label>
      <select 
        style={{ width: '100%', marginBottom: 15, padding: 8 }}
        value={novoLote.tipo_id}
        onChange={e => setNovoLote({...novoLote, tipo_id: e.target.value})}
      >
        <option value="">Selecione...</option>
        {tiposLote.map(t => <option key={t.id} value={t.id}>{t.descricao}</option>)}
      </select>

      <label>Quantidade de Gavetas:</label>
      <input 
        type="number" 
        style={{ width: '100%', marginBottom: 20, padding: 8 }}
        value={novoLote.capacidade}
        onChange={e => setNovoLote({...novoLote, capacidade: e.target.value})}
      />

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={() => setShowModal(false)} style={{ padding: '8px 16px', background: '#ccc', border: 'none', borderRadius: 6 }}>Cancelar</button>
        <button onClick={handleSalvarLote} style={{ padding: '8px 16px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: 6 }}>Salvar</button>
      </div>
    </div>
  </div>
)}



        {quadraSelecionada && (

          <div
            ref={lotesScrollRef}
            style={{
              overflowY:"auto",
              flex:1
            }}
          >
              <div
                style={{
                  flex: 2,
                  background: "#fff",
                  borderRadius: 12,
                  padding: 16,
                  marginRight: isMobile ? 5 : 120, // 🔹 Adiciona o espaço no lado direito
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0
                }}
              >
                  <table className="tabela">

                    <thead>

                      <tr>
                        <th>Lote</th>
                        <th>Tipo</th>
                        <th style={{ width: "50px"}}>Vagas</th>
                      </tr>

                    </thead>

                  <tbody>

                      {lotes.map(l => {
                        const selecionado = loteSelecionado?.id === l.id;
                        return (
                          <tr 
                            key={l.id}
                            onClick={() => setLoteSelecionado(l)}
                            onDoubleClick={() => prepararEdicao(l)} // Dica: double click abre a edição igual no Windows
                            style={{ 
                              //background: selecionado ? "#5396f5" : "transparent",
                              color: selecionado ? "#4807fc" : "inherit",
                              cursor: 'pointer',
                              transition: "background 0.2s"
                            }}
                          >
                            <td style={{ fontWeight: selecionado ? "600" : "400" }}>{l.numero}</td>
                            <td>{l.tipos_lote?.descricao}</td>
                            <td style={{ textAlign: "center" }}>{l.capacidade_gavetas}</td>
                          </tr>
                        );
                      })}
                    </tbody>

                  </table>
            </div>
          </div>

        )}

      </div>


    </div>

  )

}