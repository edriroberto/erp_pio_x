import { useState, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";

export function useSepultamentos() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const carregar = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from("vw_sepultamentos_v1").select("*");

      if (filtros.nome) {
        query = query.ilike("nome", `%${filtros.nome}%`);
      }

      if (filtros.dataDe) {
        query = query.gte("data_sepultamento", filtros.dataDe);
      }
      if (filtros.dataAte) {
        query = query.lte("data_sepultamento", filtros.dataAte);
      }

      const { data, error: err } = await query.order("data_sepultamento", {
        ascending: false,
      });

      if (err) throw err;
      setDados(data || []);
    } catch (err) {
      console.error("Erro ao buscar sepultamentos:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const excluir = async (id) => {
    try {
      const { error: err } = await supabase
        .from("sepultamentos")
        .delete()
        .eq("id", id);

      if (err) throw err;
      setDados((prev) => prev.filter((item) => item.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    dados,
    loading,
    error,   // Importante retornar o erro para tratar na UI
    carregar, // Nome mais curto
    excluir,  // Nome mais curto
  };
}