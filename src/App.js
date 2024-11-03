import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { HotTable } from "@handsontable/react";
import { registerAllModules } from 'handsontable/registry';
import "handsontable/dist/handsontable.full.css";
import { registerLanguageDictionary, esMX } from "handsontable/i18n";

// Registro de módulos y lenguaje
registerAllModules();
registerLanguageDictionary(esMX);

function App() {
  const hotTableComponent = useRef(null);

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

  const [datos, setDatos] = useState(cargarDatos());
  const [encabezados, setEncabezados] = useState(cargarEncabezados());

  // Guardar cambios en localStorage
  useEffect(() => {
    localStorage.setItem("hojaCalculo", JSON.stringify(datos));
    localStorage.setItem("encabezadosHojaCalculo", JSON.stringify(encabezados));
  }, [datos, encabezados]);

  const resolverExpresionConNombres = (expresion) => {
    const regex = /([A-Z]+)(\d+)/g; 
    return expresion.replace(regex, (match, col, row) => {
      const colIndex = encabezados.findIndex(header => header === col);
      const rowIndex = parseInt(row) - 1;
      return datos[rowIndex]?.[colIndex] || 0; 
    });
  };

  const handleAfterChange = (changes) => {
    if (changes) {
      const nuevosDatos = [...datos];
      changes.forEach(([row, col, , newValue]) => {
        if (!nuevosDatos[row]) {
          nuevosDatos[row] = [];
        }
        if (typeof newValue === 'string' && /^[0-9+\-*/()\sA-Z]+$/.test(newValue)) {
          try {
            const expresionResuelta = resolverExpresionConNombres(newValue);
            nuevosDatos[row][col] = eval(expresionResuelta);
          } catch {
            nuevosDatos[row][col] = 'Error'; 
          }
        } else {
          nuevosDatos[row][col] = newValue; 
        }
      });
      setDatos(nuevosDatos);
    }
  };

  // Funciones para agregar filas y columnas
  const agregarFila = () => setDatos([...datos, []]);

  const agregarColumna = () => {
    if (encabezados.length < 676) { // Limite de 676 columnas (26*26)
      const nuevosDatos = datos.map(fila => [...fila, '']);
      setDatos(nuevosDatos);
    } else {
      alert("Se ha alcanzado el límite de columnas (676).");
    }
  };

  // Función para crear una hoja en blanco
  const crearHojaEnBlanco = () => {
    setDatos([[]]); // Inicializa datos como un array de un array vacío
    setEncabezados(generarEncabezadosAlfabeticos(8)); // Genera encabezados predeterminados
  };

  // Función para descargar archivo
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
    if (nuevoTitulo?.trim()) {
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
    const nombreHoja = prompt("Ingrese el nombre de la hoja de cálculo:", hojas[seleccion]?.nombre || '');

    if (!nombreHoja) return; // Si no se ingresa un nombre, salir de la función

    const hoja = {
      nombre: nombreHoja,
      datos,
      encabezados,
    };

    try {
      const method = seleccion !== '' ? 'PUT' : 'POST';
      const url = seleccion !== '' 
        ? `http://localhost:5000/hoja/${hojas[seleccion].nombre}` 
        : 'http://localhost:5000/hoja';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hoja),
      });

      const result = await response.json();
      alert(response.ok ? result.message : result.error);
    } catch (error) {
      console.error('Error al guardar la hoja:', error);
      alert('Error al guardar la hoja.');
    }
  };

  // Cargar desde la base de datos
  const [hojas, setHojas] = useState([]);
  const [seleccion, setSeleccion] = useState('');

  const cargarHojas = async () => {
    try {
      const response = await fetch('http://localhost:5000/hojas');
      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      const hojasData = await response.json();
      setHojas(hojasData);
    } catch (error) {
      console.error('Error al cargar las hojas:', error);
      alert('Error al cargar las hojas.');
    }
  };

  const manejarSeleccion = () => {
    const indiceSeleccionado = parseInt(seleccion);
    if (indiceSeleccionado >= 0 && indiceSeleccionado < hojas.length) {
      const hojaSeleccionada = hojas[indiceSeleccionado];
      setDatos(hojaSeleccionada.datos);
      setEncabezados(hojaSeleccionada.encabezados);
    } else {
      alert("Selección no válida. Por favor, elija un número de la lista.");
    }
  };

  return (
    <div className="app-container">
      <h2>Hoja de Cálculo</h2>

      <button onClick={cargarHojas}>Cargar Hoja</button>
      <button onClick={crearHojaEnBlanco}>Crear Hoja en Blanco</button>
      
      {hojas.length > 0 && (
        <div>
          <label htmlFor="hojaSelect">Seleccione una hoja:</label>
          <select
            id="hojaSelect"
            value={seleccion}
            onChange={(e) => setSeleccion(e.target.value)}
          >
            <option value="">Seleccione...</option>
            {hojas.map((h, index) => (
              <option key={h.id} value={index}>{h.nombre}</option>
            ))}
          </select>
          <button onClick={manejarSeleccion}>Cargar Selección</button>
        </div>
      )}

      <div className="button-group">
        <button onClick={agregarFila}>Agregar Fila</button>
        <button onClick={agregarColumna}>Agregar Columna</button>
        <button onClick={descargarArchivo}>Descargar archivo</button>
        <button onClick={guardarHoja}>Guardar</button>
      </div>

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
