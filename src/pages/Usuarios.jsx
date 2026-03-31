import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { UserPlus, Shield, Mail, Lock, Loader2, Trash2, Users, AlertCircle } from "lucide-react";
import ContainerPagina from "../components/ContainerPagina";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLista, setLoadingLista] = useState(true);
  const [msg, setMsg] = useState({ tipo: "", texto: "" });
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nivel: "consulta"
  });

  // 1. BUSCAR TODOS OS USUÁRIOS NA TABELA 'PERFIS'
  const buscarUsuarios = async () => {
    setLoadingLista(true);
    try {
      const { data, error } = await supabase
        .from("perfis")
        .select("*")
        .order("email", { ascending: true });

      if (error) throw error;
      setUsuarios(data);
    } catch (error) {
      console.error("Erro ao carregar lista:", error.message);
    } finally {
      setLoadingLista(false);
    }
  };

  useEffect(() => {
    buscarUsuarios();
  }, []);

  // 2. CADASTRAR NOVO (COM TRATAMENTO DE USUÁRIO SIMPLES)
  const handleCadastro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ tipo: "", texto: "" });

    // Se o usuário digitar apenas "joao", vira "joao@sistema.com"
    const emailFinal = formData.email.includes("@") 
      ? formData.email.trim().toLowerCase() 
      : `${formData.email.trim().toLowerCase()}@sistema.com`;

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailFinal,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Atualiza o perfil (o trigger já criou, mas garantimos o nível aqui)
        const { error: perfilError } = await supabase
          .from("perfis")
          .update({ nivel: formData.nivel, email: emailFinal })
          .eq("id", authData.user.id);

        if (perfilError) throw perfilError;
        
        setMsg({ tipo: "sucesso", texto: `Acesso criado para: ${emailFinal}` });
        setFormData({ email: "", password: "", nivel: "consulta" });
        buscarUsuarios(); // Atualiza a tabela abaixo
      }
    } catch (error) {
      setMsg({ tipo: "erro", texto: error.message });
    } finally {
      setLoading(false);
    }
  };

  // 3. EXCLUIR/BLOQUEAR USUÁRIO
  const handleExcluir = async (id, email) => {
    if (window.confirm(`Tem certeza que deseja remover o acesso de ${email}?`)) {
      try {
        const { error } = await supabase.from("perfis").delete().eq("id", id);
        if (error) throw error;
        
        setUsuarios(usuarios.filter(u => u.id !== id));
        alert("Acesso removido com sucesso!");
      } catch (error) {
        alert("Erro ao excluir: " + error.message);
      }
    }
  };

  return (
    <ContainerPagina>
      <div style={styles.header}>
        <Users size={28} color="#4fd1c5" />
        <h2 style={{ margin: 0 }}>Gestão de Utilizadores e Acessos</h2>
      </div>

      <div style={styles.grid}>
        {/* LADO ESQUERDO: FORMULÁRIO */}
        <div style={styles.card}>
          <h3 style={styles.subtitulo}><UserPlus size={18} /> Novo Acesso</h3>
          <form onSubmit={handleCadastro} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nome de Utilizador ou E-mail</label>
              <input
                type="text"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Ex: joao ou joao@cemiterio.com"
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Senha Provisória</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nível de Permissão</label>
              <select 
                value={formData.nivel}
                onChange={(e) => setFormData({...formData, nivel: e.target.value})}
                style={styles.input}
              >
                <option value="consulta">Apenas Consulta</option>
                <option value="admin">Administrador</option>
                <option value="master">Master (Total)</option>
              </select>
            </div>
            <button type="submit" disabled={loading} style={styles.btn}>
              {loading ? <Loader2 className="animate-spin" /> : "Criar Utilizador"}
            </button>
            {msg.texto && (
              <div style={{...styles.alerta, color: msg.tipo === 'erro' ? '#c53030' : '#2f855a'}}>
                <AlertCircle size={14} /> {msg.texto}
              </div>
            )}
          </form>
        </div>

        {/* LADO DIREITO: LISTAGEM */}
        <div style={styles.card}>
          <h3 style={styles.subtitulo}>Utilizadores Ativos</h3>
          {loadingLista ? <div style={{textAlign:'center', padding: '20px'}}><Loader2 className="animate-spin" /></div> : (
            <div style={styles.tabelaContainer}>
              <table style={styles.tabela}>
                <thead>
                  <tr style={styles.trHead}>
                    <th style={styles.th}>Utilizador</th>
                    <th style={styles.th}>Nível</th>
                    <th style={styles.th}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id} style={styles.trBody}>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge, 
                          backgroundColor: u.nivel === 'master' ? '#fed7d7' : '#e6fffa',
                          color: u.nivel === 'master' ? '#c53030' : '#2c7a7b'
                        }}>
                          {u.nivel}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button onClick={() => handleExcluir(u.id, u.email)} style={styles.btnExcluir}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ContainerPagina>
  );
}

const styles = {
  header: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "25px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "25px" },
  card: { background: "#fff", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" },
  subtitulo: { margin: "0 0 20px 0", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #eee", paddingBottom: "10px" },
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#64748b" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px" },
  btn: { padding: "14px", background: "#4fd1c5", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  tabelaContainer: { overflowX: "auto" },
  tabela: { width: "100%", borderCollapse: "collapse" },
  trHead: { borderBottom: "2px solid #f1f5f9" },
  th: { textAlign: "left", padding: "12px", color: "#64748b", fontSize: "13px" },
  td: { padding: "12px", borderBottom: "1px solid #f1f5f9", fontSize: "14px", color: "#1e293b" },
  badge: { padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase" },
  btnExcluir: { background: "none", border: "none", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center" },
  alerta: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", marginTop: "10px", fontWeight: "500" }
};