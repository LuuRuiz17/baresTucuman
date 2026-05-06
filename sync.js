import axios from "axios";
import obtenerDatos from "./src/obtenerDatos.js";

const API_URL = "http://localhost:3000/bares";

// Función para normalizar strings (evita duplicados por mayúsculas/espacios)
const normalizar = (str) => str.trim().toLowerCase();

async function ejecutarSync() {
    try {
        // Obtengo datos (soporta async o sync)
        const datos = await obtenerDatos();

        let nuevos = 0;
        let duplicados = 0;
        let errores = 0;

        // Traigo datos existentes desde la API
        const res = await axios.get(API_URL);
        const existentes = res.data;

        for (const bar of datos) {
            const existe = existentes.some(b =>
                normalizar(b.nombre) === normalizar(bar.nombre)
            );

            if (existe) {
                duplicados++;
                continue;
            }

            try {
                const response = await axios.post(API_URL, {
                    nombre: bar.nombre,
                    ubicacion: bar.ubicacion
                });

                existentes.push(response.data);
                nuevos++;
            } catch (err) {
                console.error(`Error al crear "${bar.nombre}":`, err.message);
                errores++;
            }
        }

        console.log("Procesados:", datos.length);
        console.log("Nuevos:", nuevos);
        console.log("Duplicados:", duplicados);
        console.log("Errores:", errores);

    } catch (error) {
        console.error("Error general en la sincronización:", error.message);
    }
}

ejecutarSync();