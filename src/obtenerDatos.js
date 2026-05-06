import fs from "fs";

export default function obtenerDatos() {
  const data = fs.readFileSync("./data/bares.json", "utf-8");
  const bares = JSON.parse(data);

  const resultado = bares.map(bar => ({
    nombre: bar.nombre,
    ubicacion: bar.ubicacion,
    categoria: "",
    fuente: "mock",
    fechaObtencion: new Date().toISOString()
  }));

  return resultado;
}   

