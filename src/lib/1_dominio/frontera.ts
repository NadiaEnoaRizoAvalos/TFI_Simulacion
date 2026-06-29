export interface ParametrosEntrada {
    cantidadImpresoras: number;
    capacidadTotalM3: number;
    retirosPorSemana: number;
}

export enum CategoriaMaterial {
    Plastico = "Plástico",
    MetalesFerrosos = "Metales Ferrosos",
    MetalesNoFerrosos = "Metales No Ferrosos",
    PCB = "Placas Electrónicas",
    Cables = "Cables"
}

export interface EstadoSimulador {
    tiempoTotalDesarmado: number;
    diasEstimados: number;
    capacidadMaximaPorSector: Record<CategoriaMaterial, number>;
    porcentajeOcupacionPorSector: Record<CategoriaMaterial, number>;
    porcentajeOcupacionTotal: number;
    capacidadDisponiblePorSector: Record<CategoriaMaterial, number>;
    retirosNormales: number;
    retirosExtraordinarios: number;
    coeficienteExtraordinario: number;
    superaUmbral: boolean;
    alertaGalpon: boolean;
    advertenciaGeneral: boolean;
    alertaSecciones: string[];
    advertenciaSecciones: string[];
}
