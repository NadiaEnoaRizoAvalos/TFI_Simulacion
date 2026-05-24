import { GeneradorCongruencialMixto } from "./generador";

export class Distribuciones {
    private generador: GeneradorCongruencialMixto;

    constructor(generador: GeneradorCongruencialMixto) {
        this.generador = generador;
    }

    // [DISTRIBUCIÓN UNIFORME CONTINUA]
    public uniforme(a: number, b: number): number {
        const u = this.generador.generarU();
        return a + (b - a) * u;
    }

    // [DISTRIBUCIÓN EXPONENCIAL]
    public exponencial(lambda: number): number {
        const u = this.generador.generarU();
        return -Math.log(1 - u) / lambda; 
    }

    // [DISTRIBUCIÓN NORMAL]
    public normal(media: number, desvioEstandar: number): number {
        const u1 = this.generador.generarU();
        const u2 = this.generador.generarU();
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        return z0 * desvioEstandar + media;
    }

    // [DISTRIBUCIÓN DE POISSON]
    public poisson(lambda: number): number {
        const L = Math.exp(-lambda);
        let k = 0;
        let p = 1.0;
        do {
            k++;
            p *= this.generador.generarU();
        } while (p > L);
        return k - 1;
    }

    // [DISTRIBUCIÓN BINOMIAL]
    public binomial(n: number, p: number): number {
        let exitos = 0;
        for (let i = 0; i < n; i++) {
            if (this.generador.generarU() <= p) {
                exitos++;
            }
        }
        return exitos; 
    }
}