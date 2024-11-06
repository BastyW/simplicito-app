export const resolverExpresionConNombres = (expresion, datos, encabezados) => {
    const regex = /([A-Z]+)(\d+)/g;
    return expresion.replace(regex, (match, col, row) => {
      const colIndex = encabezados.findIndex(header => header === col);
      const rowIndex = parseInt(row) - 1;
      return datos[rowIndex]?.[colIndex] || 0;
    });
  };
  