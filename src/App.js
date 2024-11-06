import React, { useState, useEffect } from 'react';
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

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Hoja de Cálculo</h2>
      <HeaderControls
        crearHojaEnBlanco={() => { setDatos([[]]); setEncabezados(cargarEncabezados()); setSeleccion(null); setMostrarHoja(true); }}
        descargarArchivo={() => {}}
        guardarHoja={() => guardarHojaDB(datos, encabezados, seleccion, hojas)}
        mostrarHoja={mostrarHoja}
        volverAtras={() => setMostrarHoja(false)}
        agregarFila={() => setDatos([...datos, []])}
        agregarColumna={() => setDatos(datos.map(fila => [...fila, '']))}
      />
      <Spreadsheet
        datos={datos}
        encabezados={encabezados}
        setDatos={setDatos}
        setEncabezados={setEncabezados}
        manejarSeleccion={manejarSeleccion}
        hojas={hojas}
        mostrarHoja={mostrarHoja}
      />
    </div>
  );
}

export default App;
