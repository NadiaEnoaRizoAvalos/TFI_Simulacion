import { MotorSimulacion } from "../3_logica_central/motor";
import { CategoriaMaterial } from "../1_dominio/frontera";

export class Estadisticas {
    public static calcularM3PorUnidad(motor: MotorSimulacion): Record<CategoriaMaterial, number> {
        const resultado = {} as Record<CategoriaMaterial, number>;
        const procesadas = motor.impresorasProcesadas > 0 ? motor.impresorasProcesadas : 1;
        
        motor.sectores.forEach((sector, categoria) => {
            resultado[categoria] = sector.volumenAcumulado / procesadas;
        });
        
        return resultado;
    }

    public static calcularOcupacionTotal(motor: MotorSimulacion): { volumenOcupado: number, porcentaje: number } {
        let volumenOcupado = 0;
        
        motor.sectores.forEach(sector => {
            volumenOcupado += sector.volumenAcumulado;
        });

        return {
            volumenOcupado: volumenOcupado,
            porcentaje: motor.parametros.capacidadTotalM3 > 0 ? (volumenOcupado / motor.parametros.capacidadTotalM3) * 100 : 0
        };
    }
}