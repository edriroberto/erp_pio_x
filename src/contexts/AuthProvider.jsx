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
  const [loading, setLoading] = useState(true);

  const isMounted = useRef(true);
  const lastUserId = useRef(null); // 🔥 controle de loop
  const timeoutRef = useRef(null);

  // 🔹 Carrega perfil
  const carregarPerfil = useCallback(async (user) => {
    if (!user) {
      if (isMounted.current) {
        setPerfil(null);
        setLoading(false);
      }
      return;
    }

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("Auth: carregando perfil:", user.email);
      }

      const { data, error } = await supabase
        .from("perfis")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!isMounted.current) return;

      setPerfil(
        data || {
          id: user.id,
          email: user.email,
          nivel: "consulta"
        }
      );
    } catch (error) {
      console.error("Auth erro:", error.message);

      if (isMounted.current) {
        setPerfil({
          id: user.id,
          email: user.email,
          nivel: "visitante"
        });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;

    // 🔹 fallback anti-travamento (FORÇA logout se travar)
    timeoutRef.current = setTimeout(() => {
      if (loading) {
        console.warn("Sessão travou → forçando logout");

        supabase.auth.signOut();
        window.location.reload();
      }
    }, 7000);

    // 🔹 INIT
    const init = async () => {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession();

        const user = session?.user;

        if (user) {
          lastUserId.current = user.id;
          await carregarPerfil(user);
        } else {
          setPerfil(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Erro init:", error.message);
        setLoading(false);
      }
    };

    init();

    // 🔹 LISTENER BLINDADO
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted.current) return;

        const user = session?.user;

        if (process.env.NODE_ENV === "development") {
          console.log("Auth event:", event);
        }

        // 🔥 BLOQUEIA LOOP AO TROCAR ABA
        if (user?.id === lastUserId.current && event !== "SIGNED_OUT") {
          return;
        }

        lastUserId.current = user?.id || null;

        if (user) {
          setLoading(true);
          await carregarPerfil(user);
        } else {
          setPerfil(null);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted.current = false;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      listener?.subscription?.unsubscribe();
    };
  }, [carregarPerfil, loading]);

  // 🔹 Memo
  const value = useMemo(() => {
    return {
      perfil,
      loading,
      authenticated: !!perfil?.id,
      isAdmin: ["admin", "master"].includes(perfil?.nivel),
      isMaster: perfil?.nivel === "master"
    };
  }, [perfil, loading]);

  // 🔹 Loading global
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          height: "100dvh",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "14px",
          color: "#666"
        }}
      >
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