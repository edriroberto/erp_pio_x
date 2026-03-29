// No ContainerTabela.jsx
export default function ContainerTabela({ children }) {
  return (
    <div
      style={{
        width: "100%",
        flex: "1 1 0%",     // 🔥 Força o crescimento correto
        display: "flex",    // Adicionado
        flexDirection: "column", // Adicionado
        overflowY: "auto",  
        border: "1px solid #e2e8f0",
        borderRadius: "12px 12px 0 0", // Arredondado só em cima fica elegante no mobile
        background: "#fff",
        minHeight: 0,
        WebkitOverflowScrolling: "touch" // Scroll suave no iPhone
      }}
    >
      {children}
    </div>
  );
}