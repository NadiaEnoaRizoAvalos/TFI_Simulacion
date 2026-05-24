import { CategoriaMaterial } from "../1_dominio/frontera";
import { Sector } from "../1_dominio/sector";

export class GestorAlertas {
    private readonly LIMITE_CRITICO = 85.0; 

    public evaluarSector(sector: Sector): string | null {
        if (sector.categoria === CategoriaMaterial.Plastico || sector.categoria === CategoriaMaterial.MetalesFerrosos) {
            if (sector.getPorcentajeOcupacion() >= this.LIMITE_CRITICO) {
                return `ORDEN DE DESPACHO: Sector ${sector.categoria} superó el 85%.`;
            }
        }
        return null;
    }
}