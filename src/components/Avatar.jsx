import React, { useRef, useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

export default function Avatar({
  perfil,
  user,
  size = 40,
  editable = false,
  onUploadSuccess 
}) {
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [foto, setFoto] = useState(null);

  // Sincroniza a foto inicial
  useEffect(() => {
    if (perfil?.foto_url) {
      setFoto(perfil.foto_url);
    }
  }, [perfil?.foto_url]);

  const getIniciais = () => {
    if (perfil?.nome) {
      const partes = perfil.nome.trim().split(/\s+/);
      return (partes[0][0] + (partes[1]?.[0] || "")).toUpperCase();
    }
    // Fallback seguro caso user ainda não tenha carregado
    return user?.email?.substring(0, 2).toUpperCase() || "??";
  };

  const abrirUpload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Se clicar e o input existir, abre o explorer de arquivos
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async (e) => {
    // 1. IMPORTANTE: Não deixa o evento subir para o Header
    e.stopPropagation(); 
    
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const userId = user?.id || (await supabase.auth.getUser()).data.user?.id;
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("perfis")
        .update({ foto_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      // 2. Atualiza a foto localmente para o usuário ver na hora
      setFoto(publicUrl);

      // 3. Avisa o Header para atualizar o global e FECHAR o menu
      if (onUploadSuccess) {
        await onUploadSuccess(publicUrl);
      }

    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    } finally {
      setUploading(false);
      // Limpa o input para permitir subir a mesma foto se necessário
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div 
      // 🔥 O segredo está aqui: stopPropagation no container principal do Avatar
      onClick={(e) => {
        e.stopPropagation(); 
        if (editable && !uploading) abrirUpload(e);
      }}
      style={{ 
        position: "relative", 
        width: size, 
        height: size, 
        flexShrink: 0,
        cursor: editable ? "pointer" : "default"
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          overflow: "hidden",
          background: "#4f46e5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid #fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
      >
        {foto ? (
          <img
            src={foto}
            alt="Avatar"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: size * 0.4, color: '#fff' }}>
            {perfil?.nome?.charAt(0).toUpperCase() || "?"}
          </span>
        )}
      </div>

      {editable && !uploading && (
        <div style={{
          position: "absolute", bottom: 0, right: 0,
          width: "20px", height: "20px", borderRadius: "50%",
          background: "#22c55e", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", border: "1px solid #fff"
        }}>
          ✎
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        // 🔥 Impede que o clique no seletor de arquivos feche o menu antes da hora
        onClick={(e) => e.stopPropagation()} 
        style={{ display: "none" }}
      />
    </div>
  );
}