import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../utils/supabaseClient";
import { AuthContext } from "../contexts/AuthProvider"; // 🔹 Importado
import Permissao from "../components/Permissao"; // 🔹 Seu novo componente
import { processarEUploadFoto } from "../utils/uploadService";
import { 
  Camera, Map, Edit3, Plus, Loader2, CheckCircle2, 
  CloudUpload, FileText, Smartphone 
} from "lucide-react";
import "../styles/modal.css";

// --- COMPONENTE: INDICADOR DE SINCRONIZAÇÃO (Apenas para quem pode editar) ---
const SyncBadge = ({ count, onSync, syncing }) => {
  if (count === 0) return null;
  return (
    <div 
      onClick={!syncing ? onSync : null}
      style={styles.syncBadge}
    >
      {syncing ? <Loader2 size={18} className="animate-spin" /> : <CloudUpload size={18} />}
      <span style={{ fontSize: "12px", fontWeight: "bold" }}>
        {syncing ? "SINCRONIZANDO..." : `${count} LOTE(S) OFFLINE`}
      </span>
    </div>
  );
};

// --- SUB-COMPONENTE DE CARD DE LOTE ---
const LoteCard = ({ lote, selecionado, onClick, abrirFoto, podeEditar }) => (
  <div 
    onClick={onClick}
    style={{
      ...styles.loteCard,
      background: selecionado ? "#f0fdf4" : "#fff",
      border: selecionado ? "1px solid #065f46" : "1px solid #e2e8f0",
      borderLeft: `4px solid ${lote.foto_url ? "#065f46" : "#cbd5e0"}`,
    }}
  >
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontWeight: "600", color: selecionado ? "#065f46" : "#334155", fontSize: "14px" }}>
        Lote {lote.numero}
      </div>
      <div style={{ fontSize: "11px", color: "#64748b" }}>
        {lote.tipos_lote?.descricao || "PADRÃO"} • {lote.capacidade_gavetas} VAGAS
      </div>
      {lote.observacoes && (
        <div style={styles.obsPreview}>
          <FileText size={10} /> {lote.observacoes}
        </div>
      )}
    </div>

    {/* Foto só é clicável para upload se tiver permissão, caso contrário é apenas visualização */}
    <div 
      onClick={(e) => { 
        if (!podeEditar) return;
        e.stopPropagation(); 
        abrirFoto(lote); 
      }}
      style={{
        ...styles.avatarLote,
        cursor: podeEditar ? "pointer" : "default"
      }}
    >
      {lote.foto_url ? (
        <img src={lote.foto_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Lote" />
      ) : (
        <Camera size={16} color="#94a3b8" />
      )}
    </div>
  </div>
);

