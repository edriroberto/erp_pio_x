import imageCompression from 'browser-image-compression';
import { supabase } from './supabaseClient';

/**
 * Remove um arquivo do bucket do Supabase
 * @param {string} urlCompleta - A URL pública da imagem armazenada
 * @param {string} bucket - Nome do bucket (ex: 'lotes')
 */
export async function deletarArquivoStorage(urlCompleta, bucket) {
  if (!urlCompleta) return;

  try {
    // Extrai o caminho relativo do arquivo a partir da URL pública
    // Exemplo: de '.../storage/v1/object/public/lotes/Quadra%20A/foto.jpg' 
    // para 'Quadra A/foto.jpg'
    const partes = urlCompleta.split(`${bucket}/`);
    if (partes.length < 2) return;
    
    const filePath = decodeURIComponent(partes[1]);

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw error;
    console.log("Arquivo antigo removido com sucesso");
  } catch (error) {
    console.error("Erro ao deletar arquivo antigo:", error);
    // Não travamos o fluxo principal se a deleção falhar (opcional)
  }
}
/**
 * Comprime a imagem e faz o upload para o Supabase Storage
 */
export async function processarEUploadFoto(file, bucket, pasta, prefixoNome = 'lote') {
  if (!file) return null;

  const options = {
    maxSizeMB: 0.8,          // Reduz para menos de 1MB para economizar 4G
    maxWidthOrHeight: 1280,   // Resolução ideal para visualização mobile/desktop
    useWebWorker: true,
    initialQuality: 0.7
  };

  try {
    // 1. Compressão local no dispositivo
    const compressedFile = await imageCompression(file, options);
    
    // 2. Gerar nome único para evitar sobrescrita
    const fileName = `${Date.now()}_${prefixoNome}.jpg`;
    const filePath = `${pasta}/${fileName}`;

    // 3. Upload para o Supabase
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, compressedFile);

    if (error) throw error;

    // 4. Retornar a URL pública
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;

  } catch (error) {
    console.error("Erro no Upload Service:", error);
    throw error;
  }
}