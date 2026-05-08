function normalizarTexto(texto = "") {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function clasificarCategoria(nombre = "") {
  const texto = normalizarTexto(nombre);

  if (texto.includes("cafe") || texto.includes("cafeteria")) {
    return "cafe";
  }

  if (texto.includes("pub") || texto.includes("cerveceria") || texto.includes("brew")) {
    return "pub";
  }

  if (texto.includes("boliche") || texto.includes("club")) {
    return "boliche";
  }

  if (texto.includes("resto") || texto.includes("restaurant") || texto.includes("parrilla")) {
    return "restaurant";
  }

  return "bar";
}
