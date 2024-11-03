import React from 'react';
import './App.css';
import { HotTable } from "@handsontable/react";
import { registerAllModules } from 'handsontable/registry';
import "handsontable/dist/handsontable.full.css";
import { registerLanguageDictionary, esMX } from "handsontable/i18n";

registerAllModules();
registerLanguageDictionary(esMX);

function App() {
  const hotTableComponent = React.useRef(null);

  const generarEncabezadosAlfabeticos = (numColumnas) => {
    const encabezados = [];
    for (let i = 0; i < numColumnas; i++) {
      let columna = '';
      let temp = i;
      while (temp >= 0) {
        columna = String.fromCharCode((temp % 26) + 65) + columna;
        temp = Math.floor(temp / 26) - 1;
      }
      encabezados.push(columna);
    }
    return encabezados;
  };

  // Cargar datos y encabezados desde localStorage ;u
  const cargarDatos = () => {
    const datosGuardados = localStorage.getItem("hojaCalculo");
    return datosGuardados ? JSON.parse(datosGuardados) : [[]]; 
  };

  const cargarEncabezados = () => {
    const encabezadosGuardados = localStorage.getItem("encabezadosHojaCalculo");
    return encabezadosGuardados ? JSON.parse(encabezadosGuardados) : generarEncabezadosAlfabeticos(8);
  };

  const [datos, setDatos] = React.useState(cargarDatos);
  const [encabezados, setEncabezados] = React.useState(cargarEncabezados());

  // Guardar cambios en localStorage
  React.useEffect(() => {
    localStorage.setItem("hojaCalculo", JSON.stringify(datos));
    localStorage.setItem("encabezadosHojaCalculo", JSON.stringify(encabezados));
  }, [datos, encabezados]);

  const resolverExpresionConNombres = (expresion) => {
    const regex = /([A-Z]+)(\d+)/g; 
    return expresion.replace(regex, (match, col, row) => {
      const colIndex = encabezados.findIndex(header => header === col);
      const rowIndex = parseInt(row) - 1;
      if (datos[rowIndex] && datos[rowIndex][colIndex] !== undefined) {
        return datos[rowIndex][colIndex] || 0; 
      }
      return 0;
    });
  };

  const handleAfterChange = (changes) => {
    if (changes) {
      const nuevosDatos = [...datos];
      changes.forEach(([row, col, oldValue, newValue]) => {
        if (!nuevosDatos[row]) {
          nuevosDatos[row] = [];
        }
        if (typeof newValue === 'string' && newValue.match(/^[0-9+\-*/()\sA-Z]+$/)) {
          try {
            const expresionResuelta = resolverExpresionConNombres(newValue);
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

  // Agregar una fila vacía
  const agregarFila = () => {
    setDatos([...datos, []]);
  };

  // Agregar una columna vacía
  const agregarColumna = () => {
    if (encabezados.length < 26 * 26) { 
      const nuevosDatos = datos.map(fila => [...fila, '']); 
      setDatos(nuevosDatos);
    } else {
      alert("Se ha alcanzado el límite de columnas (676).");
    }
  };

  // Descargar archivo
  const descargarArchivo = () => {
    const pluginDescarga = hotTableComponent.current.hotInstance.getPlugin("exportFile");
    pluginDescarga.downloadFile("csv", {
      filename: "hoja_calculo",
      fileExtension: "csv",
      mimeType: "text/csv",
      columnHeaders: true,
      columnDelimiter: ";",
      rowHeaders: false,
    });
  };

  // Manejar cambio en los encabezados
  const manejarCambioEncabezado = (index, nuevoTitulo) => {
    const nuevosEncabezados = [...encabezados];
    nuevosEncabezados[index] = nuevoTitulo.toUpperCase();
    setEncabezados(nuevosEncabezados);
  };

  const cambiarNombreEncabezado = (colIndex) => {
    const nuevoTitulo = prompt("Ingrese el nuevo título para la columna:", encabezados[colIndex]);
    if (nuevoTitulo !== null && nuevoTitulo.trim() !== '') {
      manejarCambioEncabezado(colIndex, nuevoTitulo);
    }
  };

  // Opciones del menú contextual
  const contextMenuItems = [
    {
      name: 'Cambiar nombre de columna',
      callback: (key, selection) => {
        const colIndex = selection[0].start.col;
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

  // Guardar datos en MongoDB
  const guardarHoja = async () => {
    const hoja = {
      nombre: prompt("Ingrese el nombre de la hoja de cálculo:"),
      datos: datos,
      encabezados: encabezados,
    };

    try {
      const response = await fetch('http://localhost:5000/hoja', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hoja),
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error al guardar la hoja:', error);
      alert('Error al guardar la hoja.');
    }
  };

  return (
    <div>
      <h2>Hoja de Cálculo</h2>
      <button onClick={agregarFila}>Agregar Fila</button>
      <button onClick={agregarColumna}>Agregar Columna</button>
      <button onClick={descargarArchivo}>Descargar archivo</button>
      <button onClick={guardarHoja}>Guardar</button>

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
      />
    </div>
  );
}

export default App;
