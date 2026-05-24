import { CategoriaMaterial } from "./frontera";

export class Sector {
    public readonly categoria: CategoriaMaterial;
    public readonly capacidadMaxima: number;
    public volumenAcumulado: number = 0;

    constructor(categoria: CategoriaMaterial, capacidadMaxima: number) {
        this.categoria = categoria;
        this.capacidadMaxima = capacidadMaxima;
    }

    public agregarVolumen(volumen: number): void {
        this.volumenAcumulado += volumen;
    }

    public getCapacidadDisponible(): number {
        return this.capacidadMaxima - this.volumenAcumulado;
    }

    public getPorcentajeOcupacion(): number {
        if (this.capacidadMaxima === 0) return 0;
        return (this.volumenAcumulado / this.capacidadMaxima) * 100;
    }
}