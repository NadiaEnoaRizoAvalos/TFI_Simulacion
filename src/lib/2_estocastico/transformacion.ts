import { GeneradorCongruencialMixto } from "./generador";

/**
 * Implementación del Método de la Transformación Inversa[cite: 2].
 * Basado en la formulación $x = a + (b - a) \cdot u$ para distribución uniforme continua[cite: 2].
 */
export class TransformacionInversa {
    private generador: GeneradorCongruencialMixto;

    constructor(generador: GeneradorCongruencialMixto) {
        this.generador = generador;
    }

    public uniforme(a: number, b: number): number {
        const u = this.generador.generarU();
        return a + (b - a) * u;
    }

    public exponencial(lambda: number): number {
        const u = this.generador.generarU();
        return -(1 / lambda) * Math.log(1 - u);
    }
}