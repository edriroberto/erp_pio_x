export default function ContainerPagina({ titulo, children }) {

  return (

    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "100%",
        boxSizing: "border-box",
        marginTop: -15,
        
      }}
    >

      {titulo && (
        <h3 style={{ margin: 0 }}>
          {titulo}
        </h3>
        
      )}

      {children}

    </div>

  )

}