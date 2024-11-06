import React from 'react';

function HeaderControls({ crearHojaEnBlanco, descargarArchivo, guardarHoja, mostrarHoja, volverAtras, agregarFila, agregarColumna }) {
  return (
    <div className="mb-3">
      {!mostrarHoja ? (
        <button className="btn btn-success" onClick={crearHojaEnBlanco}>Crear Hoja en Blanco</button>
      ) : (
        <>
          <button className="btn btn-secondary" onClick={volverAtras}>Volver atrás</button>
          <button className="btn btn-secondary mr-2" onClick={agregarFila}>Agregar Fila</button>
          <button className="btn btn-secondary" onClick={agregarColumna}>Agregar Columna</button>
          <button className="btn btn-warning" onClick={descargarArchivo}>Descargar archivo</button>
          <button className="btn btn-danger" onClick={guardarHoja}>Guardar</button>
        </>
      )}
    </div>
  );
}

export default HeaderControls;
