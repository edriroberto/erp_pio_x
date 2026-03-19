import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const gerarRelatorioSepultamentos = (dados, dataInicio, dataFim) => {
  const doc = jsPDF({ orientation: "portrait" });

  const titulo = "Relatório de Sepultamentos por Período";
  const subtitulo = `Período: ${dataInicio} até ${dataFim}`;

  // Cabeçalho do PDF
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(titulo, 14, 15);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(subtitulo, 14, 22);

  // Mapeamento dos dados
  const tableRows = dados.map((s) => {
    // Se obito_entregue for false, adiciona o asterisco
    const nomeFormatado = s.obito_entregue === false ? `* ${s.nome}` : s.nome;

    return [
      nomeFormatado,
      s.quadra,
      s.lote,
      s.gaveta,
      s.data_nascimento ? s.data_nascimento.split("-").reverse().join("/") : "",
      s.data_falecimento ? s.data_falecimento.split("-").reverse().join("/") : "",
      s.funeraria,
    ];
  });

  autoTable(doc, {
    startY: 30,
    head: [["Nome", "Quadra", "Lote", "Gav.", "Nasc.", "Falec.", "Funerária"]],
    body: tableRows,
    theme: "grid", 
    
    headStyles: { 
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineWidth: 0.1,
      lineColor: [200, 200, 200]
    },

    styles: { 
      fontSize: 8, 
      cellPadding: 2,
      textColor: [0, 0, 0],
      lineColor: [230, 230, 230],
      lineWidth: 0.1 
    },

    columnStyles: {
      0: { cellWidth: 55 }, 
    },

    // CORREÇÃO DO ERRO DE INICIALIZAÇÃO AQUI:
    didDrawPage: (data) => {
      // Primeiro definimos a variável
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      
      // Agora usamos ela
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("* Óbito Pendente de Documentação", 14, pageHeight - 15);
      
      const str = "Página " + doc.internal.getNumberOfPages();
      doc.text(str, 14, pageHeight - 10);
    },
  });

  doc.save(`relatorio_${dataInicio.replace(/\//g, '-')}.pdf`);
};