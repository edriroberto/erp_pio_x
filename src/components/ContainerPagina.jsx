import React, { useState, useEffect } from "react";

export default function ContainerPagina({ titulo, children }) {
const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  return (

    <div
      style={{
        //minHeight: "0", 
        minHeight: "100vh", 
        
        background: "#f2f2f7",    
        padding: isMobile ? "5px" : "15px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
       // width: "100%",
        boxSizing: "border-box",
       // margin: '-5px -1px -5px -18px',
        
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