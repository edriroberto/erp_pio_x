import { useState } from "react"

export default function SepultamentoSearchBar({ onBuscar }) {

  const [texto, setTexto] = useState("")

  function handleChange(e) {

    const valor = e.target.value.toUpperCase()

    setTexto(valor)

    if (onBuscar) {
      onBuscar(valor)
    }
  }

  function limpar() {
    setTexto("")
    if (onBuscar) onBuscar("")
  }

  return (

    <div style={{
      marginBottom: 7,
      marginTop: 5,
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 8,
      padding: "8px 12px",
      display: "flex",
      alignItems: "center",
      gap: 8
    }}>

      {/* LUPA */}
      <span style={{
        fontSize: 16,
        opacity: 0.6
      }}>
        🔍
      </span>

      {/* INPUT */}
      <input
        type="text"
        placeholder="BUSCAR NOME / QUADRA / LOTE / FUNERÁRIA"
        value={texto}
        onChange={handleChange}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          fontSize: 14,
          background: "transparent",
          textTransform: "uppercase",
          color: "#000", // 🔥 define a cor do texto
          
        }}
      />

      {/* BOTÃO LIMPAR */}
      {texto && (
        <button
          onClick={limpar}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 16,
            opacity: 0.6
          }}
        >
          ❌
        </button>
      )}

    </div>

  )
}