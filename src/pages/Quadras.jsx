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
  const [loading, setLoading] = useState(false);
  
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

    setLoading(true);
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("lotes").upload(fileName, file);

    if (error) {
      setLoading(false);
      return alert("Erro ao enviar imagem: " + error.message);
    }

    const { data } = supabase.storage.from("lotes").getPublicUrl(fileName);
    setNovoLote(prev => ({ ...prev, foto_url: data.publicUrl }));
    setLoading(false);
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
  }

  // ========================
  // 🔹 AÇÕES
  // ========================
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

    let idLoteProcessado = novoLote.id;

    if (modoEdicao) {
      const { error } = await supabase.from("lotes").update(dadosLote).eq("id", novoLote.id);
      if (error) return alert(error.message);
    } else {
      const { data, error } = await supabase.from("lotes").insert([dadosLote]).select().single();
      if (error) return alert(error.message);
      idLoteProcessado = data?.id;
    }

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
      padding: isMobile ? "5px" : "10px",
      background: "#f2f2f7",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: 10,
      height: isMobile ? "auto" : "100vh",
      minHeight: "100vh",
      overflowX: "hidden"
    }}>

      {/* PAINEL QUADRAS */}
      <div style={{
        flex: isMobile ? "0 0 auto" : 1,
        background: "#fff",
        borderRadius: 12,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        height: isMobile ? "150px" : "auto",
        minHeight: isMobile ? 120 : 0,
        marginBottom: isMobile ? 5 : 0 // Pequeno respiro entre os painéis
      }}>
        <h2 style={{ fontSize: "0.9rem", marginBottom: 5 }}>Quadras</h2>
        <div style={{ overflowY: "auto",  flex: 1,
              border: isMobile ? "1px solid #eee" : "none", // Borda leve para separar no mobile
              borderRadius: 6 }}>
          <table className="tabela">
            <tbody>
              {quadras.map(q => (
                <tr key={q.id} onClick={() => carregarLotes(q)} style={{
                  cursor: "pointer",
                  background: quadraSelecionada?.id === q.id ? "#e8f2ff" : "transparent"
                }}>
                  <td style={{ fontSize: "13px", padding: "6px 8px" }}>{q.nome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAINEL LOTES */}
      <div style={{
        flex: 3,
        background: "#fff",
        borderRadius: 12,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        marginRight: isMobile ? 0 : 20,
        height: isMobile ? "65vh" : "auto",
        overflow: "hidden"
      }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontSize: "1rem" }}>{quadraSelecionada ? quadraSelecionada.nome : "Selecione"}</h2>
          {quadraSelecionada && (
            <div style={{ display: "flex", gap: 6 }}>
              {loteSelecionado && <button onClick={() => prepararEdicao(loteSelecionado)} className="btn-edit">Editar</button>}
              <button onClick={() => { setModoEdicao(false); setShowModal(true); }} className="btn-new">+ Novo</button>
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
                  <tr key={l.id} onClick={() => setLoteSelecionado(l)} onDoubleClick={() => prepararEdicao(l)}
                      style={{ background: loteSelecionado?.id === l.id ? "#f0f7ff" : "transparent" }}>
                    <td style={{ fontWeight: loteSelecionado?.id === l.id ? "600" : "400" }}>{l.numero}</td>
                    <td>{l.tipos_lote?.descricao}</td>
                    <td style={{ textAlign: "center" }}>{l.capacidade_gavetas}</td>
                    <td style={{ textAlign: "center" }} onClick={(e) => { e.stopPropagation(); abrirPopupFoto(l); }}>
                      {l.foto_url ? <img src={l.foto_url} style={{ width: 28, height: 28, borderRadius: 4, objectFit: "cover" }} /> : "📷"}
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
          <div className="modal-box" style={{ width: 320, textAlign: "center" }}>
            <h3 style={{ fontSize: "1rem" }}>Foto: Lote {loteSelecionado?.numero}</h3>
            <div className="preview-foto">
              {loading ? "Enviando..." : novoLote.foto_url ? <img src={novoLote.foto_url} /> : "Sem foto"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label className="label-camera">
                📸 Tirar Foto
                <input type="file" accept="image/*" capture="environment" onChange={handleUpload} style={{ display: "none" }} />
              </label>
              <label className="label-galeria">
                🖼️ Galeria
                <input type="file" accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
              </label>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 15 }}>
              <button onClick={fecharModais} className="btn-cancel">Fechar</button>
              <button onClick={handleSalvarLote} className="btn-save">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DADOS */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: 320 }}>
            <h3>{modoEdicao ? "Editar Lote" : "Novo Lote"}</h3>
            <label>Número:</label>
            <input type="text" value={novoLote.numero} onChange={e => setNovoLote({ ...novoLote, numero: e.target.value })} />
            <label>Tipo:</label>
            <select value={novoLote.tipo_id} onChange={e => setNovoLote({ ...novoLote, tipo_id: e.target.value })}>
              <option value="">Selecione...</option>
              {tiposLote.map(t => <option key={t.id} value={t.id}>{t.descricao}</option>)}
            </select>
            <label>Vagas:</label>
            <input type="number" value={novoLote.capacidade} onChange={e => setNovoLote({ ...novoLote, capacidade: e.target.value })} />
            <div style={{ display: "flex", gap: 8, marginTop: 15 }}>
              <button onClick={fecharModais} className="btn-cancel">Sair</button>
              <button onClick={handleSalvarLote} className="btn-save">Salvar</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .tabela-container { overflow: auto; height: 100%; width: 100%; -webkit-overflow-scrolling: touch; }
        .tabela { width: max-content; min-width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; table-layout: fixed; }
        .tabela td, .tabela th { padding: 6px 10px; border-bottom: 1px solid #eee; background: white; white-space: nowrap; }
        .tabela thead th { position: sticky; top: 0; z-index: 3; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        .tabela th:first-child, .tabela td:first-child { position: sticky; left: 0; z-index: 2; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal-box { background: #fff; padding: 20px; border-radius: 12px; display: flex; flex-direction: column; gap: 8px; }
        .preview-foto { height: 160px; background: #f9f9f9; margin-bottom: 10px; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px dashed #ccc; }
        .preview-foto img { width: 100%; height: 100%; object-fit: contain; }
        .label-camera { background: #34c759; color: #fff; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; text-align: center; }
        .label-galeria { background: #f2f2f7; color: #555; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 13px; border: 1px solid #ddd; text-align: center; }
        .btn-new { background: #1a73e8; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; }
        .btn-edit { background: #fff; color: #1a73e8; border: 1px solid #1a73e8; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; }
        .btn-save { background: #1a73e8; color: #fff; border: none; flex: 1; padding: 10px; border-radius: 8px; font-size: 13px; }
        .btn-cancel { background: #eee; border: none; flex: 1; padding: 10px; border-radius: 8px; font-size: 13px; }
        input, select { padding: 8px; border-radius: 6px; border: 1px solid #ddd; font-size: 14px; }
      `}</style>
    </div>
  );
}