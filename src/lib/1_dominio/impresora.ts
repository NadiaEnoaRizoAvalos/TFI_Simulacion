export enum TipoImpresora {
    Escritorio,
    Oficina
}

export interface Impresora {
    id: string;
    tipo: TipoImpresora;
}