import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import ExumacaoCard from "../components/ExumacaoCard";
import ContainerPagina from "../components/ContainerPagina";
import ContainerTabela from "../components/ContainerTabela";

export default function PainelExumacao() {
  const [lista, setLista] = useState([]);
  const [quadras, setQuadras] = useState([]);
  const [lotes, setLotes] = useState([]); // Novo estado para os lotes
  const [loading, setLoading] = useState(true);

  // Estados dos Filtros
  const [filtroQuadra, setFiltroQuadra] = useState("");
  const [filtroLote, setFiltroLote] = useState(""); // Novo filtro de lote
  const [apenasRotativos, setApenasRotativos] = useState(false);

  // Carrega quadras ao iniciar
  useEffect(() => {
    carregarQuadras();
  }, []);

  // Carrega dados toda vez que um filtro mudar
  useEffect(() => {
    carregarDados();
  }, [filtroQuadra, filtroLote, apenasRotativos]);

  // Carrega lotes sempre que a quadra mudar
  useEffect(() => {
    if (filtroQuadra) {
      carregarLotes(filtroQuadra);
    } else {
      setLotes([]);
      setFiltroLote("");
    }
  }, [filtroQuadra]);

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
      let query = supabase
        .from("vw_gestao_exumacao")
        .select("*");

      // Aplicação dos filtros
      if (filtroQuadra) query = query.eq("quadra_id", filtroQuadra);
      if (filtroLote) query = query.eq("lote_id", filtroLote);
      if (apenasRotativos) query = query.ilike("tipo_lote", "%ROTATIVO%");

      // Ordenação: primeiro por data (urgência), depois por gaveta (organização do lote)
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

  const handleConfirmarExumacao = (registro) => {
    const confirmou = window.confirm(`Deseja confirmar a exumação de ${registro.nome}? O lote será liberado.`);
    if (confirmou) {
      alert("Lógica de liberação de lote (Update) será o próximo passo!");
    }
  };

  const formatarData = (data) => {
    if (!data) return "—";
    return new Date(data).toLocaleDateString("pt-BR");
  };

  return (
    <ContainerPagina>
      {/* CABEÇALHO E TOGGLE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ color: "#2d3748", margin: 0 }}>Gestão de Exumações</h3>
        
        <div 
          style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} 
          onClick={() => setApenasRotativos(!apenasRotativos)}
        >
          <div style={{
            width: "34px", height: "18px",
            background: apenasRotativos ? "#2c3e50" : "#cbd5e0",
            borderRadius: "15px", position: "relative", transition: '0.3s'
          }}>
            <div style={{
              width: "14px", height: "14px", background: "white", borderRadius: "50%",
              position: "absolute", top: "2px", left: apenasRotativos ? "18px" : "2px",
              transition: "0.3s"
            }} />
          </div>
          <span style={{ fontSize: "12px", fontWeight: "bold", color: "#4a5568" }}>Apenas Rotativos</span>
        </div>
      </div>

      {/* ÁREA DE FILTROS (SELECTS) */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px', 
        flexWrap: 'wrap' 
      }}>
        <select 
          value={filtroQuadra} 
          onChange={(e) => { setFiltroQuadra(e.target.value); setFiltroLote(""); }}
          style={estiloSelect}
        >
          <option value="">Todas as Quadras</option>
          {quadras.map(q => <option key={q.id} value={q.id}>{q.nome}</option>)}
        </select>

        <select 
          value={filtroLote} 
          onChange={(e) => setFiltroLote(e.target.value)}
          disabled={!filtroQuadra}
          style={{ ...estiloSelect, opacity: filtroQuadra ? 1 : 0.6 }}
        >
          <option value="">Todos os Lotes</option>
          {lotes.map(l => <option key={l.id} value={l.id}>{l.numero}</option>)}
        </select>
      </div>

      <ContainerTabela>
        {loading ? (
          <p style={{ textAlign: "center", padding: "20px", color: "#718096" }}>Carregando dados...</p>
        ) : (
          <div style={{ 
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "15px",
            padding: "5px"
          }}>
            {lista.length === 0 ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "#a0aec0" }}>
                Nenhum registro de exumação encontrado para os filtros aplicados.
              </div>
            ) : (
              lista.map(item => (
                <ExumacaoCard 
                  key={item.id} 
                  dado={item} 
                  formatarData={formatarData}
                  onConfirmar={handleConfirmarExumacao}
                />
              ))
            )}
          </div>
        )}
      </ContainerTabela>
    </ContainerPagina>
  );
}

// Estilo auxiliar para os selects
const estiloSelect = {
  flex: "1",
  minWidth: "200px",
  maxWidth: "300px",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #cbd5e0",
  fontSize: '14px',
  background: "#fff"
};