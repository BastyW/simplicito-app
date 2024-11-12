import React from 'react';
import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.css";
import { 
  sumarSeleccion, 
  restarSeleccion, 
  multiplicarSeleccion, 
  dividirSeleccion 
} from '../utils/formulas'; 
import { registerAllModules } from 'handsontable/registry';
import { registerLanguageDictionary, esMX } from "handsontable/i18n";

// Registro de módulos y lenguaje
registerAllModules();
registerLanguageDictionary(esMX);

// Función para manejar el cambio en las celdas
const handleAfterChange = (changes, datos, setDatos) => {
  if (changes) {
    const nuevosDatos = [...datos];
    changes.forEach(([row, col, , newValue]) => {
      nuevosDatos[row][col] = newValue;
    });
    setDatos(nuevosDatos);  
  }
};

function Spreadsheet({ hotTableComponent, datos, encabezados, setDatos, setEncabezados }) {

  // Cambia el nombre del encabezado de columna
  const manejarCambioEncabezado = (index, nuevoTitulo) => {
    const nuevosEncabezados = [...encabezados];
    nuevosEncabezados[index] = nuevoTitulo.toUpperCase(); 
    setEncabezados(nuevosEncabezados);
  };
  
  const cambiarNombreEncabezado = (colIndex) => {
    const nuevoTitulo = prompt("Ingrese el nuevo título para la columna:", encabezados[colIndex]);
    if (nuevoTitulo?.trim()) {
      manejarCambioEncabezado(colIndex, nuevoTitulo); 
    }
  };

  // Función para realizar la operación seleccionada y actualizar datos
  const handleOperation = (operationFunc, selection) => {
    const resultado = operationFunc(selection, datos, encabezados);
    const lastSelection = selection[selection.length - 1];
    const row = lastSelection.end.row;
    const col = lastSelection.end.col;
    let nuevosDatos = [...datos];

    if (lastSelection.start.col === lastSelection.end.col) {
      nuevosDatos[row + 1] = nuevosDatos[row + 1] || [];
      nuevosDatos[row + 1][col] = resultado;
    } else {
      nuevosDatos[row][col + 1] = resultado;
    }
    setDatos(nuevosDatos);
  };

  // Opciones del menú contextual
  const contextMenuItems = {
    'change_header': {
      name: 'Cambiar nombre de columna',
      callback: (key, selection) => {
        const colIndex = selection[0].start.col;
        cambiarNombreEncabezado(colIndex);
      },
    },
    row_above: {},
    row_below: {},
    col_left: {},
    col_right: {},
    remove_row: {},
    remove_col: {},
    copy: {},
    cut: {},
    undo: {},
    redo: {},
    operations: {
      name: 'Operaciones',
      submenu: {
        items: [
          {
            key: 'operations:add',
            name: 'Sumar',
            callback: (key, selection) => handleOperation(sumarSeleccion, selection),
          },
          {
            key: 'operations:subtract',
            name: 'Restar',
            callback: (key, selection) => handleOperation(restarSeleccion, selection),
          },
          {
            key: 'operations:multiply',
            name: 'Multiplicar',
            callback: (key, selection) => handleOperation(multiplicarSeleccion, selection),
          },
          {
            key: 'operations:divide',
            name: 'Dividir',
            callback: (key, selection) => handleOperation(dividirSeleccion, selection),
          },
        ],
      },
    },
  };

  // Configuración del menú contextual para Handsontable
  const contextMenuConfig = {
    callback(key, selection, clickEvent) {
      console.log(key, selection, clickEvent);
    },
    items: contextMenuItems,
  };

  return (
    <HotTable
      ref={hotTableComponent} 
      data={datos}
      licenseKey="non-commercial-and-evaluation"
      language={esMX.languageCode}
      colHeaders={encabezados}
      rowHeaders={true}
      columnSorting={true}
      mergeCells={true}
      autoWrapRow={true}
      autoWrapCol={true}
      afterChange={(changes) => handleAfterChange(changes, datos, setDatos)}
      contextMenu={contextMenuConfig}  
    />
  );
}

export default Spreadsheet;
