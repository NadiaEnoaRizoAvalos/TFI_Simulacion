const DEFAULT_TIEMPO_DESMONTAJE_PROMEDIO_MINUTOS = 25;

export function getTiempoDesmontajePromedioMinutos(): number {
    const raw = process.env.TIEMPO_DESMONTAJE_PROMEDIO_MINUTOS;

    if (!raw) {
        return DEFAULT_TIEMPO_DESMONTAJE_PROMEDIO_MINUTOS;
    }

    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error("TIEMPO_DESMONTAJE_PROMEDIO_MINUTOS debe ser un número mayor a 0.");
    }

    return parsed;
}
