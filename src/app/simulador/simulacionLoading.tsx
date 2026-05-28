import { SimulacionParams } from "./page";

export default function SimulacionLoading({ params }: { params: SimulacionParams }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 font-sans">
      <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      <p className="text-green-800 font-semibold text-lg">Ejecutando simulación...</p>
      <div className="bg-white rounded-xl border border-green-100 shadow px-8 py-4 text-sm text-green-700 flex flex-col gap-1">
        <span>🖨️ Impresoras: <strong>{params.cantidadImpresoras}</strong></span>
        <span>🏭 Espacio: <strong>{params.capacidadTotalM3} m³</strong></span>
        <span>⏱️ Tiempo desmontaje: <strong>{params.tiempoDesmontajePromedio}</strong></span>
      </div>
    </div>
  );
}
