export interface ParametrosEntrada {
    cantidadImpresoras: number;
    capacidadTotalM3: number;
    tiempoDesmontajePromedio: number; // min/unidad
}

export enum CategoriaMaterial {
    Plastico = "Plástico",
    MetalesFerrosos = "Metales Ferrosos",
    MetalesNoFerrosos = "Metales No Ferrosos",
    PCB = "Placas Electrónicas",
    Cables = "Cables"
}

export interface EstadoSimulador {
    volumenPorUnidad: Record<CategoriaMaterial, number>;
    capacidadTotalDeposito: number;
    capacidadMaximaPorSector: Record<CategoriaMaterial, number>;
    porcentajeOcupacionPorSector: Record<CategoriaMaterial, number>;
    porcentajeOcupacionTotal: number;
    capacidadDisponiblePorSector: Record<CategoriaMaterial, number>;
    cantidadMaterialAcumuladoPorTipo: Record<CategoriaMaterial, number>;
}