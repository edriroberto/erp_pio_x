import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { UserPlus, Shield, Mail, Lock, Loader2 } from "lucide-react";
import ContainerPagina from "../components/ContainerPagina";

export default function Usuarios() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ tipo: "", texto: "" });
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nivel: "consulta" // Padrão inicial
  });

  const handleCadastro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ tipo: "", texto: "" });

    try {
      // 1. Criar o usuário no Auth do Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // 2. O Trigger que criamos no banco deve criar o perfil automaticamente,
      // mas vamos garantir a atualização do Nível de Acesso aqui.
      if (authData.user) {
        const { error: perfilError } = await supabase
          .from("perfis")
          .update({ nivel: formData.nivel })
          .eq("id", authData.user.id);

        if (perfilError) throw perfilError;
        
        setMsg({ tipo: "sucesso", texto: "Usuário cadastrado com sucesso! Ele precisa confirmar o e-mail." });
        setFormData({ email: "", password: "", nivel: "consulta" });
      }
    } catch (error) {
      setMsg({ tipo: "erro", texto: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContainerPagina>
      <div style={styles.header}>
        <UserPlus size={28} color="var(--jardim-primaria)" />
        <h2>Gestão de Acessos</h2>
      </div>

      <div style={styles.card}>
        <form onSubmit={handleCadastro} style={styles.form}>
          <div style={styles.inputGroup}>
            <label><Mail size={16} /> E-mail do Colaborador</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="exemplo@email.com"
            />
          </div>

          <div style={styles.inputGroup}>
            <label><Lock size={16} /> Senha Provisória</label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div style={styles.inputGroup}>
            <label><Shield size={16} /> Nível de Permissão</label>
            <select 
              value={formData.nivel}
              onChange={(e) => setFormData({...formData, nivel: e.target.value})}
            >
              <option value="consulta">Consulta (Apenas ver)</option>
              <option value="admin">Administrador (Cadastrar/Editar)</option>
              <option value="master">Master (Acesso Total + Relatórios)</option>
            </select>
          </div>

          {msg.texto && (
            <div style={{
              ...styles.alerta,
              backgroundColor: msg.tipo === "erro" ? "#fff5f5" : "#f0fff4",
              color: msg.tipo === "erro" ? "#c53030" : "#2f855a",
              border: `1px solid ${msg.tipo === "erro" ? "#feb2b2" : "#9ae6b4"}`
            }}>
              {msg.texto}
            </div>
          )}

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? <Loader2 className="animate-spin" /> : "Criar Novo Acesso"}
          </button>
        </form>
      </div>
    </ContainerPagina>
  );
}

const styles = {
  header: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "25px" },
  card: { background: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", maxWidth: "500px" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  alerta: { padding: "12px", borderRadius: "8px", fontSize: "14px", fontWeight: "600" },
  btn: {
    padding: "14px",
    background: "#4fd1c5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    transition: "background 0.2s"
  }
};
