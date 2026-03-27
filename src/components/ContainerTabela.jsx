export default function ContainerTabela({ children }) {
  return (
    <div
      style={{
        width: "100%",
        flex: 1,                // 🔥 ocupa espaço restante
        overflow: "auto",       // 🔥 scroll automático
        border: "1px solid #ddd",
        borderRadius: "8px",
        background: "#fff",
        minHeight: 0,
        //maxHeight: '400px'            // 🔥 MUITO IMPORTANTE (corrige bug do flex)
      }}
    >
      {children}
    </div>
  );
}