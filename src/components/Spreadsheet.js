import React, { useRef } from 'react';
import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.css";
import { resolverExpresionConNombres } from '../utils/formulas';  
import { registerAllModules } from 'handsontable/registry';
import { registerLanguageDictionary, esMX } from "handsontable/i18n";

// Registro de módulos y lenguaje
registerAllModules();
registerLanguageDictionary(esMX);

function Spreadsheet({ datos, encabezados, setDatos, setEncabezados, manejarSeleccion, hojas, mostrarHoja }) {
  const hotTableComponent = useRef(null);

  // Maneja los cambios en las celdas
  const handleAfterChange = (changes) => {
    if (changes) {
      const nuevosDatos = [...datos];
      changes.forEach(([row, col, oldValue, newValue]) => {
        if (typeof newValue === 'string' && /^[0-9+\-*/()\sA-Z]+$/.test(newValue)) {
          try {            
            const expresionResuelta = resolverExpresionConNombres(newValue, datos, encabezados);
            // eval de forma controlada 
            nuevosDatos[row][col] = eval(expresionResuelta);
          } catch (error) {
            nuevosDatos[row][col] = 'Error'; 
          }
        } else {
          nuevosDatos[row][col] = newValue;
        }
      });
      setDatos(nuevosDatos);  
    }
  };

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

  // Opciones del menú contextual
  const contextMenuItems = [
    {
      name: 'Cambiar nombre de columna',
      callback: (key, selection) => {
        const colIndex = selection[0].start.col;  // índice de la columna seleccionada
        cambiarNombreEncabezado(colIndex);
      }
    },
    'row_above',
    'row_below',
    'col_left',
    'col_right',
    'remove_row',
    'remove_col',
    'copy',
    'cut',
    'paste',
    'undo',
    'redo',
  ];

  return mostrarHoja ? (
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
      afterChange={handleAfterChange}
      contextMenu={contextMenuItems}
      onContextMenu={(e) => e.preventDefault()}
    />
  ) : (
    <div className="grid-container">
      {hojas.map((hoja, index) => (
        <div key={index} onClick={() => manejarSeleccion(index)}>
          {hoja.nombre}
        </div>
      ))}
    </div>
  );
}

export default Spreadsheet;
