import React from 'react';

function HeaderControls({ 
  crearHojaEnBlanco, 
  descargarArchivo, 
  guardarHoja, 
  mostrarHoja, 
  volverAtras, 
  agregarFila, 
  agregarColumna 
}) {

  // Función para volver atrás y recargar la página
  const manejarVolverAtras = () => {
    volverAtras();  
    window.location.reload(); 
  };

  // Función para guardar y recargar la página
  const manejarGuardarHoja = () => {
    guardarHoja();
    window.location.reload();
  };

  return (
    <div className="header-controls mb-3">
      {!mostrarHoja ? (
        <></>
      ) : (
        <>
          <div className='left-controls'>
            <button className="btn btn-secondary" onClick={manejarVolverAtras}>Volver atrás</button>
            <button className="btn btn-secondary mr-2" onClick={agregarFila}>Agregar Fila</button>
            <button className="btn btn-secondary" onClick={agregarColumna}>Agregar Columna</button>
          </div>
          <div className='right-controls'>
            <button className="btn btn-warning" onClick={descargarArchivo}>Descargar archivo</button>
            <button className="btn btn-danger" onClick={manejarGuardarHoja}>Guardar</button>
          </div>  
        </>
      )}
    </div>
  );
}

export default HeaderControls;
