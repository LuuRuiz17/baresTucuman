import express from "express";
import supabase from "./supabase.js";
import { registrarHistorial } from "./auditoria.js";

const app = express();
app.use(express.json());
app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});

// CREATE
app.post("/bares", async (req, res) => {
    const nuevoBar = {
        nombre: req.body.nombre,
        ubicacion: req.body.ubicacion,
        categoria: req.body.categoria,
        fuente: req.body.fuente || "manual",
        fechaObtencion: req.body.fechaObtencion || new Date().toISOString(),
        activo: true
    };

    const { data, error } = await supabase
        .from("baresTucuman")
        .insert([nuevoBar])
        .select()
        .single();

    if (error) {
        return res.status(500).json({ mensaje: "No se pudo guardar el bar", error: error.message });
    }

    await registrarHistorial(data.id, "creado", data);

    res.json(data);
});

//READ
app.get("/bares", async (req, res) => {
    const { data, error } = await supabase
        .from("baresTucuman")
        .select("*")
        .eq("activo", true);

    if (error) {
        return res.status(500).json({ mensaje: "No se pudieron obtener los bares", error: error.message });
    }

    res.json(data);
});

//UPDATE
app.put("/bares/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const datosActualizados = { ...req.body };

    if (datosActualizados.nombre && !datosActualizados.categoria) {
        datosActualizados.categoria = clasificarCategoria(datosActualizados.nombre);
    }

    const { data, error } = await supabase
        .from("baresTucuman")
        .update(datosActualizados)
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) {
        return res.status(500).json({ mensaje: "No se pudo actualizar el bar", error: error.message });
    }

    if (!data) {
        return res.status(404).json({ mensaje: "Bar no encontrado" });
    }

    await registrarHistorial(data.id, "editado", data);

    res.json({
        mensaje: "Actualizado",
        bar: data
    });
});

//DELETE
app.delete("/bares/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { data, error } = await supabase
        .from("baresTucuman")
        .update({ activo: false })
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) {
        return res.status(500).json({ mensaje: "No se pudo desactivar el bar", error: error.message });
    }

    if (!data) {
        return res.status(404).json({ mensaje: "Bar no encontrado" });
    }

    await registrarHistorial(data.id, "desactivado", data);

    res.json({
        mensaje: "Desactivado",
        bar: data
    });
});

app.get("/historial", async (req, res) => {
    const { data, error } = await supabase
        .from("historial_bares")
        .select("*")
        .order("fecha", { ascending: false });

    if (error) {
        return res.status(500).json({ mensaje: "No se pudo obtener el historial", error: error.message });
    }

    res.json(data);
});
