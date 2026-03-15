const SepultamentoCard = ({ dado, selecionado, onClick }) => {

  const estiloCard = {
    background: "#fff",
    borderRadius: "16px",
    padding: "14px",
    marginBottom: "12px",
    cursor: "pointer",

    boxShadow: selecionado
      ? "0 4px 14px rgba(52,152,219,0.25)"
      : "0 1px 4px rgba(0,0,0,0.08)",

    border: selecionado
      ? "2px solid #3498db"
      : "2px solid transparent",

    transition: "all .2s"
  }

    const linha = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 14
    
  }


  const statusEntregue = dado.obito_entregue

  return (

    <div style={estiloCard} onClick={onClick}>

      {/* NOME */}

      <div style={{
        fontSize: 16,
        fontWeight: 600,
        marginBottom: -5,
        marginTop: -10
      }}>
        {dado.nome}
      </div>

      {/* NASCIMENTO / FALECIMENTO + IDADE */}

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 12,
        color: "#666",
        marginBottom: 0,
        marginTop: 5
      }}>

        <span>
          ✦ {dado.nascimento}
          {"  •  "}
          ✝ {dado.falecimento}
        </span>

        <span style={{
          fontSize: 11,
          padding: "3px 8px",
          borderRadius: 10,
          background: "#eef3ff",
          color: "#2b4c9b",
          fontWeight: 600
        }}>
          {dado.idade} anos
        </span>

      </div>

      {/* LOCAL */}
      <div style={{
        fontSize: 14,
        fontWeight: 600,
        marginBottom: 0
      }}>
        Local: {dado.quadra} • Lote {dado.lote}/{dado.gaveta}
      </div>

      
      {/* FUNERÁRIA + STATUS */}

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 13,
        marginBottom: 0
      }}>

        <span>Funerária {dado.funeraria}</span>

        {!statusEntregue && (
  <span style={{
    fontSize: 11,
    padding: "3px 8px",
    borderRadius: 10,
    background: "#fdecea",
    color: "#c0392b",
    fontWeight: 600
  }}>
    Pendente
  </span>
)}

      </div>

      {/* OBS */}

      {dado.observacoes && (

        <div style={{
          fontSize: 12,
          color: "#888",
          marginTop: 0,
          marginBottom: -5
        }}>
          {dado.observacoes}
        </div>

      )}

    </div>

  )

}

export default SepultamentoCard