export const cargarDatos = () => {
    const datosGuardados = localStorage.getItem("hojaCalculo");
    return datosGuardados ? JSON.parse(datosGuardados) : [[]];
};

export const cargarEncabezados = () => {
    const encabezadosGuardados = localStorage.getItem("encabezadosHojaCalculo");
    return encabezadosGuardados ? JSON.parse(encabezadosGuardados) : generarEncabezadosAlfabeticos(8);
};

export const guardarDatosLocal = (datos) => {
    localStorage.setItem("hojaCalculo", JSON.stringify(datos));
};

export const guardarEncabezadosLocal = (encabezados) => {
    localStorage.setItem("encabezadosHojaCalculo", JSON.stringify(encabezados));
};

// Cargar el índice de la hoja seleccionada desde localStorage
export const cargarSeleccion = () => {
    const seleccionGuardada = localStorage.getItem("hojaSeleccionada");
    return seleccionGuardada !== null ? JSON.parse(seleccionGuardada) : null;
};

// Guardar el índice de la hoja seleccionada en localStorage
export const guardarSeleccionLocal = (seleccion) => {
    localStorage.setItem("hojaSeleccionada", JSON.stringify(seleccion));
};

// Cargar el estado de mostrarHoja desde localStorage
export const cargarMostrarHoja = () => {
    return localStorage.getItem("mostrarHoja") === "true";
};

// Guardar el estado de mostrarHoja en localStorage
export const guardarMostrarHojaLocal = (mostrarHoja) => {
    localStorage.setItem("mostrarHoja", JSON.stringify(mostrarHoja));
};

// Generar encabezados alfabéticos para las columnas
export const generarEncabezadosAlfabeticos = (numColumnas) => {
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
