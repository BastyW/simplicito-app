export const guardarHojaDB = async (datos, encabezados, seleccion, hojas) => {
    let nombreHoja;
        
    if (seleccion !== null) {
        nombreHoja = hojas[seleccion].nombre;
    } else {
        nombreHoja = prompt("Ingrese el nombre de la hoja de cálculo:");
        if (!nombreHoja) return; 
    }
    
    const hoja = { nombre: nombreHoja, datos, encabezados };
    const url = seleccion !== null
        ? `http://localhost:5000/hoja/${nombreHoja}`
        : 'http://localhost:5000/hoja';
    const method = seleccion !== null ? 'PUT' : 'POST';
  
    try {
        const response = await fetch(url, {
            method,
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


  
export const cargarHojas = async () => {
  try {
    const response = await fetch('http://localhost:5000/hojas');
    if (!response.ok) throw new Error('Error en la respuesta del servidor');
    return await response.json();
  } catch (error) {
    console.error('Error al cargar las hojas:', error);
  }
};
  