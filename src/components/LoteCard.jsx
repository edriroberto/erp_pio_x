// components/LoteCard.jsx
export default function LoteCard({ l }) {
  // Extraímos a descrição com segurança caso o join falhe
  const tipoDescricao = l.tipos_lote?.descricao || "Não definido";

  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      padding: 12,
      marginBottom: 8,
      boxShadow: "0 1px 3px rgba(0,0,0,.08)",
      borderLeft: "4px solid #95a5a6", // Uma cor neutra para diferenciar do QuadraCard
    }}>
      <div style={{ 
        fontWeight: 600, 
        color: "#2c3e50",
        fontSize: "15px" 
      }}>
        Lote {l.numero}
      </div>

      <div style={{
        fontSize: 13,
        color: "#666",
        marginTop: 4
      }}>
        <span style={{ fontWeight: 500 }}>Tipo:</span> {tipoDescricao}
      </div>
    </div>
  );
}