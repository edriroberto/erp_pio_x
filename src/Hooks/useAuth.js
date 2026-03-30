// Crie o arquivo src/Hooks/useAuth.js
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

export function useAuth() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarPerfil() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("perfis")
          .select("nivel")
          .eq("id", user.id)
          .single();
        setPerfil(data);
      }
      setLoading(false);
    }
    carregarPerfil();
  }, []);

  return { perfil, loading };
}