// components/Permissao.jsx
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthProvider";

export default function Permissao({ niveis, children }) {
  const { perfil } = useContext(AuthContext);

  if (!niveis.includes(perfil?.nivel)) return null;

  return <>{children}</>;
}