import { useEffect, useState, useRef } from "react";
import { supabase } from "../utils/supabaseClient";

export default function Quadras() {
  const [quadras, setQuadras] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [tiposLote, setTiposLote] = useState([]);
  
  const [quadraSelecionada, setQuadraSelecionada] = useState(null);
  const [loteSelecionado, setLoteSelecionado] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [showUploadFoto, setShowUploadFoto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  
  const [novoLote, setNovoLote] = useState({ id: null, numero: "", tipo_id: "", capacidade: 1, foto_url: "" });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const lotesScrollRef = useRef(null);

  useEffect(() => {
    carregarQuadras();
    carregarTipos();
    const resize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // ========================
  // 🔹 STORAGE & UPLOAD
  // ========================
  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Gerar nome único para evitar cache ou sobreposição
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("lotes").upload(fileName, file);

    if (error) return alert("Erro ao enviar imagem: " + error.message);

    const { data } = supabase.storage.from("lotes").getPublicUrl(fileName);
    
    // Atualiza o estado local para visualização prévia
    setNovoLote(prev => ({ ...prev, foto_url: data.publicUrl }));
  }

  // ========================
  // 🔹 CARREGAMENTO DE DADOS
  // ========================
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
    if (lotesScrollRef.current) lotesScrollRef.current.scrollTop = 0;
  }

  // ========================
  // 🔹 AÇÕES DE MODAL
  // ========================
  function prepararEdicao(lote) {
    setModoEdicao(true);
    setNovoLote({
      id: lote.id,
      numero: lote.numero,
      tipo_id: lote.tipo_id,
      capacidade: lote.capacity_gavetas,
      foto_url: lote.foto_url || ""
    });
    setShowModal(true);
  }

  // Abre o pop-up específico de foto (o "atalho" pela miniatura)
  function abrirPopupFoto(lote) {
    setLoteSelecionado(lote);
    setModoEdicao(true);
    setNovoLote({
      id: lote.id,
      numero: lote.numero,
      tipo_id: lote.tipo_id,
      capacidade: lote.capacidade_gavetas,
      foto_url: lote.foto_url || ""
    });
    setShowUploadFoto(true);
  }

  async function handleSalvarLote() {
    if (!quadraSelecionada) return;

    const dadosLote = {
      numero: novoLote.numero,
      quadra_id: quadraSelecionada.id,
      tipo_id: parseInt(novoLote.tipo_id),
      capacidade_gavetas: parseInt(novoLote.capacidade),
      foto_url: novoLote.foto_url
    };

    let erroSalvar = null;
    let idLoteProcessado = novoLote.id;

    if (modoEdicao) {
      const { error } = await supabase.from("lotes").update(dadosLote).eq("id", novoLote.id);
      erroSalvar = error;
    } else {
      const { data, error } = await supabase.from("lotes").insert([dadosLote]).select().single();
      erroSalvar = error;
      idLoteProcessado = data?.id;
    }

    if (erroSalvar) return alert("Erro ao salvar: " + erroSalvar.message);

    // Sincroniza gavetas no banco
    await supabase.rpc('sincronizar_capacidade_lote', {
      p_lote_id: idLoteProcessado,
      p_nova_capacidade: parseInt(novoLote.capacidade)
    });

    fecharModais();
    carregarLotes(quadraSelecionada);
  }

  function fecharModais() {
    setShowModal(false);
    setShowUploadFoto(false);
    setModoEdicao(false);
    setNovoLote({ id: null, numero: "", tipo_id: "", capacidade: 1, foto_url: "" });
  }

  return (
    <div style={{
      padding: isMobile ? "5px" : "10px 20px 10px 10px",
      background: "#f2f2f7",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: 10,
      height: "100vh"
    }}>

      {/* PAINEL ESQUERDO: QUADRAS */}
      <div style={{
        flex: isMobile ? "0 0 auto" : 1,
        background: "#fff",
        borderRadius: 12,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        minHeight: isMobile ? 200 : 0
      }}>

        <h2 style={{ fontSize: "1rem", marginBottom: 8 }}>Quadras</h2>
        <div style={{overflowY:"auto",
             flex:1,
              maxHeight: isMobile ? 180 : "100%",
              marginTop: "-10px" }}
        >
          <table className="tabela">
            <tbody>
              {quadras.map(q => {
                const sel = quadraSelecionada?.id === q.id;
                return (
                  <tr key={q.id} onClick={() => carregarLotes(q)} style={{
                    cursor: "pointer",
                    background: sel ? "#e8f2ff" : "transparent",
                    color: sel ? "#1a73e8" : "inherit"
                  }}>
                    <td style={{ 
                      fontWeight: sel ? "600" : "400",
                      fontSize: "15px", // Fonte reduzida aqui
                      padding: "6px 8px"}}>{q.nome}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAINEL DIREITO: LOTES */}
      <div style={{
        flex: 3,
        background: "#fff",
        borderRadius: 12,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        marginRight: isMobile ? 0 : 20 // Espaço solicitado no lado direito
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", 
              alignItems: "center", marginBottom: 12, marginRight: isMobile ? 2 : 150, padding: "15" }}>
            <h2 style={{fontSize: "1rem", margin: 0}}>
              {quadraSelecionada ? `Lotes de ${quadraSelecionada.nome}` : "Selecione uma quadra"}
            </h2>

          {quadraSelecionada && (
            <div style={{ display: "flex", gap: 6 }}>
              {loteSelecionado && (
                <button onClick={() => prepararEdicao(loteSelecionado)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #1a73e8", color: "#1a73e8", background: "#fff", cursor: "pointer", fontWeight: "600" }}>
                  Editar Lote
                </button>
              )}
              <button onClick={() => { setModoEdicao(false); setShowModal(true); }} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#1a73e8", color: "#fff", cursor: "pointer", fontWeight: "600" }}>
                + Novo Lote
              </button>
            </div>
          )}
        </div>

        {quadraSelecionada && (
          <div ref={lotesScrollRef} style={{ overflowY: "auto", flex: 1 }}>
            <table className="tabela">
              <thead>
                <tr>
                  <th style={{ fontSize: "12px" }}>Lote</th>
                  <th style={{ fontSize: "12px" }}>Tipo</th>
                  <th style={{ width: 50, textAlign: "center", fontSize: "12px" }}>Vagas</th>
                  <th style={{ width: 50, textAlign: "center", fontSize: "12px" }}>Foto</th>
                </tr>
              </thead>
              <tbody>
                {lotes.map(l => {
                  const sel = loteSelecionado?.id === l.id;
                  return (
                    <tr key={l.id} 
                        onClick={() => setLoteSelecionado(l)} 
                        onDoubleClick={() => prepararEdicao(l)}
                        style={{
                          background: sel ? "#f0f7ff" : "transparent",
                          color: sel ? "#1a73e8" : "inherit",
                          cursor: "pointer"
                        }}>
                      <td style={{ fontWeight: sel ? "600" : "400", fontSize: "14px", padding: "6px 8px" }}>{l.numero}</td>
                      <td style={{ fontSize: "14px", padding: "6px 8px" }}>{l.tipos_lote?.descricao}</td>
                      <td style={{ textAlign: "center", fontSize: "14px", padding: "6px 8px" }}>{l.capacidade_gavetas}</td>
                      <td style={{ textAlign: "center", padding: "4px" }} onClick={(e) => { e.stopPropagation(); abrirPopupFoto(l); }}>
                        {l.foto_url ? (
                          <img src={l.foto_url} alt="Lote" style={{ width: 38, height: 38, borderRadius: 6, objectFit: "cover", border: "1px solid #ddd" }} />
                        ) : (
                          <span style={{ fontSize: "1.2rem", opacity: 0.5 }}>📷</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: CADASTRO COMPLETO */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: isMobile ? "90%" : 400 }}>
            <h3>{modoEdicao ? "Editar Lote" : "Novo Lote"}</h3>
            
            <label>Número do Lote:</label>
            <input type="text" value={novoLote.numero} onChange={e => setNovoLote({ ...novoLote, numero: e.target.value })} />
            
            <label>Tipo de Construção:</label>
            <select value={novoLote.tipo_id} onChange={e => setNovoLote({ ...novoLote, tipo_id: e.target.value })}>
              <option value="">Selecione...</option>
              {tiposLote.map(t => <option key={t.id} value={t.id}>{t.descricao}</option>)}
            </select>

            <label>Quantidade de Gavetas:</label>
            <input type="number" value={novoLote.capacidade} onChange={e => setNovoLote({ ...novoLote, capacidade: e.target.value })} />

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={fecharModais} style={{ flex: 1, padding: 12, background: "#eee", border: "none", borderRadius: 8, cursor: "pointer" }}>Cancelar</button>
              <button onClick={handleSalvarLote} style={{ flex: 1, padding: 12, background: "#1a73e8", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "600" }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: POP-UP DE FOTO */}
{showUploadFoto && (
  <div className="modal-overlay">
    <div className="modal-box" style={{ width: 340, textAlign: "center" }}>
      <h3 style={{ marginBottom: 15, fontSize: "1rem" }}>Foto do Lote {loteSelecionado?.numero}</h3>
      
      <div style={{ 
        margin: "0 auto 15px", 
        width: "100%", 
        height: 180, 
        background: "#f9f9f9", 
        borderRadius: 10, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        overflow: "hidden", 
        border: "1px solid #ddd" 
      }}>
        {novoLote.foto_url ? (
          <img src={novoLote.foto_url} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        ) : (
          <span style={{ color: "#999", fontSize: "12px" }}>Nenhuma foto</span>
        )}
      </div>

      {/* OPÇÕES DE CARREGAMENTO */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        
        {/* BOTÃO PARA TIRAR FOTO (CÂMERA) */}
        <label style={{ 
          background: "#34c759", color: "#fff", padding: "10px", borderRadius: 8, 
          cursor: "pointer", fontSize: "13px", fontWeight: "600", display: "block" 
        }}>
          📸 Tirar Foto Agora
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            onChange={handleUpload} 
            style={{ display: "none" }} 
          />
        </label>

        {/* BOTÃO PARA ESCOLHER ARQUIVO (GALERIA) */}
        <label style={{ 
          background: "#f2f2f7", color: "#555", padding: "10px", borderRadius: 8, 
          cursor: "pointer", fontSize: "13px", border: "1px solid #ddd", display: "block" 
        }}>
          🖼️ Escolher da Galeria
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleUpload} 
            style={{ display: "none" }} 
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={fecharModais} style={{ flex: 1, padding: 10, background: "#eee", border: "none", borderRadius: 8, fontSize: "13px" }}>Fechar</button>
        <button onClick={handleSalvarLote} style={{ flex: 1, padding: 10, background: "#1a73e8", color: "#fff", border: "none", borderRadius: 8, fontWeight: "600", fontSize: "13px" }}>Salvar Foto</button>
      </div>
    </div>
  </div>
)}

      {/* ESTILOS INTERNOS */}
      <style jsx>{`
        .modal-overlay { 
          position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
          background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; 
        }
        .modal-box { 
          background: #fff; padding: 25px; border-radius: 16px; display: flex; flex-direction: column; gap: 10px; 
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        .modal-box label { font-size: 0.85rem; font-weight: 600; color: #555; margin-top: 5px; text-align: left; }
        .modal-box input, .modal-box select { padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; }
        
        .tabela { width: 100%; border-collapse: collapse; }
        .tabela th { text-align: left; padding: 12px 8px; border-bottom: 2px solid #eee; color: #888; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .tabela td { padding: 12px 8px; border-bottom: 1px solid #f0f0f5; font-size: 0.95rem; }
        
        h2 { color: #333; }
      `}</style>

    </div>
  );
}