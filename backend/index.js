const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
const conectarBD = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/simplicito', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Conectado a MongoDB');
    } catch (err) {
        console.error('No se pudo conectar a MongoDB', err);
        process.exit(1); // Finaliza el proceso si no se puede conectar
    }
};

conectarBD(); // Llama a la función para conectar

// Definir el esquema de la hoja de cálculo
const hojaCalculoSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true }, // nombre de la hoja
    datos: { type: [[String]], required: true },             // datos de las celdas
    encabezados: { type: [String], required: true },         // encabezados de columnas
    ultimaModificacion: { type: Date, default: Date.now }    // fecha de última modificación
});

// Crear el modelo basado en el esquema
const HojaCalculo = mongoose.model('HojaCalculo', hojaCalculoSchema);

// Ruta de prueba para verificar el funcionamiento del backend
app.get("/", (req, res) => {
    res.send("La app está funcionando");
});

// Ruta para crear una nueva hoja de cálculo
app.post("/hoja", async (req, res) => {
    const { nombre, datos, encabezados } = req.body;

    try {
        const nuevaHoja = new HojaCalculo({
            nombre,
            datos,
            encabezados,
            ultimaModificacion: new Date()
        });
        await nuevaHoja.save();
        res.status(201).json({ message: "Hoja de cálculo creada exitosamente", hoja: nuevaHoja });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Ruta para obtener todas las hojas de cálculo
app.get("/hojas", async (req, res) => {
    try {
        const hojas = await HojaCalculo.find();
        res.status(200).json(hojas);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las hojas de cálculo" });
    }
});

// Ruta para obtener una hoja de cálculo específica por nombre
app.get("/hoja/:nombre", async (req, res) => {
    const { nombre } = req.params;
    try {
        const hoja = await HojaCalculo.findOne({ nombre });
        if (!hoja) {
            return res.status(404).json({ error: "Hoja de cálculo no encontrada" });
        }
        res.status(200).json(hoja);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener la hoja de cálculo" });
    }
});

// Ruta para actualizar una hoja de cálculo existente
app.put("/hoja/:nombre", async (req, res) => {
    const { nombre } = req.params;
    const { datos, encabezados } = req.body;

    try {
        const hojaActualizada = await HojaCalculo.findOneAndUpdate(
            { nombre },
            { datos, encabezados, ultimaModificacion: new Date() },
            { new: true }
        );
        if (!hojaActualizada) {
            return res.status(404).json({ error: "Hoja de cálculo no encontrada" });
        }
        res.status(200).json({ message: "Hoja de cálculo actualizada exitosamente", hoja: hojaActualizada });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
