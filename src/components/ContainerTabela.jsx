import React from 'react';

export default function ContainerTabela({ children }) {
  return (
    <div style={{
     height: "calc(100vh - 200px)", 
      //height: "600px)", // Calcula: Tela total menos espaço do Header/Filtros
      overflow: "auto",
      border: "1px solid #ccc",
      borderRadius: "4px",
      marginTop: "10px",
      background: "#fff"
    }}>
      {children}
    </div>
  )
}
