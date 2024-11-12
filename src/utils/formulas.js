// Función para resolver las celdas referenciadas en una expresión (ej. A1, B2...)
export const resolverExpresionConNombres = (expresion, datos, encabezados) => {
  const regex = /([A-Z]+)(\d+)/g;
  return expresion.replace(regex, (match, col, row) => {
    const colIndex = encabezados.findIndex(header => header === col);
    const rowIndex = parseInt(row) - 1;
    return datos[rowIndex]?.[colIndex] || 0;
  });
};

// Función para resolver el valor de una celda que puede ser una fórmula o un valor numérico
export const resolverValorCelda = (expresion, datos, encabezados) => {
  if (typeof expresion === 'string') {
    try {
      const expresionResuelta = resolverExpresionConNombres(expresion, datos, encabezados);
      return eval(expresionResuelta); 
    } catch (error) {
      return NaN; 
    }
  }
  return parseFloat(expresion);
};

// Función genérica para realizar operaciones (suma, resta, multiplicación, división)
const operarSeleccion = (selection, datos, encabezados, operacion) => {
  let resultado;
  let primerValorAsignado = false;  // Para controlar si ya se usó el primer valor

  selection.forEach(({ start, end }) => {
    const startRow = start.row;
    const endRow = end.row;
    const startCol = start.col;
    const endCol = end.col;

    if (startRow === endRow) {
      for (let col = startCol; col <= endCol; col++) {
        const valor = resolverValorCelda(datos[startRow][col], datos, encabezados);
        if (!isNaN(valor)) {
          if (!primerValorAsignado) {            
            resultado = valor;
            primerValorAsignado = true;
          } else {
            if (operacion === 'sumar') resultado += valor;
            if (operacion === 'restar') resultado -= valor;
            if (operacion === 'multiplicar') resultado *= valor;
            if (operacion === 'dividir' && valor !== 0) resultado /= valor;
          }
        }
      }
    } else if (startCol === endCol) {
      for (let row = startRow; row <= endRow; row++) {
        const valor = resolverValorCelda(datos[row][startCol], datos, encabezados);
        if (!isNaN(valor)) {
          if (!primerValorAsignado) {
            resultado = valor;
            primerValorAsignado = true;
          } else {
            if (operacion === 'sumar') resultado += valor;
            if (operacion === 'restar') resultado -= valor;
            if (operacion === 'multiplicar') resultado *= valor;
            if (operacion === 'dividir' && valor !== 0) resultado /= valor;
          }
        }
      }
    }
  });

  return resultado;
};



// Funciones para las operaciones específicas (sumar, restar, multiplicar, dividir)
export const sumarSeleccion = (selection, datos, encabezados) => operarSeleccion(selection, datos, encabezados, 'sumar');
export const restarSeleccion = (selection, datos, encabezados) => operarSeleccion(selection, datos, encabezados, 'restar');
export const multiplicarSeleccion = (selection, datos, encabezados) => operarSeleccion(selection, datos, encabezados, 'multiplicar');
export const dividirSeleccion = (selection, datos, encabezados) => operarSeleccion(selection, datos, encabezados, 'dividir');
