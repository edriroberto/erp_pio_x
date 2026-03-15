// components/QuadraCard.jsx
export default function QuadraCard({ q, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        cursor: "pointer",
        // Estilo condicional baseado na prop isSelected
        border: isSelected ? "2px solid #3498db" : "2px solid transparent",
        boxShadow: isSelected
          ? "0 4px 12px rgba(52,152,219,.25)"
          : "0 1px 4px rgba(0,0,0,.08)",
        transition: "all .2s"
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 16 }}>
        Quadra {q.nome}
      </div>
    </div>
  );
}