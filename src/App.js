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
  const [usuarios, setUsuarios] = React.useState([]);

  const hotTableComponent = React.useRef(null);


  React.useEffect(() => {
    function getData(){
      fetch("https://jsonplaceholder.typicode.com/users")
      .then((response) => response.json())
      .then((data) => setUsuarios(data))
    }

    getData();
  }, []);

  const descargarArchivo = () => {
    const pluginDescarga =
      hotTableComponent.current.hotInstance.getPlugin("exportFile");

    pluginDescarga.downloadFile("csv", {
      filename: "usuarios",
      fileExtension: "csv",
      mimeType: "text/csv",
      columnHeaders: true,
    });
  };

  return (
    <div>
      <h2>Hola, gente</h2>
      <button onClick={() => descargarArchivo()}>Descargar archivo</button>

      {usuarios && 
        <HotTable ref={hotTableComponent} data={usuarios} licenseKey="non-commercial-and-evaluation" language={esMX.languageCode}
          colHeaders={true} 
          rowHeaders={true}
          columnSorting={true}
          mergeCells={true}
          // contextMenu={true}
          contextMenu={["row_above", "row_below"]}
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
