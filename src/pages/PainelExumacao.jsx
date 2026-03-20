import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

// Componentes
import ExumacaoCard from "../components/ExumacaoCard";
import ContainerPagina from "../components/ContainerPagina";
import ContainerTabela from "../components/ContainerTabela";

export default function PainelExumacao() {
  // --- ESTADOS ---
  const [lista, setLista] = useState([]);
  const [quadras, setQuadras] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroQuadra, setFiltroQuadra] = useState("");
  const [filtroLote, setFiltroLote] = useState("");
  const [apenasRotativos, setApenasRotativos] = useState(false);

  // Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [itemParaExumar, setItemParaExumar] = useState(null);
  const [dadosExumacao, setDadosExumacao] = useState({
    destino: "Ossário Municipal",
    responsavel: "",
    obs_extras: ""
  });

  // --- EFEITOS ---
  useEffect(() => {
    carregarQuadras();
  }, []);

  useEffect(() => {
    carregarDados();
  }, [filtroQuadra, filtroLote, apenasRotativos]);

  useEffect(() => {
    if (filtroQuadra) {
      carregarLotes(filtroQuadra);
    } else {
      setLotes([]);
      setFiltroLote("");
    }
  }, [filtroQuadra]);

  // --- FUNÇÕES DE DADOS ---
  async function carregarQuadras() {
    const { data } = await supabase.from("quadras").select("id, nome").order("nome");
    if (data) setQuadras(data);
  }

  async function carregarLotes(quadraId) {
    const { data } = await supabase
      .from("lotes")
      .select("id, numero")
      .eq("quadra_id", quadraId)
      .order("numero");
    if (data) setLotes(data);
  }

  async function carregarDados() {
    setLoading(true);
    try {
      let query = supabase.from("vw_gestao_exumacao").select("*");

      if (filtroQuadra) query = query.eq("quadra_id", filtroQuadra);
      if (filtroLote) query = query.eq("lote_id", filtroLote);
      if (apenasRotativos) query = query.ilike("tipo_lote", "%ROTATIVO%");

      const { data, error } = await query
        .order("data_sepultamento", { ascending: true })
        .order("gaveta", { ascending: true });

      if (error) throw error;
      setLista(data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error.message);
    } finally {
      setLoading(false);
    }
  }

  // --- AÇÕES ---
  const handleAbrirModal = (registro) => {
    setItemParaExumar(registro);
    setModalAberto(true);
  };

  async function confirmarLiberacao() {
    if (!itemParaExumar || !dadosExumacao.responsavel) {
      return alert("Por favor, informe o responsável pela exumação.");
    }

    setLoading(true);
    try {
      const agora = new Date().toISOString();

      // 1. Montar string de local evitando 'undefined'
      const qNome = itemParaExumar.quadra_nome || itemParaExumar.quadra || "?";
      const lNum = itemParaExumar.lote_nome || itemParaExumar.lote || itemParaExumar.numero || "?";
      const localString = `${qNome} - ${lNum}`;

      // 2. ATUALIZAR O SEPULTAMENTO
      const { error: errSep } = await supabase
        .from("sepultamentos")
        .update({
          exumado: true,
          data_exumacao: agora,
          situacao: "EXUMADO",
          obs_exumacao: `Destino: ${dadosExumacao.destino} | Resp: ${dadosExumacao.responsavel}`,
          obs_extras_exumacao: dadosExumacao.obs_extras 
        })
        .eq("id", itemParaExumar.id);

      if (errSep) throw errSep;

      // 3. ATUALIZAR O LOTE
      const { error: errLote } = await supabase
        .from("lotes")
        .update({ status: "DISPONÍVEL" })
        .eq("id", itemParaExumar.lote_id);

      if (errLote) throw errLote;

      // 4. REGISTRAR LOG DE EXUMAÇÃO
      const { error: errLog } = await supabase.from("exumacoes").insert([
        {
          sepultamento_id: itemParaExumar.id,
          nome_falecido: itemParaExumar.nome,
          data_exumacao: agora,
          destino: dadosExumacao.destino,
          responsavel: dadosExumacao.responsavel,
          quadra_lote: localString,
          obs_extras: dadosExumacao.obs_extras
        },
      ]);

      if (errLog) throw errLog;

      alert("Lote liberado e exumação registrada com sucesso!");
      setModalAberto(false);
      setDadosExumacao({ destino: "Ossário Municipal", responsavel: "", obs_extras: "" });
      carregarDados();
    } catch (error) {
      alert("Erro ao processar liberação: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const formatarData = (data) => {
    if (!data) return "—";
    return new Date(data).toLocaleDateString("pt-BR");
  };

  return (
    <ContainerPagina>
      {/* HEADER */}
      <div style={styles.headerContainer}>
        <h3 style={styles.titulo}>Gestão de Exumações</h3>
        
        <div style={styles.switchContainer} onClick={() => setApenasRotativos(!apenasRotativos)}>
          <div style={{
            ...styles.switchTrack,
            background: apenasRotativos ? "#2c3e50" : "#cbd5e0",
          }}>
            <div style={{
              ...styles.switchThumb,
              left: apenasRotativos ? "18px" : "2px",
            }} />
          </div>
          <span style={styles.switchLabel}>Apenas Rotativos</span>
        </div>
      </div>

      {/* FILTROS */}
      <div style={styles.filtrosRow}>
        <select 
          value={filtroQuadra} 
          onChange={(e) => setFiltroQuadra(e.target.value)} 
          style={styles.select}
        >
          <option value="">Todas as Quadras</option>
          {quadras.map(q => <option key={q.id} value={q.id}>{q.nome}</option>)}
        </select>

        <select 
          value={filtroLote} 
          onChange={(e) => setFiltroLote(e.target.value)} 
          disabled={!filtroQuadra}
          style={{ ...styles.select, opacity: filtroQuadra ? 1 : 0.6 }}
        >
          <option value="">Todos os Lotes</option>
          {lotes.map(l => <option key={l.id} value={l.id}>{l.numero}</option>)}
        </select>
      </div>

      {/* CONTEÚDO */}
      <ContainerTabela>
        {loading ? (
          <p style={styles.textoCentro}>Processando...</p>
        ) : (
          <div style={styles.gridCards}>
            {lista.length === 0 ? (
              <div style={styles.emptyState}>Nenhum registro encontrado.</div>
            ) : (
              lista.map(item => (
                <ExumacaoCard 
                  key={item.id} 
                  dado={item} 
                  formatarData={formatarData}
                  onConfirmar={() => handleAbrirModal(item)}
                />
              ))
            )}
          </div>
        )}
      </ContainerTabela>

      {/* MODAL */}
      {modalAberto && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h4 style={styles.modalTitulo}>Confirmar Exumação</h4>
            <p style={styles.modalSubtitulo}>
              Registrando a saída de: <strong>{itemParaExumar?.nome}</strong>
            </p>

            <div style={styles.formGroup}>
              <div style={styles.inputWrapper}>
                <label style={styles.label}>Destino dos Restos Mortais</label>
                <select 
                  style={styles.input}
                  value={dadosExumacao.destino}
                  onChange={(e) => setDadosExumacao({...dadosExumacao, destino: e.target.value})}
                >
                  <option value="Ossário Municipal">Ossário Municipal</option>
                  <option value="Retirado pela Família">Retirado pela Família</option>
                  <option value="Transferência de Cemitério">Transferência de Cemitério</option>
                  <option value="Cremação">Cremação</option>
                </select>
              </div>

              <div style={styles.inputWrapper}>
                <label style={styles.label}>Responsável/Exumador</label>
                <input 
                  type="text" 
                  style={styles.input}
                  placeholder="Nome do funcionário ou familiar"
                  value={dadosExumacao.responsavel}
                  onChange={(e) => setDadosExumacao({...dadosExumacao, responsavel: e.target.value})}
                />
              </div>

              <div style={styles.inputWrapper}>
                <label style={styles.label}>Informações Extras / Observações</label>
                <textarea 
                  style={styles.textarea}
                  placeholder="Condições da urna, documentos, testemunhas..."
                  value={dadosExumacao.obs_extras}
                  onChange={(e) => setDadosExumacao({...dadosExumacao, obs_extras: e.target.value})}
                />
              </div>
            </div>

            <div style={styles.modalAcoes}>
              <button 
                onClick={() => setModalAberto(false)} 
                style={{ ...styles.botao, background: "#edf2f7", color: "#4a5568" }}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarLiberacao} 
                style={{ ...styles.botao, background: "#38a169", color: "#fff", flex: 1 }}
              >
                Confirmar e Liberar Lote
              </button>
            </div>
          </div>
        </div>
      )}
    </ContainerPagina>
  );
}

