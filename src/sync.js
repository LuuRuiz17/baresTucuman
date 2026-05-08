import supabase from "./supabase.js";
import obtenerDatos from "./obtenerDatos.js";
import { registrarHistorial } from "./auditoria.js";

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

function detectarDuplicado(dataSet, barActual, ignorarSelf = false) {
    let mejorMatch = null;
    let mejorScore = 0;

    for (const b of dataSet) {
        if (ignorarSelf && b === barActual) continue;
        const score = similitud(b.nombre, barActual.nombre);

        if (score > mejorScore) {
            mejorScore = score;
            mejorMatch = b;
        }
    }

    return { mejorMatch, mejorScore };
}

function clasificarDuplicado(score, match, contexto, contadores) {
    if (!match) return false;

    if (score >= 0.7) {
        contadores.duplicados++;
        console.log(`DUPLICADO ${contexto}: "${match.nombre}" (Score: ${score.toFixed(2)})`);
        return "duplicado";
    }

    if (score > 0.4 && score < 0.7) {
        contadores.potenciales++;
        console.log(`POTENCIAL DUPLICADO ${contexto}: "${match.nombre}" (Score: ${score.toFixed(2)})`);
        return "potencial";
    }

    return false;
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
            console.log(`DUPLICADO: "${bar.nombre}"`);
            continue;
        }

        const { mejorMatch: matchInterno, mejorScore: scoreInterno } = detectarDuplicado(datos, bar, true);
        const resultadoInterno = clasificarDuplicado(scoreInterno, matchInterno, "INTERNO", { duplicados, potenciales });
        if (resultadoInterno === "potencial") {
            potenciales++;
        }
        
        const { mejorMatch, mejorScore } = detectarDuplicado(existentes, bar);
        const resultadoDB = clasificarDuplicado(mejorScore, mejorMatch, "EN DB", { duplicados, potenciales });
        if (resultadoDB === "duplicado") {
            duplicados++;
            continue;
        }

        const { data: insertado, error: insertError } = await supabase
            .from("baresTucuman")
            .insert([
                {
                    nombre: bar.nombre,
                    ubicacion: bar.ubicacion,
                    categoria: bar.categoria,
                    fuente: bar.fuente,
                    fechaObtencion: bar.fechaObtencion,
                    activo: bar.activo
                }
            ])
            .select()
            .single();

        if (insertError) {
            errores++;
            console.error("Insert error:", insertError.message);
        } else {
            nuevos++;
            vistos.add(nombreNorm);
            existentes.push(insertado);
            await registrarHistorial(insertado.id, "creado_desde_sync", insertado);
        }
    }

    console.log("\nRESUMEN FINAL");
    console.log("Nuevos:", nuevos);
    console.log("Duplicados:", duplicados);
    console.log("Potenciales:", potenciales);
    console.log("Errores:", errores);
}


ejecutarSync();
