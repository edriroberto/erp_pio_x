import { BrowserRouter, Routes, Route } from "react-router-dom"

import Sidebar from "./components/Sidebar"
import Header from "./components/Header"

import Dashboard from "./pages/Dashboard"
import Sepultamentos from "./pages/Sepultamentos"
import SepultamentosMes from "./pages/SepultamentosMes"
import SepultamentosNome from "./pages/SepultamentosNome"
import SepultamentosPeriodo from "./pages/SepultamentosPeriodo"
import Coveiros from "./pages/Coveiros"
import Quadras from "./pages/Quadras"
import Lotes from "./pages/Lotes"
import Funerarias from "./pages/Funerarias"


function App() {

  return (

    <BrowserRouter>
<div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/*<div style={{display:"flex"}}> */}

        <Sidebar />

<div style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column"
        }}>


          <Header />

<main style={{ 
            flex: 1, 
            padding: 20, 
            overflowY: "auto" // Só esta parte vai rolar se o conteúdo for grande
          }}>

            <Routes>

              <Route path="/" element={<Dashboard />} />

              <Route path="/sepultamentos" element={<Sepultamentos />} />
             
              <Route path="/sepultamentos-nome" element={<SepultamentosNome />} />
              
              <Route path="/sepultamentos-periodo" element={<SepultamentosPeriodo />} />                            

              <Route path="/coveiros" element={<Coveiros />} />

              <Route path="/funerarias" element={<Funerarias />} />

              <Route path="/quadras" element={<Quadras />} />

              <Route path="/lotes" element={<Lotes />} />

            </Routes>

          </main>

        </div>

      </div>

    </BrowserRouter>

  )
}

export default App