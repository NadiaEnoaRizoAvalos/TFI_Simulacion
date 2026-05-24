import { EstadoSimulador, CategoriaMaterial } from "../1_dominio/frontera";
import { MotorSimulacion } from "../3_logica_central/motor";
import { Estadisticas } from "../4_resultado/estadisticas";

export class MapeadorEstado {
    public static generarOutputFinal(motor: MotorSimulacion): EstadoSimulador {
        const metricasTotales = Estadisticas.calcularOcupacionTotal(motor);
        const m3PorUnidad = Estadisticas.calcularM3PorUnidad(motor);
        
        const capacidadMaximaPorSector = {} as Record<CategoriaMaterial, number>;
        const porcentajeOcupacionPorSector = {} as Record<CategoriaMaterial, number>;
        const capacidadDisponiblePorSector = {} as Record<CategoriaMaterial, number>;
        const cantidadMaterialAcumuladoPorTipo = {} as Record<CategoriaMaterial, number>;

        motor.sectores.forEach((sector, categoria) => {
            capacidadMaximaPorSector[categoria] = sector.capacidadMaxima;
            porcentajeOcupacionPorSector[categoria] = sector.getPorcentajeOcupacion();
            capacidadDisponiblePorSector[categoria] = sector.getCapacidadDisponible();
            cantidadMaterialAcumuladoPorTipo[categoria] = sector.volumenAcumulado;
        });

        return {
            volumenPorUnidad: m3PorUnidad,
            capacidadTotalDeposito: motor.parametros.capacidadTotalM3,
            capacidadMaximaPorSector: capacidadMaximaPorSector,
            porcentajeOcupacionPorSector: porcentajeOcupacionPorSector,
            porcentajeOcupacionTotal: metricasTotales.porcentaje,
            capacidadDisponiblePorSector: capacidadDisponiblePorSector,
            cantidadMaterialAcumuladoPorTipo: cantidadMaterialAcumuladoPorTipo
        };
    }
}