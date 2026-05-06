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