// --- ORGANIZAÇÃO DOS ESTILOS ---
const styles = {
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  titulo: {
    color: "#2d3748",
    margin: 0
  },
  switchContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer"
  },
  switchTrack: {
    width: "34px",
    height: "18px",
    borderRadius: "15px",
    position: "relative",
    transition: '0.3s'
  },
  switchThumb: {
    width: "14px",
    height: "14px",
    background: "white",
    borderRadius: "50%",
    position: "absolute",
    top: "2px",
    transition: "0.3s"
  },
  switchLabel: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#4a5568"
  },
  filtrosRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  select: {
    flex: "1",
    minWidth: "200px",
    maxWidth: "300px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e0",
    fontSize: '14px',
    background: "#fff"
  },
  gridCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "15px",
    padding: "5px"
  },
  textoCentro: {
    textAlign: "center",
    padding: "20px",
    color: "#718096"
  },
  emptyState: {
    gridColumn: "1/-1",
    textAlign: "center",
    padding: "40px",
    color: "#a0aec0"
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    padding: "20px"
  },
  modal: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "450px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
  },
  modalTitulo: {
    marginTop: 0,
    color: "#2d3748"
  },
  modalSubtitulo: {
    fontSize: "14px",
    color: "#4a5568",
    marginBottom: "20px"
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },
  inputWrapper: {
    width: "100%"
  },
  label: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#718096",
    display: "block",
    marginBottom: "4px"
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #cbd5e0",
    fontSize: "14px",
    boxSizing: "border-box"
  },
  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #cbd5e0",
    fontSize: "14px",
    boxSizing: "border-box",
    height: "80px",
    resize: "none",
    paddingTop: "8px"
  },
  modalAcoes: {
    display: "flex",
    gap: "10px",
    marginTop: "25px"
  },
  botao: {
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold"
  }
};