import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef
} from "react";
import { supabase } from "../utils/supabaseClient";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [perfil, setPerfil] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isInitialLoad = useRef(true); // Controle para o primeiro carregamento

  // 🔥 BUSCA PERFIL (Melhorado com tratamento de erro)
  const carregarPerfil = useCallback(async (usuario) => {
    if (!usuario?.id) return null;
    try {
      const { data, error } = await supabase
        .from("perfis")
        .select("*")
        .eq("id", usuario.id)
        .maybeSingle();

      if (error) throw error;

      if (data && data.ativo === false) {
        await supabase.auth.signOut();
        return null;
      }

      return data || {
        id: usuario.id,
        email: usuario.email,
        nivel: "consulta"
      };
    } catch (err) {
      console.error("Erro ao carregar perfil:", err.message);
      return null;
    }
  }, []);

  // 🔥 REFRESH MANUAL
  const refreshPerfil = useCallback(async () => {
    if (!user) return;
    const perfilData = await carregarPerfil(user);
    setPerfil(perfilData);
  }, [user, carregarPerfil]);

  useEffect(() => {
    let mounted = true;

    const iniciarSessao = async () => {
      try {
        // 1. Tenta pegar a sessão atual imediatamente (importante para o F5)
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user || null;

        if (mounted) {
          setUser(currentUser);
          if (currentUser) {
            const perfilData = await carregarPerfil(currentUser);
            setPerfil(perfilData);
          }
        }
      } catch (error) {
        console.error("Falha na inicialização:", error);
      } finally {
        if (mounted) {
          setLoading(false);
          isInitialLoad.current = false;
        }
      }
    };

    iniciarSessao();

    // 🔥 LISTENER DE AUTH (Gerencia Login/Logout/Token Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Ignora o evento inicial se já carregamos via iniciarSessao para evitar flicker
      if (isInitialLoad.current) return;

      const currentUser = session?.user || null;
      setUser(currentUser);

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        const perfilData = await carregarPerfil(currentUser);
        setPerfil(perfilData);
      } else if (event === "SIGNED_OUT") {
        setPerfil(null);
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [carregarPerfil]);

  const value = useMemo(() => ({
    user,
    perfil,
    loading,
    refreshPerfil,
    authenticated: !!perfil?.id,
    isAdmin: ["admin", "master"].includes(perfil?.nivel),
    isMaster: perfil?.nivel === "master"
  }), [user, perfil, loading, refreshPerfil]);

  // Se estiver carregando, mostra o splash screen
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loaderBox}>
           <span>Carregando sessão...</span>
           {/* Fallback caso demore demais */}
           <button 
             onClick={() => window.location.reload()} 
             style={styles.retryBtn}>
             Recarregar se travar
           </button>
        </div>
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
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    background: "#f9fafb"
  },
  loaderBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    color: "#666",
    fontFamily: "sans-serif"
  },
  retryBtn: {
    marginTop: "10px",
    fontSize: "11px",
    background: "none",
    border: "1px solid #ddd",
    padding: "4px 8px",
    borderRadius: "4px",
    cursor: "pointer",
    color: "#999"
  }
};