import axios from "axios";
import obtenerDatos from "./src/obtenerDatos.js";

const API_URL = "http://localhost:3000/bares";

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ");
}

function similitud(a, b) {
    const setA = new Set(normalizarTexto(a).split(" "));
    const setB = new Set(normalizarTexto(b).split(" "));

    const interseccion = [...setA].filter(x => setB.has(x)).length;
    const union = new Set([...setA, ...setB]).size;

    return union === 0 ? 0 : interseccion / union;
}

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

            // Busco el mejor match en existentes
            let mejorMatch = null;
            let mejorScore = 0;

            for (const b of existentes) {
                const score = similitud(b.nombre, bar.nombre);

                if (score > mejorScore) {
                    mejorScore = score;
                    mejorMatch = b;
                }
            }

            const esDuplicado = mejorScore >= 0.65;

            if (!esDuplicado && mejorScore > 0.4) {
                console.log(`\nPosible duplicado: "${bar.nombre}" ~ "${mejorMatch.nombre}" (${mejorScore.toFixed(2)})`);
            }

            if (esDuplicado) {
                duplicados++;
                if (mejorScore < 1) {
                    console.log("\nDuplicado detectado:");
                    console.log(`\n - Nuevo: "${bar.nombre}"`);
                    console.log(` - Existente: "${mejorMatch.nombre}"`);
                    console.log(` - Similitud: ${mejorScore.toFixed(2)}`);
                }

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

        console.log("\nRESUMEN");
        console.log("Procesados:", datos.length);
        console.log("Nuevos:", nuevos);
        console.log("Duplicados:", duplicados);
        console.log("Errores:", errores);

    } catch (error) {
        console.error("Error general en la sincronización:", error.message);
    }
}

ejecutarSync();