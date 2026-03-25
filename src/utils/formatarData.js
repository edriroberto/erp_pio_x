// utils/formatarData.js

/**
 * Formata uma data ISO (YYYY-MM-DD) para o padrão brasileiro (DD/MM/YYYY)
 * Usamos split('-') para evitar problemas de fuso horário do objeto Date
 */
export function formatarData(dataISO) {
  if (!dataISO) return "";
  
  // Se a data vier no formato ISO do banco (2024-03-25...)
  const partes = dataISO.split('T')[0].split('-');
  if (partes.length !== 3) return dataISO;

  const [ano, mes, dia] = partes;
  return `${dia}/${mes}/${ano}`;
}

/**
 * Calcula a idade com base na data de nascimento e falecimento
 */
export function calcularIdade(dataNasc, dataFalec) {
  if (!dataNasc || !dataFalec) return "N/A";
  
  const nasc = new Date(dataNasc);
  const falec = new Date(dataFalec);
  
  let idade = falec.getFullYear() - nasc.getFullYear();
  const m = falec.getMonth() - nasc.getMonth();
  
  if (m < 0 || (m === 0 && falec.getDate() < nasc.getDate())) {
    idade--;
  }
  
  return idade >= 0 ? idade : 0;
}