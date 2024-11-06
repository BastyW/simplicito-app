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

  // Función para generar encabezados alfabéticos
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

  // Cargar datos y encabezado desde localStorage ;u
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
  const [mostrarHoja, setMostrarHoja] = useState(() => {
    return localStorage.getItem("mostrarHoja") === "false";
  });

  // Guardar cambios en localStorage
  useEffect(() => {
    localStorage.setItem("hojaCalculo", JSON.stringify(datos));
    localStorage.setItem("encabezadosHojaCalculo", JSON.stringify(encabezados));
  }, [datos, encabezados]);

  useEffect(() => {
    localStorage.setItem("mostrarHoja", mostrarHoja);
  }, [mostrarHoja]);

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

  
  const agregarFila = () => setDatos([...datos, []]);

  const agregarColumna = () => {
    if (encabezados.length < 676) {
      const nuevosDatos = datos.map(fila => [...fila, '']);
      setDatos(nuevosDatos);
    } else {
      alert("Se ha alcanzado el límite de columnas (676).");
    }
  };
  //Crear nueva hoja en blanco
  const crearHojaEnBlanco = () => {
    setDatos([[]]);
    setEncabezados(generarEncabezadosAlfabeticos(8));
    setSeleccion(null);
    setMostrarHoja(true);
  };
  //Función para descargar archivo
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

  //Opciones del menú contextual
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

    if (!nombreHoja) return;

    const hoja = {
      nombre: nombreHoja,
      datos,
      encabezados,
    };

    try {
      const method = seleccion !== null ? 'PUT' : 'POST';
      const url = seleccion !== null
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

  // Cargar hojas desde la base de datos
  const [hojas, setHojas] = useState([]);
  const [seleccion, setSeleccion] = useState(null);

  const cargarHojas = async () => {
    try {
      const response = await fetch('http://localhost:5000/hojas');
      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      const hojasData = await response.json();
      setHojas(hojasData);
      setMostrarHoja(false);
    } catch (error) {
      console.error('Error al cargar las hojas:', error);
      alert('Error al cargar las hojas.');
    }
  };

  useEffect(() => {
    cargarHojas(); // Cargar hojas al iniciar la aplicación
  }, []);

  const manejarSeleccion = (indice) => {
    if (indice >= 0 && indice < hojas.length) {
      console.log("Hoja seleccionada:", hojas[indice]); 
      const hojaSeleccionada = hojas[indice];
      setDatos(hojaSeleccionada.datos);
      setEncabezados(hojaSeleccionada.encabezados);
      setSeleccion(indice); // Actualiza el índice de la hoja seleccionada
      setMostrarHoja(true); // Muestra la hoja seleccionada
    } else {
      alert("Selección no válida.");
    }
  };

  const volverAtras = () => {
    setMostrarHoja(false);
    setSeleccion(null);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Hoja de Cálculo</h2>

      {!mostrarHoja ? (
        <>
          <div className="mb-3">
            <button className="btn btn-success" onClick={crearHojaEnBlanco}>Crear Hoja en Blanco</button>
          </div>
          <div className="grid-container">
            {hojas.length === 0 ? (
              <p>No hay hojas disponibles. Carga primero las hojas desde el servidor.</p>
            ) : (
              hojas.map((hoja, index) => (
                <div 
                  key={hoja.id} 
                  className="hoja-casilla" 
                  onClick={() => manejarSeleccion(index)}
                >
                  {hoja.nombre}
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <button className="btn btn-secondary mb-3" onClick={volverAtras}>Volver atrás</button>

          <div className="button-group mb-3">
            <button className="btn btn-secondary mr-2" onClick={() => setDatos([...datos, []])}>Agregar Fila</button>
            <button className="btn btn-secondary" onClick={() => setDatos(datos.map(fila => [...fila, '']))}>Agregar Columna</button>
            <button className="btn btn-warning mx-2" onClick={descargarArchivo}>Descargar archivo</button>
            <button className="btn btn-danger" onClick={guardarHoja}>Guardar</button>
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
        </>
      )}
    </div>
  );
}

export default App;
