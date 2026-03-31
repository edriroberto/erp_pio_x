import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import {
  UserPlus,
  Loader2,
  ShieldOff,
  ShieldCheck,
  Users,
  AlertCircle
} from "lucide-react";
import ContainerPagina from "../components/ContainerPagina";
import { formatarNome, getIniciais } from "../utils/user";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLista, setLoadingLista] = useState(true);
  const [msg, setMsg] = useState({});

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
    nivel: "consulta"
  });

  // 🔹 Buscar usuários
  const buscarUsuarios = async () => {
    setLoadingLista(true);

    const { data, error } = await supabase
      .from("perfis")
      .select("*")
      .order("email");

    if (!error) setUsuarios(data);
    else console.error(error.message);

    setLoadingLista(false);
  };

  useEffect(() => {
    buscarUsuarios();
  }, []);

  // 🔹 Criar usuário
  const handleCadastro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({});

    const emailFinal = formData.email.includes("@")
      ? formData.email.trim().toLowerCase()
      : `${formData.email.trim().toLowerCase()}@sistema.com`;

    try {
      const { data, error } = await supabase.auth.signUp({
        email: emailFinal,
        password: formData.password
      });

      if (error) throw error;

      await supabase
        .from("perfis")
        .update({
          nome: formData.nome,
          email: emailFinal,
          nivel: formData.nivel,
          ativo: true
        })
        .eq("id", data.user.id);

      setMsg({ tipo: "ok", texto: "Usuário criado com sucesso" });

      setFormData({
        nome: "",
        email: "",
        password: "",
        nivel: "consulta"
      });

      buscarUsuarios();

    } catch (err) {
      setMsg({ tipo: "erro", texto: err.message });
    }

    setLoading(false);
  };

  // 🔹 Bloquear / desbloquear
  const toggleAtivo = async (user) => {
    if (user.nivel === "master") {
      alert("Não é permitido bloquear um usuário master");
      return;
    }

    const { error } = await supabase
      .from("perfis")
      .update({ ativo: !user.ativo })
      .eq("id", user.id);

    if (!error) {
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, ativo: !u.ativo } : u
        )
      );
    }
  };

  return (
    <ContainerPagina style={{ marginBottom: '30px' }}>
      {/* HEADER */}
      
      <div style={styles.header}>
        <Users size={24} />
        <h2>Gestão de Utilizadores</h2>
      </div>

      <div style={styles.grid}>

        {/* FORM */}
        <div style={styles.card}>
          <h3 style={styles.title}>
            <UserPlus size={16} /> Novo Utilizador
          </h3>

          <form onSubmit={handleCadastro} style={styles.form}>
            <input
              placeholder="Nome completo"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              style={styles.input}
              required
            />

            <input
              placeholder="Email ou nome"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              style={styles.input}
              required
            />

            <input
              type="password"
              placeholder="Senha"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              style={styles.input}
              required
            />

            <select
              value={formData.nivel}
              onChange={(e) =>
                setFormData({ ...formData, nivel: e.target.value })
              }
              style={styles.input}
            >
              <option value="consulta">Consulta</option>
              <option value="admin">Admin</option>
              <option value="master">Master</option>
            </select>

            <button disabled={loading} style={styles.btn}>
              {loading ? <Loader2 className="animate-spin" /> : "Criar"}
            </button>

            {msg.texto && (
              <div style={{
                ...styles.msg,
                color: msg.tipo === "erro" ? "#dc2626" : "#16a34a"
              }}>
                <AlertCircle size={14} />
                {msg.texto}
              </div>
            )}
          </form>
        </div>

        {/* LISTA */}
        <div style={styles.card}>
          <h3 style={styles.title}>Utilizadores</h3>

          {loadingLista ? (
            <Loader2 className="animate-spin" />
          ) : (
            <div style={styles.listaContainer}>
              {usuarios.map((u) => {
                const nome = formatarNome(u.nome, u.email);
                const iniciais = getIniciais(u.nome, u.email);

                return (
                  <div key={u.id} style={styles.userRow} className="user-row">

                    <div style={styles.userInfo}>
                      <div style={styles.avatar}>{iniciais}</div>

                      <div>
                        <div style={styles.nome}>{nome}</div>
                        <div style={styles.email}>{u.email}</div>
                      </div>
                    </div>

                    <div style={styles.actions} className="actions">
                      <span style={{
                        ...styles.badge,
                        background: u.ativo ? "#ecfdf5" : "#fef2f2",
                        color: u.ativo ? "#065f46" : "#991b1b"
                      }}>
                        {u.ativo ? "Ativo" : "Bloqueado"}
                      </span>

                      <span style={styles.level}>{u.nivel}</span>

                      <button
                        onClick={() => toggleAtivo(u)}
                        style={styles.toggle}
                      >
                        {u.ativo ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </ContainerPagina>
  );
}

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    color: "#065f46"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px"
  },

  card: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
  },

  title: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "15px",
    color: "#065f46"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    outline: "none"
  },

  btn: {
    background: "#065f46",
    color: "#fff",
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "0.2s"
  },

  msg: {
    display: "flex",
    gap: "6px",
    fontSize: "13px"
  },

  listaContainer: {
    maxHeight: "52vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    paddingRight: "6px",
    marginBottom: "20px"
  },

  userRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    borderRadius: "10px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    transition: "all 0.2s ease"
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },

  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "#065f46",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "600"
  },

  nome: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827"
  },

  email: {
    fontSize: "12px",
    color: "#6b7280"
  },

  actions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    opacity: 0.6,
    transition: "opacity 0.2s"
  },

  badge: {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "600"
  },

  level: {
    fontSize: "11px",
    color: "#6b7280",
    textTransform: "uppercase"
  },

  toggle: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    padding: "6px",
    cursor: "pointer",
    transition: "0.2s"
  }
};