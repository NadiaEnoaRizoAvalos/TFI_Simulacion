import { CategoriaMaterial, ParametrosEntrada } from "../1_dominio/frontera";
import { Sector } from "../1_dominio/sector";
import { Impresora, TipoImpresora } from "../1_dominio/impresora";
import { ColaImpresoras } from "./colas";
import { RelojSimulacion } from "./reloj";
import { Distribuciones } from "../2_estocastico/distribuciones";
import { GeneradorCongruencialMixto } from "../2_estocastico/generador";

export class MotorSimulacion {
    public sectores: Map<CategoriaMaterial, Sector> = new Map();
    public cola: ColaImpresoras = new ColaImpresoras();
    public reloj: RelojSimulacion = new RelojSimulacion();
    private distribuciones: Distribuciones;
    public parametros: ParametrosEntrada;
    public impresorasProcesadas: number = 0;

    constructor(parametros: ParametrosEntrada) {
        this.parametros = parametros;
        this.distribuciones = new Distribuciones(new GeneradorCongruencialMixto(12345));
        this.inicializarSectores(parametros.capacidadTotalM3);
        this.cargarLote(parametros.cantidadImpresoras);
    }

    private inicializarSectores(capacidadTotal: number): void {
        this.sectores.set(CategoriaMaterial.Plastico, new Sector(CategoriaMaterial.Plastico, capacidadTotal * 0.40));
        this.sectores.set(CategoriaMaterial.MetalesFerrosos, new Sector(CategoriaMaterial.MetalesFerrosos, capacidadTotal * 0.25));
        this.sectores.set(CategoriaMaterial.MetalesNoFerrosos, new Sector(CategoriaMaterial.MetalesNoFerrosos, capacidadTotal * 0.15));
        this.sectores.set(CategoriaMaterial.PCB, new Sector(CategoriaMaterial.PCB, capacidadTotal * 0.10));
        this.sectores.set(CategoriaMaterial.Cables, new Sector(CategoriaMaterial.Cables, capacidadTotal * 0.10));
    }

    private cargarLote(cantidad: number): void {
        for (let i = 0; i < cantidad; i++) {
            this.cola.encolar({
                id: `IMP-${i}`,
                tipo: this.distribuciones.binomial(1, 0.85) === 1 ? TipoImpresora.Oficina : TipoImpresora.Escritorio
            });
        }
    }

    public procesarSiguienteEquipo(): void {
        const impresora = this.cola.desencolar();
        if (!impresora) return;

        // [ETIQUETA: DISTRIBUCIÓN NORMAL] Se utiliza la entrada tiempoDesmontajePromedio como media
        const tiempoDesmontaje = Math.max(1, this.distribuciones.normal(this.parametros.tiempoDesmontajePromedio, 3));
        this.reloj.avanzar(tiempoDesmontaje);

        // Volúmenes generados por esta unidad (m3)
        const volPlastico = Math.max(0, this.distribuciones.normal(impresora.tipo === TipoImpresora.Oficina ? 0.012 : 0.009, 0.0015));
        const volFerrosos = this.distribuciones.uniforme(0.0015, 0.003);
        const volNoFerrosos = this.distribuciones.uniforme(0.001, 0.002);
        const volPcb = this.distribuciones.uniforme(0.0005, 0.001);
        const volCables = this.distribuciones.uniforme(0.001, 0.002);

        this.sectores.get(CategoriaMaterial.Plastico)!.agregarVolumen(volPlastico);
        this.sectores.get(CategoriaMaterial.MetalesFerrosos)!.agregarVolumen(volFerrosos);
        this.sectores.get(CategoriaMaterial.MetalesNoFerrosos)!.agregarVolumen(volNoFerrosos);
        this.sectores.get(CategoriaMaterial.PCB)!.agregarVolumen(volPcb);
        this.sectores.get(CategoriaMaterial.Cables)!.agregarVolumen(volCables);

        this.impresorasProcesadas++;
    }
    public ejecutarSimulacionCompleta(): void {
        // Mientras haya impresoras en la cola, desármalas una por una
        while (!this.cola.estaVacia()) {
            this.procesarSiguienteEquipo();
        }
    }
}