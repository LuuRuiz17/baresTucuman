import express from "express";

let bares = [];

const app = express();
app.use(express.json());
app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});

// CREATE
app.post("/bares", (req, res) => {
    const nuevoBar = {
        id: Date.now(),
        nombre: req.body.nombre,
        ubicacion: req.body.ubicacion,
        categoria: "",
        fuente: "mock",
        fechaObtencion: new Date().toISOString(),
        activo: true
    };

    bares.push(nuevoBar);

    res.json(nuevoBar);
});

//READ
app.get("/bares", (req, res) => {
    res.json(bares);
});

//UPDATE
app.put("/bares/:id", (req, res) => {
    const id = parseInt(req.params.id);

    bares = bares.map(bar =>
        bar.id === id ? { ...bar, ...req.body } : bar
    );

    res.json({ mensaje: "Actualizado" });
});

//DELETE
app.delete("/bares/:id", (req, res) => {
    const id = parseInt(req.params.id);

    bares = bares.map(bar =>
        bar.id === id ? { ...bar, activo: false } : bar
    );

    res.json({ mensaje: "Desactivado" });
});

