import { CategoriaMaterial, ParametrosEntrada } from "../1_dominio/frontera";
import { Sector } from "../1_dominio/sector";
import { TipoImpresora } from "../1_dominio/impresora";
import { ColaImpresoras } from "./colas";
import { RelojSimulacion } from "./reloj";
import { Distribuciones } from "../2_estocastico/distribuciones";
import { GeneradorCongruencialMixto } from "../2_estocastico/generador";

const IMPRESORAS_POR_DIA = 36;
const DIAS_POR_SEMANA = 5;
const UMBRAL_RETIRO = 0.85;
const UMBRAL_EXTRAORDINARIO = 0.30;

export class MotorSimulacion {
    public sectores: Map<CategoriaMaterial, Sector> = new Map();
    public cola: ColaImpresoras = new ColaImpresoras();
    public reloj: RelojSimulacion = new RelojSimulacion();
    private distribuciones: Distribuciones;
    public parametros: ParametrosEntrada;
    public impresorasProcesadas: number = 0;

    // [CAMBIO 1 - Días trabajados]
    public diasTrabajados: number = 0;

    // [CAMBIO 3 - Contadores de retiros]
    public retirosNormales: number = 0;
    public retirosExtraordinarios: number = 0;
    private retirosNormalesUsadosEnSemana: number = 0;
    private diaEnSemanaActual: number = 0;

    constructor(parametros: ParametrosEntrada) {
        this.parametros = parametros;
        this.distribuciones = new Distribuciones(new GeneradorCongruencialMixto(12345));
        this.inicializarSectores(parametros.capacidadTotalM3);
    }

    private inicializarSectores(capacidadTotal: number): void {
        this.sectores.set(CategoriaMaterial.Plastico,          new Sector(CategoriaMaterial.Plastico,          capacidadTotal * 0.40));
        this.sectores.set(CategoriaMaterial.MetalesFerrosos,   new Sector(CategoriaMaterial.MetalesFerrosos,   capacidadTotal * 0.25));
        this.sectores.set(CategoriaMaterial.MetalesNoFerrosos, new Sector(CategoriaMaterial.MetalesNoFerrosos, capacidadTotal * 0.15));
        this.sectores.set(CategoriaMaterial.PCB,               new Sector(CategoriaMaterial.PCB,               capacidadTotal * 0.10));
        this.sectores.set(CategoriaMaterial.Cables,            new Sector(CategoriaMaterial.Cables,            capacidadTotal * 0.10));
    }

    // [CAMBIO 1 - Carga diaria de hasta 36 impresoras]
    private cargarJornada(impresorasYaGeneradas: number): number {
        const restantes = this.parametros.cantidadImpresoras - impresorasYaGeneradas;
        const aGenerar = Math.min(Math.max(1, this.distribuciones.poisson(IMPRESORAS_POR_DIA)), restantes);
        for (let i = 0; i < aGenerar; i++) {
            const id = `IMP-${impresorasYaGeneradas + i}`;
            const tipo = this.distribuciones.binomial(1, 0.85) === 1
                ? TipoImpresora.Oficina
                : TipoImpresora.Escritorio;
            this.cola.encolar({ id, tipo });
        }
        return aGenerar;
    }

    public procesarSiguienteEquipo(): void {
        const impresora = this.cola.desencolar();
        if (!impresora) return;

        // [CAMBIO 2 - Tiempo de desarme Uniforme según tipo]
        const tiempoDesmontaje = impresora.tipo === TipoImpresora.Oficina
            ? this.distribuciones.uniforme(6, 10)
            : this.distribuciones.uniforme(3, 5);
        this.reloj.avanzar(tiempoDesmontaje);

        const volPlastico   = Math.max(0, this.distribuciones.normal(impresora.tipo === TipoImpresora.Oficina ? 0.012 : 0.009, 0.0015));
        const volFerrosos   = this.distribuciones.uniforme(0.0015, 0.003);
        const volNoFerrosos = this.distribuciones.uniforme(0.001,  0.002);
        const volPcb        = this.distribuciones.uniforme(0.0005, 0.001);
        const volCables     = this.distribuciones.uniforme(0.001,  0.002);

        this.sectores.get(CategoriaMaterial.Plastico)!.agregarVolumen(volPlastico);
        this.sectores.get(CategoriaMaterial.MetalesFerrosos)!.agregarVolumen(volFerrosos);
        this.sectores.get(CategoriaMaterial.MetalesNoFerrosos)!.agregarVolumen(volNoFerrosos);
        this.sectores.get(CategoriaMaterial.PCB)!.agregarVolumen(volPcb);
        this.sectores.get(CategoriaMaterial.Cables)!.agregarVolumen(volCables);

        this.impresorasProcesadas++;

        // [CAMBIO 3 - Verificar umbral 85% por sector tras cada unidad procesada]
        this.sectores.forEach((sector) => {
            if (sector.getPorcentajeOcupacion() >= UMBRAL_RETIRO * 100) {
                sector.volumenAcumulado = 0;
                if (this.retirosNormalesUsadosEnSemana < this.parametros.retirosPorSemana) {
                    this.retirosNormales++;
                    this.retirosNormalesUsadosEnSemana++;
                } else {
                    this.retirosExtraordinarios++;
                }
            }
        });
    }

public ejecutarSimulacionCompleta(): void {
        let impresorasGeneradas = 0;

        // [CAMBIO 1 - Bucle día a día]
        while (impresorasGeneradas < this.parametros.cantidadImpresoras) {
            impresorasGeneradas += this.cargarJornada(impresorasGeneradas);
            this.diasTrabajados++;
            this.diaEnSemanaActual++;

            while (!this.cola.estaVacia()) {
                this.procesarSiguienteEquipo();
            }

            // [CAMBIO 3 - Resetear cupo semanal cada 5 días]
            if (this.diaEnSemanaActual >= DIAS_POR_SEMANA) {
                this.retirosNormalesUsadosEnSemana = 0;
                this.diaEnSemanaActual = 0;
            }
        }
    }

    // [CAMBIO 4 - Reporte: coeficiente y recomendación]
    public getCoeficienteExtraordinario(): number {
        const total = this.retirosNormales + this.retirosExtraordinarios;
        return total > 0 ? this.retirosExtraordinarios / total : 0;
    }

    public getSuperaUmbral(): boolean {
        return this.getCoeficienteExtraordinario() > UMBRAL_EXTRAORDINARIO;
    }
}
