import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

export default function SepultamentoSearchBar({ onBuscar }) {
  const [texto, setTexto] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // 🔹 debounce (evita flood no banco)
  useEffect(() => {
    const delay = setTimeout(() => {
      onBuscar?.(texto);
    }, 300);

    return () => clearTimeout(delay);
  }, [texto, onBuscar]);

  function handleChange(e) {
    setTexto(e.target.value.toUpperCase());
  }

  function limpar() {
    setTexto("");
    onBuscar?.("");
  }

  return (
    <div
      style={{
        ...styles.container,
        borderColor: isFocused ? "#2563eb" : "#e5e7eb",
        boxShadow: isFocused
          ? "0 0 0 3px rgba(37, 99, 235, 0.15)"
          : "none",
      }}
    >
      <Search
        size={18}
        style={{
          color: isFocused ? "#2563eb" : "#9ca3af",
        }}
      />

      <input
        type="text"
        placeholder="Buscar por nome, quadra, lote ou funerária..."
        value={texto}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={styles.input}
      />

      {texto && (
        <button onClick={limpar} style={styles.clearBtn}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    height: "48px",
    width: "100%",
    maxWidth: "520px",

    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",

    padding: "0 12px",
    boxSizing: "border-box", // 🔥 ESSENCIAL

    display: "flex",
    alignItems: "center",
    gap: "12px",

    transition: "all 0.2s ease",

    margin: "12px auto", // 🔥 centraliza sem quebrar mobile
  },


  input: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "14px",
    background: "transparent",
    color: "#111827",
  },

  clearBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};