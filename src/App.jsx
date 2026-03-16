import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./utils/supabaseClient";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import LoginPage from "./pages/LoginPage";
import RecuperarSenha from "./pages/RecuperarSenha";
import Dashboard from "./pages/Dashboard";
import Sepultamentos from "./pages/Sepultamentos";
import SepultamentosNome from "./pages/SepultamentosNome";
import SepultamentosPeriodo from "./pages/SepultamentosPeriodo";
import Coveiros from "./pages/Coveiros";
import Quadras from "./pages/Quadras";
import Lotes from "./pages/Lotes";
import Funerarias from "./pages/Funerarias";
import CadastroSepultamento from "./pages/CadastroSepultamento";

// Rota protegida
function PrivateRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentSession = supabase.auth.getSession().then(res => {
      setSession(res.data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <div>Carregando...</div>;

  return session ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Header />
          <main
            style={{
              flex: 1,
              padding: 20,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#f4f7f6",
            }}
          >
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/recuperar-senha" element={<RecuperarSenha />} />

              <Route
                path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>}
              />
              
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/sepultamentos"
                element={
                  <PrivateRoute>
                    <Sepultamentos />
                  </PrivateRoute>
                }
              />
              <Route
                path="/sepultamentos-nome"
                element={
                  <PrivateRoute>
                    <SepultamentosNome />
                  </PrivateRoute>
                }
              />
              <Route
                path="/sepultamentos-periodo"
                element={
                  <PrivateRoute>
                    <SepultamentosPeriodo />
                  </PrivateRoute>
                }
              />
              <Route
                path="/coveiros"
                element={
                  <PrivateRoute>
                    <Coveiros />
                  </PrivateRoute>
                }
              />
              <Route
                path="/funerarias"
                element={
                  <PrivateRoute>
                    <Funerarias />
                  </PrivateRoute>
                }
              />
              <Route
                path="/quadras"
                element={
                  <PrivateRoute>
                    <Quadras />
                  </PrivateRoute>
                }
              />
              <Route
                path="/lotes"
                element={
                  <PrivateRoute>
                    <Lotes />
                  </PrivateRoute>
                }
              />
              <Route
                path="/cadastrar-sepultamento"
                element={
                  <PrivateRoute>
                    <CadastroSepultamento />
                  </PrivateRoute>
                }
              />
              <Route
                path="/cadastroSepultamento/:id"
                element={
                  <PrivateRoute>
                    <CadastroSepultamento />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}