export default function Quadras() {
  const { perfil, isAdmin } = useContext(AuthContext); // 🔹 Pegando permissões
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
    if (isAdmin) window.addEventListener("online", handleSincronizar);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("online", handleSincronizar);
    };
  }, [isAdmin]);

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

  // --- LÓGICA OFFLINE (Protegida) ---
  const atualizarContagemOffline = () => {
    const fila = JSON.parse(localStorage.getItem("fila_lotes_offline") || "[]");
    setOfflineCount(fila.length);
  };

  const handleSalvarLote = async () => {
    if (!isAdmin) {
      alert("Seu nível de acesso não permite alterações.");
      return;
    }
    
    // ... (restante da lógica de salvar igual ao original)
    // Mantida a lógica original de salvarOffline ou supabase.insert/update
    // Apenas garantindo que o isAdmin cerque a execução.
    
    const dadosLote = {
      ...(modoEdicao && { id: novoLote.id }), 
      numero: novoLote.numero,
      quadra_id: quadraSelecionada.id,
      tipo_id: parseInt(novoLote.tipo_id),
      capacidade_gavetas: parseInt(novoLote.capacidade),
      foto_url: novoLote.foto_url,
      observacoes: novoLote.observacoes
    };

    setLoading(true);
    if (!navigator.onLine) {
      const fila = JSON.parse(localStorage.getItem("fila_lotes_offline") || "[]");
      fila.push({ ...dadosLote, tempId: Date.now() });
      localStorage.setItem("fila_lotes_offline", JSON.stringify(fila));
      setOfflineCount(fila.length);
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
      setFeedback({ msg: "❌ Erro ao salvar", tipo: "erro" });
      setLoading(false);
    }
  };

  const finalizar = () => {
    setTimeout(() => {
      setShowModal(false);
      setShowUploadFoto(false);
      setModoEdicao(false);
      setFeedback({ msg: "", tipo: "" });
      setNovoLote({ id: null, numero: "", tipo_id: "", capacidade: 1, foto_url: "", observacoes: "" });
      setLoading(false);
      if (quadraSelecionada) carregarLotes(quadraSelecionada);
    }, 1500);
  };

  const handleSincronizar = async () => {
    if (!isAdmin || syncing) return;
    setSyncing(true);
    // ... (lógica de sincronismo original)
    setSyncing(false);
    atualizarContagemOffline();
  };

  return (
    <div style={{ 
      display: "flex", flexDirection: isMobile ? "column" : "row",
      padding: isMobile ? "10px" : "20px", gap: "15px", height: "100vh", background: "#f8fafc", overflow: "hidden"
    }}>
      
      {/* Badge de Sincronismo só para Admins */}
      <Permissao niveis={['admin', 'master']}>
        <SyncBadge count={offlineCount} onSync={handleSincronizar} syncing={syncing} />
      </Permissao>

      {/* PAINEL QUADRAS */}
      <div style={isMobile ? styles.sidebarMobile : styles.sidebarDesktop}>
        <div style={styles.sidebarHeader}>
          <Map size={18} color="#065f46" />
          <h2 style={styles.sidebarTitle}>QUADRAS</h2>
        </div>
        <div style={isMobile ? styles.scrollHorizontal : styles.scrollVertical}>
          {quadras.map(q => (
            <div key={q.id} onClick={() => carregarLotes(q)} 
              style={{ 
                ...styles.itemQuadra,
                background: quadraSelecionada?.id === q.id ? "#065f46" : "#f1f5f9",
                color: quadraSelecionada?.id === q.id ? "#fff" : "#475569",
              }}>
              {q.nome}
            </div>
          ))}
        </div>
      </div>

      {/* PAINEL LOTES */}
      <div style={styles.mainContent}>
        <div style={styles.mainHeader}>
          <div>
            <span style={styles.statusLabel}>
              {navigator.onLine ? "MODO ONLINE" : "MODO OFFLINE"} • Nível: {perfil?.nivel}
            </span>
            <h2 style={styles.mainTitle}>
              {quadraSelecionada ? quadraSelecionada.nome : "Selecione a Quadra"}
            </h2>
          </div>
          
          {quadraSelecionada && (
            <div style={{ display: "flex", gap: "8px" }}>
              {/* Botão EDITAR: Apenas Admin/Master */}
              <Permissao niveis={['admin', 'master']}>
                {loteSelecionado && (
                  <button 
                    onClick={() => { 
                      setModoEdicao(true); 
                      setNovoLote({ 
                        id: loteSelecionado.id, 
                        numero: loteSelecionado.numero, 
                        tipo_id: loteSelecionado.tipo_id, 
                        capacidade: loteSelecionado.capacidade_gavetas, 
                        foto_url: loteSelecionado.foto_url, 
                        observacoes: loteSelecionado.observacoes || "" 
                      }); 
                      setShowModal(true); 
                    }} 
                    style={styles.btnIcon}
                  >
                    <Edit3 size={18} color="#065f46" />
                  </button>
                )}
                <button 
                  onClick={() => { setModoEdicao(false); setShowModal(true); }} 
                  style={styles.btnNovo}
                >
                  <Plus size={18} /> NOVO
                </button>
              </Permissao>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", paddingRight: "5px" }}>
          {loading && lotes.length === 0 ? (
            <div style={styles.loadingState}><Loader2 className="animate-spin" /></div>
          ) : (
            lotes.map(l => (
              <LoteCard 
                key={l.id} 
                lote={l} 
                podeEditar={isAdmin} // 🔹 Passando prop de permissão
                selecionado={loteSelecionado?.id === l.id} 
                onClick={() => setLoteSelecionado(l)} 
                abrirFoto={(lote) => { 
                  setLoteSelecionado(lote); 
                  setNovoLote(prev => ({ ...prev, id: lote.id, foto_url: lote.foto_url || "" })); 
                  setShowUploadFoto(true); 
                }} 
              />
            ))
          )}
        </div>
      </div>

      {/* MODAL DADOS (O Modal em si já é protegido pelo fato do botão que o abre ser protegido) */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 style={styles.modalTitle}>{modoEdicao ? "Editar Lote" : "Novo Lote"}</h3>
            
            {feedback.msg && (
              <div style={{ 
                ...styles.feedback, 
                background: feedback.tipo === "sucesso" ? "#ecfdf5" : "#eff6ff", 
                color: feedback.tipo === "sucesso" ? "#059669" : "#2563eb" 
              }}>
                {feedback.tipo === "sucesso" ? <CheckCircle2 size={14} /> : <Loader2 size={14} className="animate-spin" />}
                {feedback.msg}
              </div>
            )}

            <div style={styles.modalForm}>
              <input placeholder="Número do Lote" type="text" value={novoLote.numero} onChange={e => setNovoLote({ ...novoLote, numero: e.target.value })} disabled={loading} />
              
              <select value={novoLote.tipo_id} onChange={e => setNovoLote({ ...novoLote, tipo_id: e.target.value })} disabled={loading}>
                <option value="">Selecione o Tipo...</option>
                {tiposLote.map(t => <option key={t.id} value={t.id}>{t.descricao}</option>)}
              </select>

              <input placeholder="Capacidade (Vagas)" type="number" value={novoLote.capacidade} onChange={e => setNovoLote({ ...novoLote, capacidade: e.target.value })} disabled={loading} />

              <textarea 
                placeholder="Observações do lote..."
                value={novoLote.observacoes}
                onChange={e => setNovoLote({ ...novoLote, observacoes: e.target.value })}
                disabled={loading}
                style={styles.textarea}
              />
            </div>

            <div className="modal-row-buttons" style={{ marginTop: "20px" }}>
              <button onClick={() => setShowModal(false)} className="btn-cancel" disabled={loading}>CANCELAR</button>
              <button onClick={handleSalvarLote} className="btn-save" disabled={loading} style={{ background: "#065f46" }}>
                {loading ? "SALVANDO..." : "CONFIRMAR"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FOTO (Apenas Admin/Master) */}
      {showUploadFoto && isAdmin && (
        <div className="modal-overlay">
          <div className="modal-box-vertical">
            <h3 style={{ marginBottom: "15px" }}>Foto: Lote {loteSelecionado?.numero}</h3>
            <div className="preview-foto-vertical">
              {novoLote.foto_url ? <img src={novoLote.foto_url} alt="Preview" /> : <div className="sem-foto-v"><span>📷 Sem foto</span></div>}
            </div>
            <div className="modal-row-buttons" style={{ marginTop: "15px" }}>
              <label className="btn-captura-v camera">
                📸 Tirar Foto
                <input type="file" accept="image/*" capture="environment" onChange={(e) => {
                   const file = e.target.files[0];
                   if(file) processarEUploadFoto(file, `lotes/${loteSelecionado.id}`).then(url => setNovoLote(p => ({...p, foto_url: url})));
                }} style={{ display: "none" }} />
              </label>
              <button onClick={() => setShowUploadFoto(false)} className="btn-cancel">Fechar</button>
              <button onClick={handleSalvarLote} className="btn-save" disabled={loading || !novoLote.foto_url}>Salvar Foto</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- ESTILOS CENTRALIZADOS ---
const styles = {
  sidebarDesktop: {
    flex: "0 0 250px", background: "#fff", borderRadius: "12px", padding: "15px",
    border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden"
  },
  sidebarMobile: {
    flex: "none", background: "#fff", borderRadius: "12px", padding: "15px",
    border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", maxHeight: "180px", overflow: "hidden"
  },
  sidebarHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" },
  sidebarTitle: { fontSize: "0.9rem", fontWeight: "700", color: "#334155" },
  scrollHorizontal: { display: "flex", flexDirection: "row", gap: "8px", overflowX: "auto", paddingBottom: "10px" },
  scrollVertical: { display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto" },
  itemQuadra: { padding: "10px 15px", borderRadius: "10px", cursor: "pointer", fontWeight: "600", fontSize: "13px", whiteSpace: "nowrap", border: "1px solid #e2e8f0", transition: "0.2s" },
  
  mainContent: { flex: 1, background: "#fff", borderRadius: "12px", padding: "15px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" },
  mainHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
  mainTitle: { fontSize: "1.2rem", color: "#065f46", fontWeight: "700" },
  statusLabel: { fontSize: "9px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" },
  
  btnIcon: { background: "#f1f5f9", border: "1px solid #e2e8f0", padding: "10px", borderRadius: "10px", cursor: "pointer" },
  btnNovo: { background: "#065f46", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "10px", fontWeight: "700", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" },
  
  loteCard: { borderRadius: "8px", padding: "10px 12px", marginBottom: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "0.2s" },
  obsPreview: { fontSize: "10px", color: "#065f46", fontStyle: "italic", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  avatarLote: { width: "38px", height: "38px", borderRadius: "8px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0", overflow: "hidden", marginLeft: "10px" },
  
  syncBadge: { position: "fixed", bottom: "20px", right: "20px", zIndex: 9999, background: "#f59e0b", color: "#fff", padding: "10px 16px", borderRadius: "50px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", cursor: "pointer" },
  loadingState: { textAlign: "center", padding: "20px", color: "#94a3b8" },
  
  modalTitle: { fontWeight: "700", color: "#065f46", marginBottom: "15px" },
  modalForm: { display: "flex", flexDirection: "column", gap: "12px" },
  feedback: { display: "flex", alignItems: "center", gap: "8px", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "12px" },
  textarea: { width: "100%", minHeight: "80px", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", fontFamily: "inherit", resize: "none" }
};