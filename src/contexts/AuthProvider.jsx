import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo
} from "react";
import { supabase } from "../utils/supabaseClient";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [perfil, setPerfil] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isMounted = useRef(true);

  // 🔥 CARREGAR PERFIL (SEM depender de state)
  const carregarPerfil = useCallback(async (usuario) => {
    if (!usuario?.id) return;

    try {
      const { data, error } = await supabase
        .from("perfis")
        .select("*")
        .eq("id", usuario.id)
        .maybeSingle();

      if (error) throw error;

      // 🔒 usuário inativo
      if (data && data.ativo === false) {
        await supabase.auth.signOut();
        setPerfil(null);
        setUser(null);
        return;
      }

      setPerfil(
        data || {
          id: usuario.id,
          email: usuario.email,
          nivel: "consulta"
        }
      );
    } catch (error) {
      console.error("Erro ao carregar perfil:", error.message);
    }
  }, []);

  // 🔥 REFRESH SEGURO (usado pelo Avatar)
  const refreshPerfil = useCallback(async () => {
    const {
      data: { session }
    } = await supabase.auth.getSession();

    const currentUser = session?.user;

    if (currentUser) {
      setUser(currentUser);
      await carregarPerfil(currentUser);
    }
  }, [carregarPerfil]);

  useEffect(() => {
    isMounted.current = true;

    // 🔥 INICIALIZAÇÃO (resolve F5)
    const inicializar = async () => {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession();

        const currentUser = session?.user || null;

        setUser(currentUser);

        if (currentUser) {
          await carregarPerfil(currentUser);
        }
      } catch (e) {
        console.error("Erro inicialização:", e);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    inicializar();

    // 🔥 LISTENER GLOBAL DE AUTH
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;

      console.log("Auth event:", event);

      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "INITIAL_SESSION"
      ) {
        setUser(currentUser);

        if (currentUser) {
          await carregarPerfil(currentUser);
        }
      }

      if (event === "SIGNED_OUT") {
        setPerfil(null);
        setUser(null);
      }

      if (isMounted.current) setLoading(false);
    });

    return () => {
      isMounted.current = false;
      subscription?.unsubscribe();
    };
  }, [carregarPerfil]);

  // 🔥 MEMO (performance)
  const value = useMemo(
    () => ({
      user,
      perfil,
      loading,
      refreshPerfil,
      authenticated: !!perfil?.id,
      isAdmin: ["admin", "master"].includes(perfil?.nivel),
      isMaster: perfil?.nivel === "master"
    }),
    [perfil, loading, user, refreshPerfil]
  );

  // 🔥 LOADING GLOBAL
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        Carregando sessão...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const styles = {
  loadingContainer: {
    display: "flex",
    height: "100dvh",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "14px",
    color: "#666",
    fontFamily: "sans-serif"
  }
};