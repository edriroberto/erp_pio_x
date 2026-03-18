import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import "../styles/modal.css"; 

export default function Quadras() {
  const [quadras, setQuadras] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [tiposLote, setTiposLote] = useState([]);
  
  const [quadraSelecionada, setQuadraSelecionada] = useState(null);
  const [loteSelecionado, setLoteSelecionado] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [showUploadFoto, setShowUploadFoto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [novoLote, setNovoLote] = useState({ id: null, numero: "", tipo_id: "", capacidade: 1, foto_url: "" });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    carregarQuadras();
    carregarTipos();
    const resize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("lotes").upload(fileName, file);
    if (error) {
      setLoading(false);
      return alert("Erro ao enviar: " + error.message);
    }
    const { data } = supabase.storage.from("lotes").getPublicUrl(fileName);
    setNovoLote(prev => ({ ...prev, foto_url: data.publicUrl }));
    setLoading(false);
  }

  async function carregarQuadras() {
    const { data, error } = await supabase.from("quadras").select("*").order("nome");
    if (error) return console.error(error);
    setQuadras(data || []);
  }

  async function carregarTipos() {
    const { data } = await supabase.from("tipos_lote").select("*").order("descricao");
    setTiposLote(data || []);
  }

  async function carregarLotes(q) {
    setQuadraSelecionada(q);
    setLoteSelecionado(null);
    const { data, error } = await supabase
      .from("lotes")
      .select(`id, numero, capacidade_gavetas, tipo_id, foto_url, tipos_lote (id, descricao)`)
      .eq("quadra_id", q.id)
      .order("numero");
    if (error) return console.error(error);
    setLotes(data || []);
  }

  function prepararEdicao(lote) {
    setModoEdicao(true);
    setNovoLote({ 
      id: lote.id, 
      numero: lote.numero, 
      tipo_id: lote.tipo_id, 
      capacidade: lote.capacidade_gavetas, 
      foto_url: lote.foto_url || "" 
    });
    setShowModal(true);
  }

  function abrirPopupFoto(lote) {
    setLoteSelecionado(lote);
    setNovoLote({ ...novoLote, id: lote.id, foto_url: lote.foto_url || "" });
    setShowUploadFoto(true);
  }

  // FUNÇÃO REFEITA COM A LÓGICA DE SINCRONIZAÇÃO (DELPHI SERVICE)
  async function handleSalvarLote() {
    if (!quadraSelecionada && !showUploadFoto) return;
    
    setLoading(true);
    const capacidadeNum = parseInt(novoLote.capacidade);

    try {
      if (showUploadFoto) {
        // Apenas foto
        const { error } = await supabase.from("lotes").update({ foto_url: novoLote.foto_url }).eq("id", loteSelecionado.id);
        if (error) throw error;
      } else {
        const dadosLote = {
          numero: novoLote.numero,
          quadra_id: quadraSelecionada.id,
          tipo_id: parseInt(novoLote.tipo_id),
          capacidade_gavetas: capacidadeNum,
          foto_url: novoLote.foto_url
        };

        if (modoEdicao) {
          // 1. Alterar Lote (Equivalente ao LoteService.AlterarLote)
          const { error: errorUpdate } = await supabase.from("lotes").update(dadosLote).eq("id", novoLote.id);
          if (errorUpdate) throw errorUpdate;

          // 2. Sincronizar Capacidade (Equivalente ao LoteService.SincronizarCapacidade)
          const { error: errorRpc } = await supabase.rpc('sincronizar_capacidade_lote', { 
            p_lote_id: novoLote.id, 
            p_nova_capacidade: capacidadeNum 
          });
          if (errorRpc) throw errorRpc;

        } else {
          // Criar Lote (Equivalente ao LoteService.CriarLote)
          const { data, error: errorInsert } = await supabase.from("lotes").insert([dadosLote]).select().single();
          if (errorInsert) throw errorInsert;

          // Sincronizar as gavetas iniciais para o novo lote
          const { error: errorRpcNew } = await supabase.rpc('sincronizar_capacidade_lote', { 
            p_lote_id: data.id, 
            p_nova_capacidade: capacidadeNum 
          });
          if (errorRpcNew) throw errorRpcNew;
        }
      }

      fecharModais();
      carregarLotes(quadraSelecionada);
    } catch (err) {
      alert("Erro ao processar: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function fecharModais() {
    setShowModal(false);
    setShowUploadFoto(false);
    setModoEdicao(false);
    setNovoLote({ id: null, numero: "", tipo_id: "", capacidade: 1, foto_url: "" });
    setLoading(false);
  }

  return (
    <div className="main-layout-quadras" style={{ 
      display: "flex", flexDirection: isMobile ? "column" : "row",
      padding: isMobile ? "5px" : "15px", gap: 15, minHeight: "100vh", background: "#f2f2f7"
    }}>

      {/* PAINEL ESQUERDA: QUADRAS */}
      <div className="painel-quadras" style={{
        flex: isMobile ? "0 0 auto" : "0 0 250px",
        background: "#fff", borderRadius: 12, padding: 15, display: "flex", flexDirection: "column", height: isMobile ? "180px" : "auto"
      }}>
        <h2 style={{ fontSize: "0.9rem", marginBottom: 10, color: "#666" }}>Quadras</h2>
        <div className="tabela-container">
          <table className="tabela">
            <tbody>
              {quadras.map(q => (
                <tr key={q.id} onClick={() => carregarLotes(q)} style={{ cursor: "pointer", background: quadraSelecionada?.id === q.id ? "#e8f2ff" : "transparent" }}>
                  <td style={{ color: quadraSelecionada?.id === q.id ? "#1a73e8" : "#333", fontWeight: quadraSelecionada?.id === q.id ? "600" : "400" }}>{q.nome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAINEL DIREITA: LOTES */}
      <div className="painel-lotes" style={{
        flex: 1, background: "#fff", borderRadius: 12, padding: 15, display: "flex", flexDirection: "column", overflow: "hidden"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
          <h2 style={{ fontSize: "1.1rem" }}>{quadraSelecionada ? quadraSelecionada.nome : "Selecione"}</h2>
          {quadraSelecionada && (
            <div style={{ display: "flex", gap: 8 }}>
              {loteSelecionado && <button onClick={() => prepararEdicao(loteSelecionado)} className="btn-edit" disabled={loading}>Editar</button>}
              <button onClick={() => { setModoEdicao(false); setShowModal(true); }} className="btn-new" disabled={loading}>+ Novo</button>
            </div>
          )}
        </div>

        {quadraSelecionada && (
          <div className="tabela-container">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Lote</th>
                  <th>Tipo</th>
                  <th style={{ textAlign: "center" }}>Vagas</th>
                  <th style={{ textAlign: "center" }}>Foto</th>
                </tr>
              </thead>
              <tbody>
                {lotes.map(l => (
                  <tr key={l.id} onClick={() => setLoteSelecionado(l)} style={{ background: loteSelecionado?.id === l.id ? "#f0f7ff" : "transparent" }}>
                    <td style={{ fontWeight: "600" }}>{l.numero}</td>
                    <td>{l.tipos_lote?.descricao}</td>
                    <td style={{ textAlign: "center" }}>{l.capacidade_gavetas}</td>
                    <td style={{ textAlign: "center" }} onClick={(e) => { e.stopPropagation(); abrirPopupFoto(l); }}>
                      <div style={{ cursor: "pointer" }}>
                        {l.foto_url ? <img src={l.foto_url} style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }} /> : "📷"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL FOTO */}
      {showUploadFoto && (
        <div className="modal-overlay">
          <div className="modal-box-vertical">
            <h3>Foto: Lote {loteSelecionado?.numero}</h3>
            
            <div className="preview-foto-vertical">
              {loading ? "Processando..." : novoLote.foto_url ? (
                <img src={novoLote.foto_url} alt="Preview" />
              ) : (
                <div className="sem-foto-v">
                  <span style={{ fontSize: "2rem" }}>📷</span>
                  <span>Sem foto cadastrada</span>
                </div>
              )}
            </div>
            
            <div className="modal-row-buttons">
              <label className="btn-captura-v camera">
                📸 Tirar Foto
                <input type="file" accept="image/*" capture="environment" onChange={handleUpload} style={{ display: "none" }} />
              </label>
              <label className="btn-captura-v galeria">
                🖼️ Galeria
                <input type="file" accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
              </label>
            </div>
            
            <div className="modal-row-buttons">
              <button onClick={fecharModais} className="btn-cancel">Fechar</button>
              <button onClick={handleSalvarLote} className="btn-save" disabled={loading || !novoLote.foto_url}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DADOS */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>{modoEdicao ? "Editar Lote" : "Novo Lote"}</h3>
            <label style={{ fontSize: "12px", color: "#666" }}>Número do Lote</label>
            <input type="text" value={novoLote.numero} onChange={e => setNovoLote({ ...novoLote, numero: e.target.value })} />
            
            <label style={{ fontSize: "12px", color: "#666", marginTop: 10 }}>Tipo</label>
            <select value={novoLote.tipo_id} onChange={e => setNovoLote({ ...novoLote, tipo_id: e.target.value })}>
              <option value="">Selecione...</option>
              {tiposLote.map(t => <option key={t.id} value={t.id}>{t.descricao}</option>)}
            </select>
            
            <label style={{ fontSize: "12px", color: "#666", marginTop: 10 }}>Capacidade de Vagas (Gavetas)</label>
            <input type="number" value={novoLote.capacidade} onChange={e => setNovoLote({ ...novoLote, capacidade: e.target.value })} />
            
            <div className="modal-row-buttons" style={{ marginTop: 20 }}>
              <button onClick={fecharModais} className="btn-cancel">Cancelar</button>
              <button onClick={handleSalvarLote} className="btn-save" disabled={loading}>
                {loading ? "Salvando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}