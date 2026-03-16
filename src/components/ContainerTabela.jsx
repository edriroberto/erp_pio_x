export default function ContainerTabela({ children }) {

  return (

    <div
      style={{
        width: "100%",
        overflowX: "auto",
        overflowY: "auto",
        maxHeight: "400px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        background: "#fff",
        
        
      }}
    >

      {children}

    </div>

  )

}