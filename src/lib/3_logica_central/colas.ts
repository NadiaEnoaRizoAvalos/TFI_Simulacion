import { Impresora } from "../1_dominio/impresora";

export class ColaImpresoras {
    private elementos: Impresora[] = [];

    public encolar(item: Impresora): void {
        this.elementos.push(item);
    }

    public desencolar(): Impresora | undefined {
        return this.elementos.shift();
    }

    public longitud(): number {
        return this.elementos.length;
    }

    public estaVacia(): boolean {
        return this.elementos.length === 0;
    }
}