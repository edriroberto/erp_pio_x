// src/Hooks/useAuth.js
import { useContext } from "react";
// Importamos o contexto que criamos no arquivo AuthContext.jsx
import { AuthContext } from "../contexts/AuthProvider"; 

/**
 * Hook personalizado para acessar as permissões de forma instantânea.
 * Em vez de fazer uma requisição ao Supabase, ele lê os dados 
 * que já estão guardados na memória (RAM) pelo AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  // Verificação de segurança para garantir que o Provider está no main.jsx
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider. Verifique seu main.jsx.");
  }

  // Retorna { perfil, loading } vindo direto do estado global
  return context;
}