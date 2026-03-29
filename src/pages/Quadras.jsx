import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { processarEUploadFoto } from "../utils/uploadService";
import { Camera, Map, Edit3, Plus, Loader2, CheckCircle2, AlertCircle, CloudUpload, FileText } from "lucide-react";
import "../styles/modal.css";

// --- COMPONENTE: INDICADOR DE SINCRONIZAÇÃO ---
const SyncBadge = ({ count, onSync, syncing }) => {
  if (count === 0) return null;
  return (
    <div 
      onClick={!syncing ? onSync : null}
      style={{
        position: "fixed", bottom: "20px", right: "20px", zIndex: 9999,
        background: syncing ? "#94a3b8" : "#f59e0b", color: "#fff",
        padding: "10px 16px", borderRadius: "50px", display: "flex", alignItems: "center",
        gap: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", cursor: "pointer",
        transition: "transform 0.2s"
      }}
    >
      {syncing ? <Loader2 size={18} className="animate-spin" /> : <CloudUpload size={18} />}
      <span style={{ fontSize: "12px", fontWeight: "bold" }}>
        {syncing ? "SINCRONIZANDO..." : `${count} LOTE(S) OFFLINE`}
      </span>
    </div>
  );
};

// --- SUB-COMPONENTE DE CARD DE LOTE ---
const LoteCard = ({ lote, selecionado, onClick, abrirFoto }) => (
  <div 
    onClick={onClick}
    style={{
      background: selecionado ? "#f0fdf4" : "var(--jardim-pedra)",
      borderRadius: "8px", padding: "10px 12px", marginBottom: "8px", cursor: "pointer",
      border: selecionado ? "1px solid var(--jardim-primaria)" : "1px solid #e2e8f0",
      borderLeft: `4px solid ${lote.foto_url ? "var(--jardim-acento)" : "#cbd5e0"}`,
      display: "flex", alignItems: "center", justifyContent: "space-between"
    }}
  >
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontWeight: "600", color: selecionado ? "var(--jardim-primaria)" : "#334155", fontSize: "14px" }}>
        Lote {lote.numero}
      </div>
      <div style={{ fontSize: "11px", color: "#64748b" }}>
        {lote.tipos_lote?.descricao || "PADRÃO"} • {lote.capacidade_gavetas} VAGAS
      </div>
      {/* Visualização rápida da observação */}
      {lote.observacoes && (
        <div style={{ 
          fontSize: "10px", color: "var(--jardim-primaria)", fontStyle: "italic", 
          marginTop: "4px", display: "flex", alignItems: "center", gap: "4px",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" 
        }}>
          <FileText size={10} /> {lote.observacoes}
        </div>
      )}
    </div>
    <div 
      onClick={(e) => { e.stopPropagation(); abrirFoto(lote); }}
      style={{
        width: "38px", height: "38px", borderRadius: "8px", background: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0", overflow: "hidden", marginLeft: "10px"
      }}
    >
      {lote.foto_url ? <img src={lote.foto_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Lote" /> : <Camera size={16} color="#94a3b8" />}
    </div>
  </div>
);

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
  const [syncing, setSyncing] = useState(false);
  const [feedback, setFeedback] = useState({ msg: "", tipo: "" }); 
  const [offlineCount, setOfflineCount] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const [novoLote, setNovoLote] = useState({ 
    id: null, numero: "", tipo_id: "", capacidade: 1, foto_url: "", observacoes: "" 
  });

  useEffect(() => {
    carregarQuadras();
    carregarTipos();
    atualizarContagemOffline();
    const resize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", resize);
    window.addEventListener("online", handleSincronizar);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("online", handleSincronizar);
    };
  }, []);

  // --- LÓGICA OFFLINE ---
  const atualizarContagemOffline = () => {
    const fila = JSON.parse(localStorage.getItem("fila_lotes_offline") || "[]");
    setOfflineCount(fila.length);
  };

  const salvarOffline = (dados) => {
    const fila = JSON.parse(localStorage.getItem("fila_lotes_offline") || "[]");
    fila.push({ ...dados, tempId: Date.now() });
    localStorage.setItem("fila_lotes_offline", JSON.stringify(fila));
    atualizarContagemOffline();
  };

    const handleSincronizar = async () => {
      const fila = JSON.parse(localStorage.getItem("fila_lotes_offline") || "[]");
      if (fila.length === 0 || syncing) return;

      setSyncing(true);
      const falhas = [];

      for (const item of fila) {
        try {
          const { tempId, id, ...dadosParaEnvio } = item;
          let erroSincronismo = null;
          let idFinal = id;

          if (id) {
            // MODO EDIÇÃO: Atualiza o existente
            const { error } = await supabase.from("lotes").update(dadosParaEnvio).eq("id", id);
            erroSincronismo = error;
          } else {
            // MODO NOVO: Insere um novo
            const { data, error } = await supabase.from("lotes").insert([dadosParaEnvio]).select().single();
            erroSincronismo = error;
            if (data) idFinal = data.id;
          }

          if (erroSincronismo) {
            if (erroSincronismo.code === '23505') continue; 
            throw erroSincronismo;
          }

          // Sincroniza as gavetas/capacidade após o sucesso do lote
          await supabase.rpc('sincronizar_capacidade_lote', { 
            p_lote_id: idFinal, 
            p_nova_capacidade: dadosParaEnvio.capacidade_gavetas 
          });

        } catch (e) {
          console.error("Falha ao sincronizar item:", e);
          falhas.push(item);
        }
      }

      localStorage.setItem("fila_lotes_offline", JSON.stringify(falhas));
      atualizarContagemOffline();
      setSyncing(false);
      
      if (falhas.length === 0) {
        setFeedback({ msg: "✅ Tudo sincronizado!", tipo: "sucesso" });
        if (quadraSelecionada) carregarLotes(quadraSelecionada);
      }
    };

  // --- LÓGICA DE DADOS ---
  async function carregarQuadras() {
    const { data } = await supabase.from("quadras").select("*").order("nome");
    setQuadras(data || []);
  }

  async function carregarTipos() {
    const { data } = await supabase.from("tipos_lote").select("*").order("descricao");
    setTiposLote(data || []);
  }

  async function carregarLotes(q) {
    setQuadraSelecionada(q);
    setLoteSelecionado(null);
    setLoading(true);
    const { data } = await supabase
      .from("lotes")
      .select(`id, numero, capacidade_gavetas, tipo_id, foto_url, observacoes, tipos_lote (id, descricao)`)
      .eq("quadra_id", q.id).order("numero");
    setLotes(data || []);
    setLoading(false);
  }

  async function handleSalvarLote() {
  if (!quadraSelecionada && !showUploadFoto) return;
  
  const dadosLote = {
    // Se for edição, incluímos o ID para o sincronizador saber o que fazer
    ...(modoEdicao && { id: novoLote.id }), 
    numero: novoLote.numero,
    quadra_id: quadraSelecionada.id,
    tipo_id: parseInt(novoLote.tipo_id),
    capacidade_gavetas: parseInt(novoLote.capacidade),
    foto_url: novoLote.foto_url,
    observacoes: novoLote.observacoes
  };


    setLoading(true);
    setFeedback({ msg: "Processando...", tipo: "info" });

    if (!navigator.onLine) {
      salvarOffline(dadosLote);
      setFeedback({ msg: "📶 Salvo no dispositivo!", tipo: "sucesso" });
      finalizar();
      return;
    }

    try {
      if (showUploadFoto) {
        await supabase.from("lotes").update({ foto_url: novoLote.foto_url }).eq("id", loteSelecionado.id);
      } else if (modoEdicao) {
        await supabase.from("lotes").update(dadosLote).eq("id", novoLote.id);
        await supabase.rpc('sincronizar_capacidade_lote', { p_lote_id: novoLote.id, p_nova_capacidade: dadosLote.capacidade_gavetas });
      } else {
        const { data, error } = await supabase.from("lotes").insert([dadosLote]).select().single();
        if (error) throw error;
        await supabase.rpc('sincronizar_capacidade_lote', { p_lote_id: data.id, p_nova_capacidade: dadosLote.capacidade_gavetas });
      }
      setFeedback({ msg: "✅ Salvo com sucesso!", tipo: "sucesso" });
      finalizar();
    } catch (err) {
      if (!navigator.onLine || err.message.includes("fetch")) {
        salvarOffline(dadosLote);
        setFeedback({ msg: "⚠️ Sem rede. Salvo offline.", tipo: "info" });
        finalizar();
      } else {
        setFeedback({ msg: "❌ Erro: " + err.message, tipo: "erro" });
        setLoading(false);
      }
    }
  }

  const finalizar = () => {
    setTimeout(() => {
      fecharModais();
      if (quadraSelecionada && navigator.onLine) carregarLotes(quadraSelecionada);
    }, 1500);
  };

  const fecharModais = () => {
    setShowModal(false);
    setShowUploadFoto(false);
    setModoEdicao(false);
    setFeedback({ msg: "", tipo: "" });
    setNovoLote({ id: null, numero: "", tipo_id: "", capacidade: 1, foto_url: "", observacoes: "" });
    setLoading(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setFeedback({ msg: "Enviando imagem...", tipo: "info" });
    try {
      const url = await processarEUploadFoto(file, `lotes/lote_${loteSelecionado.id}_${Date.now()}`);
      setNovoLote(prev => ({ ...prev, foto_url: url }));
      setFeedback({ msg: "✅ Imagem OK!", tipo: "sucesso" });
    } catch (err) {
      setFeedback({ msg: "❌ Erro no upload", tipo: "erro" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: "flex", flexDirection: isMobile ? "column" : "row",
      padding: isMobile ? "10px" : "20px", gap: "15px", height: "100vh", background: "#f8fafc", overflow: "hidden"
    }}>
      
      <SyncBadge count={offlineCount} onSync={handleSincronizar} syncing={syncing} />

      {/* PAINEL QUADRAS (Scroll Horizontal) */}
      <div style={{
        flex: isMobile ? "none" : "0 0 250px", background: "#fff", borderRadius: "12px", padding: "15px",
        border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", maxHeight: isMobile ? "180px" : "100%", overflow: "hidden"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Map size={18} color="var(--jardim-primaria)" />
          <h2 style={{ fontSize: "0.9rem", fontWeight: "700", color: "#334155" }}>QUADRAS</h2>
        </div>
        <div style={{ 
          display: "flex", flexDirection: isMobile ? "row" : "column", gap: "8px", 
          overflowX: "auto", overflowY: isMobile ? "hidden" : "auto", paddingBottom: isMobile ? "10px" : "0", WebkitOverflowScrolling: "touch"
        }}>
          {quadras.map(q => (
            <div key={q.id} onClick={() => carregarLotes(q)} 
              style={{ 
                padding: isMobile ? "12px 20px" : "10px 15px", borderRadius: "10px", cursor: "pointer",
                background: quadraSelecionada?.id === q.id ? "var(--jardim-primaria)" : "#f1f5f9",
                color: quadraSelecionada?.id === q.id ? "#fff" : "#475569",
                fontWeight: "600", fontSize: isMobile ? "14px" : "13px", whiteSpace: "nowrap", minWidth: "max-content", border: "1px solid #e2e8f0"
              }}>
              {q.nome}
            </div>
          ))}
        </div>
      </div>

      {/* PAINEL LOTES */}
      <div style={{ flex: 1, background: "#fff", borderRadius: "12px", padding: "15px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <div>
            <span style={{ fontSize: "9px", color: "#94a3b8", fontWeight: "700" }}>{navigator.onLine ? "MODO ONLINE" : "MODO OFFLINE"}</span>
            <h2 style={{ fontSize: "1.2rem", color: "var(--jardim-primaria)", fontWeight: "700" }}>{quadraSelecionada ? quadraSelecionada.nome : "Selecione a Quadra"}</h2>
          </div>
          {quadraSelecionada && (
            <div style={{ display: "flex", gap: "8px" }}>
              {loteSelecionado && (
                <button onClick={() => { setModoEdicao(true); setNovoLote({ id: loteSelecionado.id, numero: loteSelecionado.numero, tipo_id: loteSelecionado.tipo_id, capacidade: loteSelecionado.capacidade_gavetas, foto_url: loteSelecionado.foto_url, observacoes: loteSelecionado.observacoes || "" }); setShowModal(true); }} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", padding: "10px", borderRadius: "10px" }}><Edit3 size={18} color="var(--jardim-primaria)" /></button>
              )}
              <button onClick={() => { setModoEdicao(false); setShowModal(true); }} style={{ background: "var(--jardim-primaria)", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "10px", fontWeight: "700", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}><Plus size={18} /> NOVO</button>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading && lotes.length === 0 ? <p style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>Buscando lotes...</p> : 
            lotes.map(l => <LoteCard key={l.id} lote={l} selecionado={loteSelecionado?.id === l.id} onClick={() => setLoteSelecionado(l)} abrirFoto={(lote) => { setLoteSelecionado(lote); setNovoLote(prev => ({ ...prev, id: lote.id, foto_url: lote.foto_url || "" })); setShowUploadFoto(true); }} />)
          }
        </div>
      </div>

      {/* MODAL DADOS */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 style={{ fontWeight: "700", color: "var(--jardim-primaria)", marginBottom: "15px" }}>{modoEdicao ? "Editar Lote" : "Novo Lote"}</h3>
            
            {feedback.msg && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "12px", background: feedback.tipo === "sucesso" ? "#ecfdf5" : "#eff6ff", color: feedback.tipo === "sucesso" ? "#059669" : "#2563eb" }}>
                {feedback.tipo === "sucesso" ? <CheckCircle2 size={14} /> : <Loader2 size={14} className="animate-spin" />}
                {feedback.msg}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input placeholder="Número do Lote" type="text" value={novoLote.numero} onChange={e => setNovoLote({ ...novoLote, numero: e.target.value })} disabled={loading} />
              
              <select value={novoLote.tipo_id} onChange={e => setNovoLote({ ...novoLote, tipo_id: e.target.value })} disabled={loading}>
                <option value="">Selecione o Tipo...</option>
                {tiposLote.map(t => <option key={t.id} value={t.id}>{t.descricao}</option>)}
              </select>

              <input placeholder="Capacidade (Vagas)" type="number" value={novoLote.capacidade} onChange={e => setNovoLote({ ...novoLote, capacidade: e.target.value })} disabled={loading} />

              <textarea 
                placeholder="Observações (ex: rachaduras, acesso difícil...)"
                value={novoLote.observacoes}
                onChange={e => setNovoLote({ ...novoLote, observacoes: e.target.value })}
                disabled={loading}
                style={{ width: "100%", minHeight: "80px", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", fontFamily: "inherit", resize: "none" }}
              />
            </div>

            <div className="modal-row-buttons" style={{ marginTop: "20px" }}>
              <button onClick={fecharModais} className="btn-cancel" disabled={loading}>CANCELAR</button>
              <button onClick={handleSalvarLote} className="btn-save" disabled={loading} style={{ background: "var(--jardim-primaria)" }}>{loading ? "SALVANDO..." : "CONFIRMAR"}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FOTO */}
      {showUploadFoto && (
        <div className="modal-overlay">
          <div className="modal-box-vertical">
            <h3 style={{ marginBottom: "15px" }}>Foto: Lote {loteSelecionado?.numero}</h3>
            <div className="preview-foto-vertical">
              {novoLote.foto_url ? <img src={novoLote.foto_url} alt="Preview" /> : <div className="sem-foto-v"><span>📷 Sem foto</span></div>}
            </div>
            <div className="modal-row-buttons" style={{ marginTop: "15px" }}>
              <label className="btn-captura-v camera">📸 Tirar Foto<input type="file" accept="image/*" capture="environment" onChange={handleUpload} style={{ display: "none" }} /></label>
              <button onClick={fecharModais} className="btn-cancel">Fechar</button>
              <button onClick={handleSalvarLote} className="btn-save" disabled={loading || !novoLote.foto_url}>Salvar Foto</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}