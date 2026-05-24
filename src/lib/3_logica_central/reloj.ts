export class RelojSimulacion {
    private tiempoMinutos: number = 0;

    public avanzar(minutos: number): void {
        this.tiempoMinutos += minutos;
    }

    public getTiempo(): number {
        return this.tiempoMinutos;
    }
}