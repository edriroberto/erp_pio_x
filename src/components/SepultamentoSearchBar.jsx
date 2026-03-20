import { useState } from "react";
import { Search, X } from "lucide-react";

export default function SepultamentoSearchBar({ onBuscar }) {
  const [texto, setTexto] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  function handleChange(e) {
    const valor = e.target.value.toUpperCase();
    setTexto(valor);
    if (onBuscar) {
      onBuscar(valor);
    }
  }

  function limpar() {
    setTexto("");
    if (onBuscar) onBuscar("");
  }

  return (
    <div 
      style={{
        ...styles.container,
        borderColor: isFocused ? "#3b82f6" : "#e2e8f0", // Borda azul ao focar
        boxShadow: isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "none",
      }}
    >
      {/* LUPA (ÍCONE MODERNO) */}
      <Search 
        size={18} 
        style={{ 
          color: isFocused ? "#3b82f6" : "#94a3b8",
          transition: "color 0.2s" 
        }} 
      />

      {/* INPUT */}
      <input
        type="text"
        placeholder="BUSCAR NOME / QUADRA / LOTE / FUNERÁRIA"
        value={texto}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={styles.input}
      />

      {/* BOTÃO LIMPAR (ÍCONE MODERNO) */}
      {texto && (
        <button
          onClick={limpar}
          style={styles.btnClear}
          title="Limpar busca"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    marginBottom: "10px",
    marginTop: "5px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px", // Bordas um pouco mais arredondadas (Padrão 2026)
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.2s ease-in-out",
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "14px",
    fontWeight: "500", // Texto levemente mais encorpado
    background: "transparent",
    textTransform: "uppercase",
    color: "#1e293b", // Slate 800 para melhor leitura
    letterSpacing: "0.3px",
  },
  btnClear: {
    border: "none",
    background: "#f1f5f9", // Fundo cinza sutil no botão de fechar
    color: "#64748b",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "50%", // Botão circular
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  }
};