import React, { useState, useEffect } from "react";

export default function ContainerPagina({ titulo, children }) {
const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  return (

    <div
      style={{

        
        //antes
        minHeight: "100vh",         
        background: "#f2f2f7",    
        padding: isMobile ? 4 : "15px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",       
        boxSizing: "border-box",
        margin: '0 -20px 0 -15px',
       
        //sem uso
        //minHeight: "0", 
        // width: "100%",

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