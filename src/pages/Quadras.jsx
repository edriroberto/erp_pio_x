import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { processarEUploadFoto, deletarArquivoStorage } from "../utils/uploadService";
import { Camera, Map, Box, Edit3, Plus, ChevronRight, Image as ImageIcon } from "lucide-react";
import "../styles/modal.css";

// --- SUB-COMPONENTE DE CARD DE LOTE ---
const LoteCard = ({ lote, selecionado, onClick, abrirFoto }) => (
  <div 
    onClick={onClick}
    style={{
      background: selecionado ? "#f0fdf4" : "var(--jardim-pedra)",
      borderRadius: "8px",
      padding: "10px",
      marginBottom: "8px",
      cursor: "pointer",
      border: selecionado ? "1px solid var(--jardim-primaria)" : "1px solid #e2e8f0",
      borderLeft: `4px solid ${lote.foto_url ? "var(--jardim-acento)" : "#cbd5e0"}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      transition: "all 0.2s"
    }}
  >
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: "800", color: "var(--jardim-primaria)", fontSize: "14px" }}>
        LOTE {lote.numero}
      </div>
      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px", fontWeight: "600" }}>
        {lote.tipos_lote?.descricao?.toUpperCase() || "NÃO DEFINIDO"} • {lote.capacidade_gavetas} VAGAS
      </div>
    </div>
    
    <div 
      onClick={(e) => { e.stopPropagation(); abrirFoto(lote); }}
      style={{
        width: "40px", height: "40px", borderRadius: "6px", background: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0", overflow: "hidden"
      }}
    >
      {lote.foto_url ? (
        <img src={lote.foto_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <Camera size={18} color="#94a3b8" />
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

  // --- LÓGICA DE SALVAMENTO ---
  async function handleSalvarLote() {
    if (!quadraSelecionada && !showUploadFoto) return;
    setLoading(true);
    try {
      if (showUploadFoto) {
        await supabase.from("lotes").update({ foto_url: novoLote.foto_url }).eq("id", loteSelecionado.id);
      } else {
        const dadosLote = {
          numero: novoLote.numero,
          quadra_id: quadraSelecionada.id,
          tipo_id: parseInt(novoLote.tipo_id),
          capacidade_gavetas: parseInt(novoLote.capacidade),
          foto_url: novoLote.foto_url
        };
        if (modoEdicao) {
          await supabase.from("lotes").update(dadosLote).eq("id", novoLote.id);
        } else {
          await supabase.from("lotes").insert([dadosLote]);
        }
      }
      fecharModais();
      carregarLotes(quadraSelecionada);
    } catch (err) { alert(err.message); }
    setLoading(false);
  }

  const fecharModais = () => {
    setShowModal(false);
    setShowUploadFoto(false);
    setModoEdicao(false);
    setNovoLote({ id: null, numero: "", tipo_id: "", capacidade: 1, foto_url: "" });
  };

  return (
    <div style={{ 
      display: "flex", flexDirection: isMobile ? "column" : "row",
      padding: isMobile ? "10px" : "20px", gap: "15px", minHeight: "100vh", background: "#f8fafc"
    }}>

      {/* PAINEL QUADRAS */}
      <div style={{
        flex: isMobile ? "none" : "0 0 280px",
        background: "#fff", borderRadius: "12px", padding: "15px",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px" }}>
          <Map size={18} color="var(--jardim-primaria)" />
          <h2 style={{ fontSize: "1rem", fontWeight: "800", color: "#334155" }}>QUADRAS</h2>
        </div>
        
        <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", gap: "4px", overflowX: "auto" }}>
          {quadras.map(q => (
            <div 
              key={q.id} 
              onClick={() => carregarLotes(q)} 
              style={{ 
                padding: "10px 15px", borderRadius: "8px", cursor: "pointer",
                background: quadraSelecionada?.id === q.id ? "var(--jardim-primaria)" : "transparent",
                color: quadraSelecionada?.id === q.id ? "#fff" : "#64748b",
                fontWeight: "700", fontSize: "12px", transition: "0.2s",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                whiteSpace: "nowrap"
              }}
            >
              {q.nome.toUpperCase()}
              {!isMobile && <ChevronRight size={14} opacity={quadraSelecionada?.id === q.id ? 1 : 0} />}
            </div>
          ))}
        </div>
      </div>

      {/* PAINEL LOTES */}
      <div style={{
        flex: 1, background: "#fff", borderRadius: "12px", padding: "15px",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0",
        display: "flex", flexDirection: "column"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "700" }}>EXPLORANDO</span>
            <h2 style={{ fontSize: "1.2rem", color: "var(--jardim-primaria)", fontWeight: "900" }}>
              {quadraSelecionada ? quadraSelecionada.nome : "SELECIONE UMA QUADRA"}
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
                  <Edit3 size={18} color="var(--jardim-primaria)" />
                </button>
              )}
              <button 
                onClick={() => { setModoEdicao(false); setShowModal(true); }}
                style={{ background: "var(--jardim-primaria)", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", display: "flex", alignItems: "center", gap: "5px" }}
              >
                <Plus size={18} /> NOVO
              </button>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <p style={{ textAlign: "center", color: "#94a3b8", marginTop: "20px" }}>Carregando lotes...</p>
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

      {/* MODAL FOTO (REESTILIZADO) */}
      {showUploadFoto && (
        <div className="modal-overlay">
          <div className="modal-box-vertical" style={{ background: "var(--jardim-pedra)" }}>
            <h3 style={{ color: "var(--jardim-primaria)", fontWeight: "900" }}>FOTO LOTE {loteSelecionado?.numero}</h3>
            <div className="preview-foto-vertical" style={{ borderRadius: "12px", border: "2px dashed #cbd5e0", background: "#fff" }}>
               {novoLote.foto_url ? <img src={novoLote.foto_url} alt="Lote" /> : <div className="sem-foto-v"><ImageIcon size={48} color="#cbd5e0" /><p>Nenhuma foto</p></div>}
            </div>
            <div className="modal-row-buttons" style={{ gap: "10px" }}>
              <label className="btn-captura-v camera" style={{ flex: 1, background: "var(--jardim-primaria)" }}>
                📸 CÂMERA
                <input type="file" accept="image/*" capture="environment" onChange={(e) => {/* sua logica de upload */}} style={{ display: "none" }} />
              </label>
              <label className="btn-captura-v galeria" style={{ flex: 1, background: "var(--jardim-acento)" }}>
                🖼️ GALERIA
                <input type="file" accept="image/*" onChange={(e) => {/* sua logica de upload */}} style={{ display: "none" }} />
              </label>
            </div>
            <div className="modal-row-buttons">
              <button onClick={fecharModais} className="btn-cancel">FECHAR</button>
              <button onClick={handleSalvarLote} className="btn-save" style={{ background: "var(--jardim-primaria)" }}>SALVAR</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DADOS (REESTILIZADO) */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ borderRadius: "16px" }}>
            <h3 style={{ fontWeight: "900", color: "var(--jardim-primaria)" }}>{modoEdicao ? "EDITAR LOTE" : "NOVO LOTE"}</h3>
            
            <div style={{ marginTop: "15px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>NÚMERO</label>
              <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }} type="text" value={novoLote.numero} onChange={e => setNovoLote({ ...novoLote, numero: e.target.value })} />
            </div>

            <div style={{ marginTop: "15px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>TIPO</label>
              <select style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }} value={novoLote.tipo_id} onChange={e => setNovoLote({ ...novoLote, tipo_id: e.target.value })}>
                <option value="">Selecione...</option>
                {tiposLote.map(t => <option key={t.id} value={t.id}>{t.descricao}</option>)}
              </select>
            </div>

            <div style={{ marginTop: "15px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>CAPACIDADE (GAVETAS)</label>
              <input style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }} type="number" value={novoLote.capacidade} onChange={e => setNovoLote({ ...novoLote, capacidade: e.target.value })} />
            </div>

            <div className="modal-row-buttons" style={{ marginTop: "20px" }}>
              <button onClick={fecharModais} className="btn-cancel">CANCELAR</button>
              <button onClick={handleSalvarLote} className="btn-save" style={{ background: "var(--jardim-primaria)" }}>CONFIRMAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}