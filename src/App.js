import logo from './logo.svg';
import React from 'react';
import './App.css';

import { HotTable, HotColumn } from "@handsontable/react";
import { registerAllModules } from 'handsontable/registry';

import "handsontable/dist/handsontable.full.css";
import {registerLanguageDictionary, esMX} from "handsontable/i18n"

// Ejecutar para obtener toas las funciones de handsontable y el idioma
registerAllModules();
registerLanguageDictionary(esMX);

function App() {

  const datosLocales = [
    {
      id: 1,
      name: "Juan Pérez",
      username: "juanp",
      email: "juanp@example.com",
      address: { street: "Calle 1", city: "Ciudad 1" },
    },
    {
      id: 2,
      name: "Ana García",
      username: "anag",
      email: "anag@example.com",
      address: { street: "Calle 2", city: "Ciudad 2" },
    },
    {
      id: 3,
      name: "Luis Rodríguez",
      username: "luisr",
      email: "luisr@example.com",
      address: { street: "Calle 3", city: "Ciudad 3" },
    },

  ];

  const hotTableComponent = React.useRef(null);

  const cargarDatos = () => {
    const datosGuardados = localStorage.getItem("usuarios");
    return datosGuardados ? JSON.parse(datosGuardados) : datosLocales;
  };
  const [usuarios, setUsuarios] = React.useState(cargarDatos);

  React.useEffect(() => {
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  }, [usuarios]);

  const handleAfterChange = (changes) => {
    if (changes) {
      const nuevosUsuarios = [...usuarios];
      changes.forEach(([row, prop, oldValue, newValue]) => {
        const keys = prop.split(".");
        let target = nuevosUsuarios[row];

        for (let i = 0; i < keys.length - 1; i++) {
          target = target[keys[i]];
        }

        target[keys[keys.length - 1]] = newValue;
      });
      setUsuarios(nuevosUsuarios);
    }
  };

  const descargarArchivo = () => {
    const pluginDescarga = hotTableComponent.current.hotInstance.getPlugin("exportFile");
  
    pluginDescarga.downloadFile("csv", {
      filename: "usuarios",
      fileExtension: "csv",
      mimeType: "text/csv",
      columnHeaders: true,
      columnDelimiter: ";", // Punto y coma para separar por columnas ;VVVV
      rowHeaders: false,
    });
  };
  
  
  return (
    <div>
      <h2>Hola, mundo</h2>
      <button onClick={() => descargarArchivo()}>Descargar archivo</button>

      {usuarios && 
        <HotTable ref={hotTableComponent} data={usuarios} licenseKey="non-commercial-and-evaluation" language={esMX.languageCode}
          colHeaders={true} 
          rowHeaders={true}
          columnSorting={true}
          mergeCells={true}
          manualColumnMove={true}
          manualColumnResize={true}
          autoWrapRow= {true}
          autoWrapCol= {true}
          afterChange={handleAfterChange}
           contextMenu={true}
          //contextMenu={["row_above", "row_below", "col_left", "col_right", "remove_row", "remove_col"]}
          // readOnly={true}
          >
          
          <HotColumn readOnly={true} data="id" title='ID'/>
          <HotColumn data="name" title='Nombre'/>
          <HotColumn data="username" title='Usuario'/>
          <HotColumn data="email" title='Correo'/>
          <HotColumn data="address.street" title='Calle'/>
          <HotColumn data="address.city" title='Ciudad'/>

        </HotTable>
      
      
      }

    </div>
  );
}

export default App;