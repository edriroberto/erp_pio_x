import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

export function useExumacao() {
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

  useEffect(() => { carregarQuadras(); }, []);
  useEffect(() => { carregarDados(); }, [filtroQuadra, filtroLote, apenasRotativos]);
  useEffect(() => {
    if (filtroQuadra) carregarLotes(filtroQuadra);
    else { setLotes([]); setFiltroLote(""); }
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
      console.error("Erro:", error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleAbrirModal = (registro) => {
    setItemParaExumar(registro);
    setModalAberto(true);
  };

  async function confirmarLiberacao() {
    if (!itemParaExumar || !dadosExumacao.responsavel) {
      alert("Por favor, informe o responsável pela exumação.");
      return;
    }

    setLoading(true);
    try {
      const agora = new Date().toISOString();
      const localString = `${itemParaExumar.quadra_nome || "?"} - ${itemParaExumar.lote_nome || "?"}`;

      // 1. Atualizar Sepultamento
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

      // 2. Liberar Lote
      await supabase.from("lotes").update({ status: "DISPONÍVEL" }).eq("id", itemParaExumar.lote_id);

      // 3. Log
      await supabase.from("exumacoes").insert([{
        sepultamento_id: itemParaExumar.id,
        nome_falecido: itemParaExumar.nome,
        data_exumacao: agora,
        destino: dadosExumacao.destino,
        responsavel: dadosExumacao.responsavel,
        quadra_lote: localString,
        obs_extras: dadosExumacao.obs_extras
      }]);

      alert("Lote liberado com sucesso!");
      setModalAberto(false);
      setDadosExumacao({ destino: "Ossário Municipal", responsavel: "", obs_extras: "" });
      carregarDados();
    } catch (error) {
      alert("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    lista, quadras, lotes, loading,
    filtroQuadra, setFiltroQuadra,
    filtroLote, setFiltroLote,
    apenasRotativos, setApenasRotativos,
    modalAberto, setModalAberto,
    itemParaExumar, dadosExumacao, setDadosExumacao,
    handleAbrirModal, confirmarLiberacao
  };
}