import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Spreadsheet from './components/Spreadsheet';
import HeaderControls from './components/HeaderControls';
import {
    cargarDatos,
    cargarEncabezados,
    guardarDatosLocal,
    guardarEncabezadosLocal,
    cargarSeleccion,
    guardarSeleccionLocal,
    cargarMostrarHoja,
    guardarMostrarHojaLocal
} from './utils/storage';
import { cargarHojas, guardarHojaDB } from './utils/db';

function App() {
  const [datos, setDatos] = useState(cargarDatos());
  const [encabezados, setEncabezados] = useState(cargarEncabezados());
  const [mostrarHoja, setMostrarHoja] = useState(cargarMostrarHoja());
  const [hojas, setHojas] = useState([]);
  const [seleccion, setSeleccion] = useState(cargarSeleccion());
  const hotTableComponent = useRef(null); 
  const [previewData, setPreviewData] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(null);

  // Cargar las hojas desde la base de datos
  useEffect(() => {
    cargarHojas().then((hojasCargadas) => {
        setHojas(hojasCargadas);
        
        // Si hay una hoja seleccionada, carga sus datos y encabezados
        if (seleccion !== null && hojasCargadas[seleccion]) {
            const hojaSeleccionada = hojasCargadas[seleccion];
            setDatos(hojaSeleccionada.datos);
            setEncabezados(hojaSeleccionada.encabezados);
        }
    });
  }, []);

  // Guarda datos y encabezados en localStorage cuando cambian
  useEffect(() => {
    guardarDatosLocal(datos);
    guardarEncabezadosLocal(encabezados);
  }, [datos, encabezados]);

  // Guarda el índice de la hoja seleccionada en localStorage cuando cambia
  useEffect(() => {
    guardarSeleccionLocal(seleccion);
  }, [seleccion]);

  // Guarda el estado de mostrarHoja en localStorage cuando cambia
  useEffect(() => {
    guardarMostrarHojaLocal(mostrarHoja);
  }, [mostrarHoja]);

  // Manejo de selección de hoja
  const manejarSeleccion = (index) => {
    if (index >= 0 && index < hojas.length) {
      const hojaSeleccionada = hojas[index];
      setDatos(hojaSeleccionada.datos);
      setEncabezados(hojaSeleccionada.encabezados);
      setSeleccion(index);
      setMostrarHoja(true);
    } else {
      alert("Selección no válida.");
    }
  };

  // Función para descargar archivo
  const descargarArchivo = () => {
    if (hotTableComponent.current?.hotInstance) {
      const pluginDescarga = hotTableComponent.current.hotInstance.getPlugin("exportFile");
      pluginDescarga.downloadFile("csv", {
        filename: "hoja_calculo",
        fileExtension: "csv",
        mimeType: "text/csv",
        columnHeaders: true,
        columnDelimiter: ";",
        rowHeaders: false,
      });
    } else {
      alert("Error al descargar el archivo. La instancia de Handsontable no está disponible.");
    }
  };

  const manejarPrevisualizacion = (index) => {
    if (index >= 0 && index < hojas.length) {
      const hojaSeleccionada = hojas[index];
      const datosRecortados = hojaSeleccionada.datos.slice(0, 3).map(fila => fila.slice(0, 4)); // Máx. 3 filas y 4 columnas
      const encabezadosRecortados = hojaSeleccionada.encabezados.slice(0, 4); // Máx. 4 encabezados
  
      setPreviewData({
        nombre: hojaSeleccionada.nombre,
        encabezados: encabezadosRecortados,
        datos: datosRecortados,
      });
      setPreviewIndex(index);
    }
  };

  return (
    <div className="app-container">
        {/* Barra lateral */}
        {!mostrarHoja && (
          <aside className="sidebar">
            <h2>Simplicito</h2>
            <button className="crear-proyecto-btn" onClick={() => { 
                setDatos([[]]); 
                setEncabezados([]); 
                setSeleccion(null); 
                setMostrarHoja(true);
            }}>
                Crear proyecto
            </button>
            <nav>
                <ul>
                    <li>Proyectos recientes</li>
                    <li>Opciones</li>
                    <li>Acerca de la app</li>
                </ul>
            </nav>
        </aside>
        )}

        {/* Contenido principal */}
        <main className={`main-content ${mostrarHoja ? 'full-width' : ''}`}>
            <header className="header ">
                <h2>¡Buenas tardes, Usuario!</h2>
            </header>

            <div className="content-sections">

                {!mostrarHoja && (
                    <section className="recent-projects">
                        <h3>Proyectos recientes</h3>
                        <div className="projects-list">
                            {hojas.length === 0 ? (
                                <p>No hay hojas disponibles. Carga primero las hojas desde el servidor.</p>
                            ) : (
                                hojas.map((hoja, index) => (
                                    <div
                                        key={hoja.id}
                                        className="hoja-casilla"
                                        onClick={() => manejarPrevisualizacion(index)}
                                        onDoubleClick={() => manejarSeleccion(index)}
                                    >
                                        <div className="hoja-icono"></div>
                                        <div className="hoja-info">
                                            <div className="hoja-nombre">{hoja.nombre}</div>
                                            <div className="hoja-fecha">
                                                Fecha de modificación: {new Date(hoja.ultimaModificacion).toLocaleDateString('es-ES', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                )}
                
                {!mostrarHoja && (
                    <section className="preview-section">
                    <h3>Previsualización</h3>
                    {previewData ? (
                      <div className="preview-content">
                        <h4>{previewData.nombre}</h4>
                        <table className="preview-table">
                          <thead>
                            <tr>
                              {previewData.encabezados.map((header, index) => (
                                <th key={index}>{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.datos.map((fila, index) => (
                              <tr key={index}>
                                {fila.map((celda, i) => (
                                  <td key={i}>{celda}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <button 
                            className="preview-button" 
                            onClick={() => {
                            if (previewIndex !== null) {
                                manejarSeleccion(previewIndex); // Carga la hoja completa
                                setMostrarHoja(true);          // Muestra la hoja
                            } else {
                                alert("Selecciona una hoja para abrir.");
                            }
                            }}>
                            Abrir
                        </button>
                      </div>                      
                    ) : (
                      <p>Selecciona una hoja para previsualizarla.</p>
                    )}
                  </section>
                )}
            </div>

            {/* Controles de encabezado y hoja de cálculo */}
            <HeaderControls
                crearHojaEnBlanco={() => { 
                    setDatos([[]]); 
                    setEncabezados([]); 
                    setSeleccion(null); 
                    setMostrarHoja(true); 
                }}
                descargarArchivo={descargarArchivo}
                guardarHoja={() => guardarHojaDB(datos, encabezados, seleccion, hojas)}
                mostrarHoja={mostrarHoja}
                volverAtras={() => setMostrarHoja(false)}
                agregarFila={() => setDatos([...datos, []])}
                agregarColumna={() => setDatos(datos.map(fila => [...fila, '']))}
            />

            {/* Mostrar hoja de cálculo seleccionada */}
            {mostrarHoja && (
                <div className='spreadsheet-container'>
                    <Spreadsheet
                        hotTableComponent={hotTableComponent}
                        datos={datos}
                        encabezados={encabezados}
                        setDatos={setDatos}
                        setEncabezados={setEncabezados}
                        manejarSeleccion={manejarSeleccion}
                        hojas={hojas}
                        mostrarHoja={mostrarHoja}
                    />
                </div>    
            )}
        </main>
    </div>
  );
}

export default App;
