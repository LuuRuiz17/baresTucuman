import supabase from "./supabase.js";

export async function registrarHistorial(barId, accion, datos) {
  const payload = {
    bar_id: barId,
    accion,
    datos,
    fecha: new Date().toISOString()
  };

  const { error } = await supabase
    .from("historial_bares")
    .insert([payload]);

  if (error) {
    console.error("Historial error:", error.message);
  }
}

