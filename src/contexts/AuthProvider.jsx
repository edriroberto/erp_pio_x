import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

// Exportamos o Contexto para o useAuth poder enxergá-lo
export const AuthContext = createContext({}); 

export const AuthProvider = ({ children }) => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  const carregarPerfil = async (user) => {
    if (!user) {
      setPerfil(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("perfis")
      .select("*")
      .eq("id", user.id)
      .single();
    setPerfil(data);
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      carregarPerfil(session?.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      carregarPerfil(session?.user);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ perfil, loading }}>
      {children}
    </AuthContext.Provider>
  );
};