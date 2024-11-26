//NOTAS:
// Los servidores que creamos con Express Js bloquean las consultas de aplicaciones
// externas gracias a que los CORS están deshabilitados por defecto
// podemos habilitarlos instalando un paquete de NPM llamado cors:
// npm install cors
// Posterior a esto se deben agregar estas 2 líneas:
// const cors = require('cors')
// app.use(cors())

// express.json permite procesar datos JSON enviados en el cuerpo de las solicitudes
// HTTP (por ejemplo, solicitudes POST, PUT, o PATCH).
// (importante) Asigna el objeto a la propiedad req.body
// Si no se incluye este middleware, req.body será UNDEFINED para las solicitudes con un cuerpo JSON
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const FILE_PATH = path.join(__dirname, 'repertorio.json');

app.use(cors());
app.use(express.json());

// Leer las canciones desde el archivo JSON
const leerCanciones = () => {
    try {
        const data = fs.readFileSync(FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error al leer el archivo:', error);
        return [];
    }
};

// Escribir las canciones en el archivo JSON
const escribirCanciones = (canciones) => {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(canciones, null, 2));
    } catch (error) {
        console.error('Error al escribir en el archivo:', error);
        throw error;
    }
};

// [OBTENER/LEER] todas las canciones
app.get('/canciones', (req, res) => {
    const canciones = leerCanciones();
    res.json(canciones);
});

// [AGREGAR] una canción
app.post('/canciones', (req, res) => {
    const nuevaCancion = req.body;
    const canciones = leerCanciones();
    canciones.push(nuevaCancion);
    escribirCanciones(canciones);
    res.status(201).send('Canción agregada exitosamente');
});

// [EDITAR] una canción por ID
app.put('/canciones/:id', (req, res) => {
    const { id } = req.params;
    const cancionActualizada = req.body;
    const canciones = leerCanciones();
    const index = canciones.findIndex(
                                        (cancion) => cancion.id == id
                                     );

    if (index === -1)
    {
        return res.status(404).send('Canción no encontrada');
    }

    //canciones[index]: Objeto a actualizar
    //{ ...canciones[index] } El operador spread (...) copia todas las propiedades y valores del objeto
    //canciones[index] al nuevo objeto.
    //El segundo uso del operador spread (...) agrega o reemplaza las propiedades del objeto original
    //con las propiedades de cancionActualizada.
    canciones[index] = { ...canciones[index], ...cancionActualizada };

    escribirCanciones(canciones);
    res.send('Canción actualizada exitosamente');
});

// [ELIMINAR] una canción por ID
app.delete('/canciones/:id', (req, res) => {
    const { id } = req.params;
    const canciones = leerCanciones();
    const cancionesFiltradas = canciones.filter(
                                                    (cancion) => cancion.id != id
                                               );

    if (canciones.length === cancionesFiltradas.length)
    {
        return res.status(404).send('Canción no encontrada');
    }

    escribirCanciones(cancionesFiltradas);
    res.send('Canción eliminada exitosamente');
});

// Levantar el servidor
const PORT = 5510;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});