export default function DashboardCard({ titulo, valor, cor }) {
  return (
    <div style={{
      background: "var(--jardim-pedra)", // Fundo Mármore/Creme suave
      borderRadius: "10px",
      padding: "8px 10px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.04)",
      border: "1px solid #e2e8f0",
      borderTop: `4px solid ${cor || "var(--jardim-primaria)"}`, // Borda mais grossa no topo para destaque
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      transition: "transform 0.2s ease"
    }}>

      <div style={{
        fontSize: "10px", // Um pouco menor para dar hierarquia
        color: "var(--jardim-texto)", // Cinza botânico
        textAlign: "center",
        fontWeight: "700",
        textTransform: "uppercase", // Estilo label que usamos nos cards
        letterSpacing: "0.5px",
        marginBottom: "2px",
        lineHeight: 1.2
      }}>
        {titulo}
      </div>

      <div style={{
        textAlign: "center",
        fontSize: "16px", // Aumentado para dar mais destaque ao número
        fontWeight: "800", // Mais negrito (estilo jardim)
        color: "var(--jardim-primaria)" // Verde Musgo por padrão
      }}>
        {valor}
      </div>

    </div>
  );
}