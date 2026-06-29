import { EstadoSimulador, CategoriaMaterial } from "../1_dominio/frontera";
import { MotorSimulacion } from "../3_logica_central/motor";

export class MapeadorEstado {
    public static generarOutputFinal(motor: MotorSimulacion): EstadoSimulador {
        const capacidadMaximaPorSector  = {} as Record<CategoriaMaterial, number>;
        const porcentajeOcupacionPorSector = {} as Record<CategoriaMaterial, number>;
        const capacidadDisponiblePorSector = {} as Record<CategoriaMaterial, number>;
        const alertaSecciones: string[] = [];
        const advertenciaSecciones: string[] = [];

        let volumenOcupado = 0;

        motor.sectores.forEach((sector, categoria) => {
            capacidadMaximaPorSector[categoria]     = sector.capacidadMaxima;
            porcentajeOcupacionPorSector[categoria] = sector.getPorcentajeOcupacion();
            capacidadDisponiblePorSector[categoria] = sector.getCapacidadDisponible();
            volumenOcupado += sector.volumenAcumulado;

            const pct = sector.getPorcentajeOcupacion();
            if (pct >= 100) alertaSecciones.push(categoria);
            else if (pct >= 85) advertenciaSecciones.push(categoria);
        });

        // [CAMBIO 4 - Reporte final: todos los campos calculados en el back]
        const porcentajeOcupacionTotal = motor.parametros.capacidadTotalM3 > 0
            ? (volumenOcupado / motor.parametros.capacidadTotalM3) * 100
            : 0;

        const coeficienteExtraordinario = motor.getCoeficienteExtraordinario();
        const superaUmbral              = motor.getSuperaUmbral();

        return {
            tiempoTotalDesarmado:      motor.reloj.getTiempo() / 60, // en horas
            diasEstimados:             motor.diasTrabajados,
            capacidadMaximaPorSector,
            porcentajeOcupacionPorSector,
            porcentajeOcupacionTotal,
            capacidadDisponiblePorSector,
            retirosNormales:           motor.retirosNormales,
            retirosExtraordinarios:    motor.retirosExtraordinarios,
            coeficienteExtraordinario,
            superaUmbral,
            alertaGalpon:              porcentajeOcupacionTotal >= 100,
            advertenciaGeneral:        porcentajeOcupacionTotal >= 85 && porcentajeOcupacionTotal < 100,
            alertaSecciones,
            advertenciaSecciones,
        };
    }
}
