export class GeneradorCongruencialMixto {
    private semilla: number;
    private readonly a: number;
    private readonly c: number;
    private readonly m: number;

    constructor(semillaInicial: number = 12345) {
        this.semilla = semillaInicial;
        this.m = Math.pow(2, 32); 
        this.c = 1013904223;
        this.a = 1664525; 
    }

    public generarU(): number {
        this.semilla = (this.a * this.semilla + this.c) % this.m;
        return this.semilla / this.m; 
    }
}