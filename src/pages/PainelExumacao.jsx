import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../utils/supabaseClient";
import { useIsMobile } from "../Hooks/useMobile";

// Componentes
import ExumacaoCard from "../components/ExumacaoCard";
import ContainerPagina from "../components/ContainerPagina";
import ContainerTabela from "../components/ContainerTabela";

// Estilos
import "../styles/tabela.css";

export default function PainelExumacao() {
  const isMobile = useIsMobile();

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
  // 1. No estado inicial dos dadosExumacao, adicione a data padrão (hoje)
const [dadosExumacao, setDadosExumacao] = useState({
  destino: "Ossário Municipal",
  responsavel: "",
  obs_extras: "",
  data_procedimento: new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD para o input date
});

  // --- EFEITOS ---
  useEffect(() => { carregarQuadras(); }, []);
  useEffect(() => { carregarDados(); }, [filtroQuadra, filtroLote, apenasRotativos]);

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
    const { data } = await supabase.from("lotes").select("id, numero").eq("quadra_id", quadraId).order("numero");
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

      // Tratamento preventivo para evitar o ?-?
      const dadosTratados = (data || []).map(item => ({
        ...item,
        quadra_exibir: item.quadra || item.quadra_nome || "?",
        lote_exibir: item.lote || item.lote_nome || item.numero || "?"
      }));

      setLista(dadosTratados);
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

  // 2. Na função confirmarLiberacao, use a data escolhida no formulário
async function confirmarLiberacao() {
  if (!itemParaExumar || !dadosExumacao.responsavel) {
    return alert("Por favor, informe o responsável pela exumação.");
  }

  setLoading(true);
  try {
    // Usamos a data do input, mas garantimos que ela tenha o formato de timestamp do Supabase
    const dataEscolhida = new Date(dadosExumacao.data_procedimento).toISOString();
    const localString = `${itemParaExumar.quadra_exibir} - ${itemParaExumar.lote_exibir}`;

    // 1. ATUALIZAR O SEPULTAMENTO
    const { error: errSep } = await supabase
      .from("sepultamentos")
      .update({
        exumado: true,
        data_exumacao: dataEscolhida, // <--- Data Flexível aqui
        situacao: "EXUMADO",
        obs_exumacao: `Destino: ${dadosExumacao.destino} | Resp: ${dadosExumacao.responsavel}`,
        obs_extras_exumacao: dadosExumacao.obs_extras 
      })
      .eq("id", itemParaExumar.id);

    if (errSep) throw errSep;

    // 2. ATUALIZAR O LOTE
    const { error: errLote } = await supabase
      .from("lotes")
      .update({ status: "DISPONÍVEL" })
      .eq("id", itemParaExumar.lote_id);

    if (errLote) throw errLote;

    // 3. REGISTRAR LOG DE EXUMAÇÃO
    const { error: errLog } = await supabase.from("exumacoes").insert([
      {
        sepultamento_id: itemParaExumar.id,
        nome_falecido: itemParaExumar.nome,
        data_exumacao: dataEscolhida, // <--- Data Flexível aqui também
        destino: dadosExumacao.destino,
        responsavel: dadosExumacao.responsavel,
        quadra_lote: localString,
        obs_extras: dadosExumacao.obs_extras
      },
    ]);

    if (errLog) throw errLog;

    alert("Lote liberado e exumação registrada com sucesso!");
    setModalAberto(false);
    // Reseta o formulário mantendo a data de hoje para a próxima
    setDadosExumacao({ 
        destino: "Ossário Municipal", 
        responsavel: "", 
        obs_extras: "",
        data_procedimento: new Date().toISOString().split('T')[0]
    });
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
          <div style={{ ...styles.switchTrack, background: apenasRotativos ? "#2c3e50" : "#cbd5e0" }}>
            <div style={{ ...styles.switchThumb, left: apenasRotativos ? "18px" : "2px" }} />
          </div>
          <span style={styles.switchLabel}>Apenas Rotativos</span>
        </div>
      </div>

      {/* FILTROS */}
      <div style={styles.filtrosRow}>
        <select value={filtroQuadra} onChange={(e) => setFiltroQuadra(e.target.value)} style={styles.select}>
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
          <div style={styles.textoCentro}>Processando...</div>
        ) : lista.length === 0 ? (
          <div style={styles.textoCentro}>Nenhum registro pendente encontrado</div>
        ) : isMobile ? (
          <div style={styles.gridCards}>
            {lista.map(item => (
              <ExumacaoCard 
                key={item.id}
                dado={{...item, quadra: item.quadra_exibir, lote: item.lote_exibir}}
                formatarData={formatarData}
                onConfirmar={() => handleAbrirModal(item)}
              />
            ))}
          </div>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Status</th>
                <th>Nome do Falecido</th>
                <th>Localização</th>
                <th>Data Sepult.</th>
                <th style={{ textAlign: 'center' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span style={{
                      ...styles.statusBadge,
                      background: item.alerta_cor === "VERMELHO" ? "#fed7d7" : "#fef3c7",
                      color: item.alerta_cor === "VERMELHO" ? "#c53030" : "#975a16"
                    }}>
                      {item.alerta_cor === "VERMELHO" ? "PRONTO" : "AVISO"}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{item.nome}</td>
                  <td>{`${item.quadra_exibir} • ${item.lote_exibir} ${item.gaveta ? '• Pos. '+item.gaveta : ''}`}</td>
                  <td>{formatarData(item.data_sepultamento)}</td>
                  <td style={{ textAlign: 'center' }}>
                    {item.alerta_cor === "VERMELHO" ? (
                      <button onClick={() => handleAbrirModal(item)} style={styles.btnTabela}>
                        EXECUTAR
                      </button>
                    ) : (
                      <span style={{ color: "#cbd5e0", fontSize: "11px" }}>Aguardar</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </ContainerTabela>

      {/* MODAL */}
      {modalAberto && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h4 style={styles.modalTitulo}>Confirmar Exumação</h4>
            <p style={styles.modalSubtitulo}>
              Registrando a saída de: <strong>{itemParaExumar?.nome}</strong><br/>
              <small>Local: {itemParaExumar?.quadra_exibir} - {itemParaExumar?.lote_exibir}</small>
            </p>

            <div style={styles.formGroup}>
              
              <div style={styles.inputWrapper}>
                <label style={styles.label}>Data do Procedimento</label>
                <input 
                  type="date" 
                  style={styles.input}
                  value={dadosExumacao.data_procedimento}
                  onChange={(e) => setDadosExumacao({...dadosExumacao, data_procedimento: e.target.value})}
                />
              </div>

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
                  <option value="Outros">Outors...</option>
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
                  placeholder="Condições da urna, documentos, etc..."
                  value={dadosExumacao.obs_extras}
                  onChange={(e) => setDadosExumacao({...dadosExumacao, obs_extras: e.target.value})}
                />
              </div>
            </div>

            <div style={styles.modalAcoes}>
              <button onClick={() => setModalAberto(false)} style={{ ...styles.botao, background: "#edf2f7", color: "#4a5568" }}>
                Cancelar
              </button>
              <button onClick={confirmarLiberacao} style={{ ...styles.botao, background: "#38a169", color: "#fff", flex: 1 }}>
                Confirmar e Liberar Lote
              </button>
            </div>
          </div>
        </div>
      )}
    </ContainerPagina>
  );
}

const styles = {
  headerContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' },
  titulo: { color: "#2d3748", margin: 0 },
  switchContainer: { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" },
  switchTrack: { width: "34px", height: "18px", borderRadius: "15px", position: "relative", transition: '0.3s' },
  switchThumb: { width: "14px", height: "14px", background: "white", borderRadius: "50%", position: "absolute", top: "2px", transition: "0.3s" },
  switchLabel: { fontSize: "12px", fontWeight: "bold", color: "#4a5568" },
  filtrosRow: { padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', background: '#ffffff', display: 'flex', gap: "10px", marginBottom: "20px", marginTop: "-10px", flexWrap: 'wrap' },
  select: {
    flex: "1",
    minWidth: "150px", // Ajustado para caber melhor lado a lado no iPhone
    maxWidth: "300px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e0",
    fontSize: '14px',
    background: "#ffffff", // Força o fundo branco
    color: "#2d3748",      // Força o texto cinza escuro/preto
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    
    // Adicione estas 3 linhas para o iPhone:
    appearance: "none",      // Remove o estilo "glass" do iOS se quiser algo mais plano
    WebkitAppearance: "none",
    colorScheme: "light",    // Diz ao iOS que este elemento é sempre "claro"
  },
  
  gridCards: { display: "grid", gridTemplateColumns: "1fr", gap: "12px", padding: "4px" },
  statusBadge: { padding: "4px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "bold" },
  btnTabela: { background: "#1a202c", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "11px", fontWeight: "bold" },
  textoCentro: { textAlign: "center", padding: "40px", color: "#718096" },
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, padding: "20px" },
  modal: { background: "#fff", padding: "25px", borderRadius: "12px", width: "100%", maxWidth: "450px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" },
  modalTitulo: { marginTop: 0, color: "#2d3748" },
  modalSubtitulo: { fontSize: "14px", color: "#4a5568", marginBottom: "20px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "15px" },
  inputWrapper: { width: "100%" },
  label: { fontSize: "12px", fontWeight: "bold", color: "#718096", display: "block", marginBottom: "4px" },
  input: { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e0", fontSize: "14px", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e0", fontSize: "14px", boxSizing: "border-box", height: "80px", resize: "none" },
  modalAcoes: { display: "flex", gap: "10px", marginTop: "25px" },
  botao: { padding: "12px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }
};