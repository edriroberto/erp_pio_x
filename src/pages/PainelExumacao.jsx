import React, { useState, useMemo } from "react"; 
import { useExumacao } from "../Hooks/useExumacao";
import { useIsMobile } from "../Hooks/useMobile"; 
import { formatarData } from "../utils/formatarData"; // Importação adicionada

// Componentes
import ExumacaoCard from "../components/ExumacaoCard";
import ContainerPagina from "../components/ContainerPagina";
import ContainerTabela from "../components/ContainerTabela";

// Estilos
import "../styles/tabela.css"; 

export default function PainelExumacao() {
  const isMobile = useIsMobile(); 

  const {
    lista = [], 
    quadras, lotes, loading,
    filtroQuadra, setFiltroQuadra,
    filtroLote, setFiltroLote,
    apenasRotativos, setApenasRotativos,
    modalAberto, setModalAberto,
    itemParaExumar, dadosExumacao, setDadosExumacao,
    handleAbrirModal, confirmarLiberacao
  } = useExumacao();

  // Filtro de Dados Refatorado
  const dadosFiltrados = useMemo(() => {
    if (!lista || !Array.isArray(lista)) return [];

    return lista.filter(item => {
      const matchQuadra = filtroQuadra ? String(item.quadra_id) === String(filtroQuadra) : true;
      const matchLote = filtroLote ? String(item.lote_id) === String(filtroLote) : true;
      
      const tipoAjustado = item.tipo_lote?.toUpperCase();
      const matchRotativo = apenasRotativos ? tipoAjustado === "ROTATIVO" : true;

      return matchQuadra && matchLote && matchRotativo;
    });
  }, [lista, filtroQuadra, filtroLote, apenasRotativos]);

  // REMOVIDA a função local formatarData antiga
  // Agora usamos diretamente a importada do utils

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

      {/* CONTEÚDO DINÂMICO */}
      <ContainerTabela>
        {loading ? (
          <div style={styles.textoCentro}>Carregando dados...</div>
        ) : (dadosFiltrados && dadosFiltrados.length === 0) ? (
          <div style={styles.textoCentro}>Nenhum registro pendente encontrado</div>
        ) : isMobile ? (
          <div style={{ ...styles.gridCards, gridTemplateColumns: "1fr" }}>
            {dadosFiltrados.map(item => (
              <ExumacaoCard 
                key={item.id}
                dado={item}
                formatarData={formatarData} // Passando a função importada
                onConfirmar={handleAbrirModal}
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
              {dadosFiltrados.map((item) => (
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
                  <td>{`${item.quadra} • ${item.lote} ${item.gaveta ? '• Pos. '+item.gaveta : ''}`}</td>
                  {/* USO DA FUNÇÃO IMPORTADA AQUI */}
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

      {/* MODAL MANTIDO IGUAL */}
      {/* ... código do modal ... */}
    </ContainerPagina>
  );
}

// Estilos limpos para o Badge
const styles = {
  // ... outros estilos ...
  statusBadge: {
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "10px",
    fontWeight: "bold"
  },
  // (Mantive os demais estilos do seu objeto original)
  headerContainer: { 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' 
  },
  titulo: { 
    color: "#2d3748", margin: 0 
  },
  switchContainer: { 
    display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" 
  },
  switchTrack: { 
    width: "34px", height: "18px", borderRadius: "15px", position: "relative", transition: '0.3s' 
  },
  switchThumb: { 
    width: "14px", height: "14px", background: "white", borderRadius: "50%", position: "absolute", top: "2px", transition: "0.3s" 
  },
  switchLabel: { 
    fontSize: "12px", fontWeight: "bold", color: "#4a5568" 
  },
  filtrosRow: {
     padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', background: '#ffffff', display: 'flex', gap: "10px", marginBottom: "15px", marginTop: "-10px", flexWrap: 'wrap' 
    },
  select: { 
    flex: "1", minWidth: "150px", maxWidth: "300px", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e0", fontSize: '14px', background: "#fff" 
  },
  gridCards: { 
    display: "grid", gap: "12px", padding: "4px" 
  },
  btnTabela: { 
    background: "#1a202c", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "11px", fontWeight: "bold" 
  },
  textoCentro: { 
    textAlign: "center", padding: "20px", color: "#718096" 
  },
  overlay: { 
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 
  },
  modal: { 
    background: "#fff", padding: "25px", borderRadius: "12px", width: "90%", maxWidth: "450px" 
  },
  modalTitulo: { 
    marginTop: 0, color: "#2d3748" 
  },
  modalSubtitulo: { 
    fontSize: "14px", color: "#4a5568", marginBottom: "20px" 
  },
  formGroup: { 
    display: "flex", flexDirection: "column", gap: "15px" 
  },
  inputWrapper: { 
    width: "100%" 
  },
  label: { 
    fontSize: "12px", fontWeight: "bold", color: "#718096", display: "block", marginBottom: "4px" 
  },
  input: { 
    width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e0" 
  },
  modalAcoes: { 
    display: "flex", gap: "10px", marginTop: "25px" 
  },
  botaoPrimario: { 
    padding: "12px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", background: "#38a169", color: "#fff", flex: 1 
  },
  botaoSecundario: { 
    padding: "12px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", background: "#edf2f7", color: "#4a5568"
   }
};