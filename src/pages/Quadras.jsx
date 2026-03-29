import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { processarEUploadFoto, deletarArquivoStorage } from "../utils/uploadService";
import { Camera, Map, Edit3, Plus, ChevronRight, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import "../styles/modal.css";

// --- SUB-COMPONENTE DE CARD DE LOTE ---
const LoteCard = ({ lote, selecionado, onClick, abrirFoto }) => (
  <div 
    onClick={onClick}
    style={{
      background: selecionado ? "#f0fdf4" : "var(--jardim-pedra)",
      borderRadius: "8px",
      padding: "8px 12px",
      marginBottom: "6px",
      cursor: "pointer",
      border: selecionado ? "1px solid var(--jardim-primaria)" : "1px solid #e2e8f0",
      borderLeft: `3px solid ${lote.foto_url ? "var(--jardim-acento)" : "#cbd5e0"}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      transition: "all 0.2s"
    }}
  >
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: "600", color: selecionado ? "var(--jardim-primaria)" : "#334155", fontSize: "13px" }}>
        Lote {lote.numero}
      </div>
      <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "400" }}>
        {lote.tipos_lote?.descricao || "PADRÃO"} • {lote.capacidade_gavetas} VAGAS
      </div>
    </div>
    
    <div 
      onClick={(e) => { e.stopPropagation(); abrirFoto(lote); }}
      style={{
        width: "34px", height: "34px", borderRadius: "6px", background: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0", overflow: "hidden"
      }}
    >
      {lote.foto_url ? (
        <img src={lote.foto_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <Camera size={14} color="#94a3b8" />
      )}
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
  
  // NOVO ESTADO PARA MENSAGENS DE RETORNO
  const [feedback, setFeedback] = useState({ msg: "", tipo: "" }); 

  const [novoLote, setNovoLote] = useState({ id: null, numero: "", tipo_id: "", capacidade: 1, foto_url: "" });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    carregarQuadras();
    carregarTipos();
    const resize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

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
      .select(`id, numero, capacidade_gavetas, tipo_id, foto_url, tipos_lote (id, descricao)`)
      .eq("quadra_id", q.id)
      .order("numero");
    setLotes(data || []);
    setLoading(false);
  }

  // --- LÓGICA DE SALVAMENTO COM MENSAGEM DE RETORNO ---
  async function handleSalvarLote() {
    if (!quadraSelecionada && !showUploadFoto) return;
    
    setLoading(true);
    setFeedback({ msg: "Processando...", tipo: "info" });
    const capacidadeNum = parseInt(novoLote.capacidade);

    try {
      if (showUploadFoto) {
        await supabase.from("lotes").update({ foto_url: novoLote.foto_url }).eq("id", loteSelecionado.id);
      } else {
        const dadosLote = {
          numero: novoLote.numero,
          quadra_id: quadraSelecionada.id,
          tipo_id: parseInt(novoLote.tipo_id),
          capacidade_gavetas: capacidadeNum,
          foto_url: novoLote.foto_url
        };

        if (modoEdicao) {
          await supabase.from("lotes").update(dadosLote).eq("id", novoLote.id);
          await supabase.rpc('sincronizar_capacidade_lote', { p_lote_id: novoLote.id, p_nova_capacidade: capacidadeNum });
        } else {
          const { data, error: errorInsert } = await supabase.from("lotes").insert([dadosLote]).select().single();
          if (errorInsert) throw errorInsert;
          await supabase.rpc('sincronizar_capacidade_lote', { p_lote_id: data.id, p_nova_capacidade: capacidadeNum });
        }
      }

      setFeedback({ msg: "Salvo com sucesso!", tipo: "sucesso" });
      
      // Pequeno delay para o usuário ler a mensagem antes de fechar
      setTimeout(() => {
        fecharModais();
        carregarLotes(quadraSelecionada);
      }, 1000);

    } catch (err) { 
      setFeedback({ msg: "Erro: " + err.message, tipo: "erro" });
    } finally {
      setLoading(false);
    }
  }

  const fecharModais = () => {
    setShowModal(false);
    setShowUploadFoto(false);
    setModoEdicao(false);
    setFeedback({ msg: "", tipo: "" }); // Limpa a mensagem
    setNovoLote({ id: null, numero: "", tipo_id: "", capacidade: 1, foto_url: "" });
  };

  // Funções de upload fictícias (ajuste conforme seu uploadService)
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setFeedback({ msg: "Enviando imagem...", tipo: "info" });
    try {
      const url = await processarEUploadFoto(file, `lotes/${loteSelecionado.id}`);
      setNovoLote({ ...novoLote, foto_url: url });
      setFeedback({ msg: "Imagem processada!", tipo: "sucesso" });
    } catch (err) {
      setFeedback({ msg: "Erro no upload", tipo: "erro" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: "flex", flexDirection: isMobile ? "column" : "row",
      padding: isMobile ? "10px" : "20px", gap: "15px", height: "100vh", background: "#f8fafc", overflow: "hidden"
    }}>

      {/* PAINEL QUADRAS */}
      <div style={{
        flex: isMobile ? "none" : "0 0 250px",
        background: "#fff", borderRadius: "12px", padding: "15px",
        border: "1px solid #e2e8f0", display: "flex", flexDirection: "column",
        maxHeight: isMobile ? "160px" : "100%"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Map size={16} color="var(--jardim-primaria)" />
          <h2 style={{ fontSize: "0.9rem", fontWeight: "600", color: "#334155" }}>QUADRAS</h2>
        </div>
        
        <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", gap: "4px", overflow: "auto" }}>
          {quadras.map(q => (
            <div 
              key={q.id} 
              onClick={() => carregarLotes(q)} 
              style={{ 
                padding: "8px 12px", borderRadius: "8px", cursor: "pointer",
                background: quadraSelecionada?.id === q.id ? "var(--jardim-primaria)" : "transparent",
                color: quadraSelecionada?.id === q.id ? "#fff" : "#64748b",
                fontWeight: "500", fontSize: "12px", whiteSpace: "nowrap"
              }}
            >
              {q.nome}
            </div>
          ))}
        </div>
      </div>

      {/* PAINEL LOTES */}
      <div style={{
        flex: 1, background: "#fff", borderRadius: "12px", padding: "15px",
        border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <div>
            <span style={{ fontSize: "9px", color: "#94a3b8", fontWeight: "600" }}>EXPLORANDO</span>
            <h2 style={{ fontSize: "1.1rem", color: "var(--jardim-primaria)", fontWeight: "600" }}>
              {quadraSelecionada ? quadraSelecionada.nome : "Selecione"}
            </h2>
          </div>
          
          {quadraSelecionada && (
            <div style={{ display: "flex", gap: "8px" }}>
              {loteSelecionado && (
                <button 
                  onClick={() => {
                    setModoEdicao(true);
                    setNovoLote({ id: loteSelecionado.id, numero: loteSelecionado.numero, tipo_id: loteSelecionado.tipo_id, capacidade: loteSelecionado.capacidade_gavetas, foto_url: loteSelecionado.foto_url });
                    setShowModal(true);
                  }}
                  style={{ background: "var(--jardim-pedra)", border: "1px solid #e2e8f0", padding: "8px", borderRadius: "8px" }}
                >
                  <Edit3 size={16} color="var(--jardim-primaria)" />
                </button>
              )}
              <button 
                onClick={() => { setModoEdicao(false); setShowModal(true); }}
                style={{ background: "var(--jardim-primaria)", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: "600", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px" }}
              >
                <Plus size={16} /> NOVO
              </button>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
          {loading && lotes.length === 0 ? (
            <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>Processando...</p>
          ) : (
            lotes.map(l => (
              <LoteCard 
                key={l.id} 
                lote={l} 
                selecionado={loteSelecionado?.id === l.id}
                onClick={() => setLoteSelecionado(l)}
                abrirFoto={(lote) => {
                  setLoteSelecionado(lote);
                  setNovoLote({ ...novoLote, id: lote.id, foto_url: lote.foto_url || "" });
                  setShowUploadFoto(true);
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* MODAL DADOS */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ borderRadius: "16px", maxWidth: "400px" }}>
            <h3 style={{ fontWeight: "600", color: "var(--jardim-primaria)", fontSize: "1rem" }}>{modoEdicao ? "Editar Lote" : "Novo Lote"}</h3>
            
            {/* ÁREA DE MENSAGEM DE RETORNO NO MODAL */}
            {feedback.msg && (
              <div style={{
                display: "flex", alignItems: "center", gap: "8px", padding: "10px", borderRadius: "8px", marginTop: "10px",
                background: feedback.tipo === "sucesso" ? "#ecfdf5" : feedback.tipo === "erro" ? "#fef2f2" : "#eff6ff",
                color: feedback.tipo === "sucesso" ? "#059669" : feedback.tipo === "erro" ? "#dc2626" : "#2563eb",
                fontSize: "12px", fontWeight: "600", border: "1px solid transparent"
              }}>
                {feedback.tipo === "sucesso" ? <CheckCircle2 size={14} /> : feedback.tipo === "erro" ? <AlertCircle size={14} /> : <Loader2 size={14} className="animate-spin" />}
                {feedback.msg}
              </div>
            )}

            <div style={{ marginTop: "12px" }}>
              <label style={{ fontSize: "11px", fontWeight: "500", color: "#64748b" }}>NÚMERO</label>
              <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "4px" }} type="text" value={novoLote.numero} onChange={e => setNovoLote({ ...novoLote, numero: e.target.value })} />
            </div>

            <div style={{ marginTop: "12px" }}>
              <label style={{ fontSize: "11px", fontWeight: "500", color: "#64748b" }}>TIPO</label>
              <select style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "4px" }} value={novoLote.tipo_id} onChange={e => setNovoLote({ ...novoLote, tipo_id: e.target.value })}>
                <option value="">Selecione...</option>
                {tiposLote.map(t => <option key={t.id} value={t.id}>{t.descricao}</option>)}
              </select>
            </div>

            <div style={{ marginTop: "12px" }}>
              <label style={{ fontSize: "11px", fontWeight: "500", color: "#64748b" }}>CAPACIDADE (VAGAS)</label>
              <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "4px" }} type="number" value={novoLote.capacidade} onChange={e => setNovoLote({ ...novoLote, capacidade: e.target.value })} />
            </div>

            <div className="modal-row-buttons" style={{ marginTop: "20px" }}>
              <button onClick={fecharModais} className="btn-cancel">CANCELAR</button>
              <button 
                onClick={handleSalvarLote} 
                className="btn-save" 
                disabled={loading}
                style={{ background: "var(--jardim-primaria)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {modoEdicao ? "ATUALIZAR" : "CONFIRMAR"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* MODAL FOTO */}
      {showUploadFoto && (
        <div className="modal-overlay">
          <div className="modal-box-vertical">
            <h3>Foto: Lote {loteSelecionado?.numero}</h3>

            {/* ÁREA DE MENSAGEM DE RETORNO NO MODAL DE FOTO */}
            {feedback.msg && (
              <div style={{
                display: "flex", alignItems: "center", gap: "8px", padding: "10px", borderRadius: "8px", marginBottom: "10px",
                background: feedback.tipo === "sucesso" ? "#ecfdf5" : "#fef2f2",
                color: feedback.tipo === "sucesso" ? "#059669" : "#dc2626",
                fontSize: "12px", fontWeight: "600"
              }}>
                {feedback.msg}
              </div>
            )}
            
            <div className="preview-foto-vertical">
              {loading && !novoLote.foto_url ? "Processando..." : novoLote.foto_url ? (
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

    </div>
  );
}