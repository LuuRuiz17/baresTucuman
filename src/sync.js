import supabase from "./supabase.js";
import obtenerDatos from "./obtenerDatos.js";

// --------------------
// NORMALIZACIÓN
// --------------------
function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ");
}

// --------------------
// SIMILITUD (JACCARD SIMPLE)
// --------------------
function similitud(a, b) {
    const setA = new Set(normalizarTexto(a).split(" "));
    const setB = new Set(normalizarTexto(b).split(" "));

    const interseccion = [...setA].filter(x => setB.has(x)).length;
    const union = new Set([...setA, ...setB]).size;

    return union === 0 ? 0 : interseccion / union;
}

// --------------------
// DUPLICADOS INTERNOS (JSON vs JSON)
// --------------------
function detectarDuplicadoInterno(datos, barActual) {
    for (const b of datos) {
        if (b === barActual) continue;

        const score = similitud(b.nombre, barActual.nombre);

        if (score >= 0.65) {
            return { match: b, score };
        }
    }
    return null;
}

// --------------------
// DUPLICADOS VS DB
// --------------------
function detectarDuplicadoDB(existentes, barActual) {
    let mejorMatch = null;
    let mejorScore = 0;

    for (const b of existentes) {
        const score = similitud(b.nombre, barActual.nombre);

        if (score > mejorScore) {
            mejorScore = score;
            mejorMatch = b;
        }
    }

    return { mejorMatch, mejorScore };
}

async function ejecutarSync() {
    const datos = await obtenerDatos();

    let nuevos = 0;
    let duplicados = 0;
    let potenciales = 0;
    let errores = 0;

    const { data: existentes, error } = await supabase
        .from("baresTucuman")
        .select("*");

    if (error) {
        console.error("Error DB:", error);
        return;
    }

    const vistos = new Set();

    for (const bar of datos) {
        const nombreNorm = normalizarTexto(bar.nombre);

        if (vistos.has(nombreNorm)) {
            duplicados++;
            console.log(`\nDUPLICADO INTERNO: "${bar.nombre}"`);
            continue;
        }

        const { mejorMatch, mejorScore } = detectarDuplicadoDB(existentes, bar);

        if (mejorScore >= 0.65) {
            duplicados++;
            console.log(`\nDUPLICADO EN DB: "${bar.nombre}" ↔ "${mejorMatch.nombre}" (Score: ${mejorScore.toFixed(2)})`);
            continue;
        }

        if (mejorScore > 0.4) {
            potenciales++;
            console.log(`\nPOTENCIAL DUPLICADO: "${bar.nombre}" ↔ "${mejorMatch.nombre}" (Score: ${mejorScore.toFixed(2)})`);
        }

        const { error: insertError } = await supabase
            .from("baresTucuman")
            .insert([
                {
                    nombre: bar.nombre,
                    ubicacion: bar.ubicacion
                }
            ]);

        if (insertError) {
            errores++;
            console.error("Insert error:", insertError.message);
        } else {
            nuevos++;
            vistos.add(nombreNorm);
        }
    }

    console.log("\nRESUMEN FINAL");
    console.log("Nuevos:", nuevos);
    console.log("Duplicados:", duplicados);
    console.log("Potenciales:", potenciales);
    console.log("Errores:", errores);
}


ejecutarSync();