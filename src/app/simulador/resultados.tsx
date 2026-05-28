"use client";

interface Resultados {
  volumenPorUnidad: Record<string, number>;
  capacidadTotalDeposito: number;
  capacidadMaximaPorSector: Record<string, number>;
  porcentajeOcupacionPorSector: Record<string, number>;
  porcentajeOcupacionTotal: number;
  capacidadDisponiblePorSector: Record<string, number>;
  cantidadMaterialAcumuladoPorTipo: Record<string, number>;
}

interface RespuestaAPI {
  mensaje: string;
  parametrosRecibidos: Record<string, number>;
  resultados: Resultados;
}

const COLORES: Record<string, string> = {
  "Plástico": "bg-green-500",
  "Metales Ferrosos": "bg-blue-500",
  "Metales No Ferrosos": "bg-cyan-500",
  "Placas Electrónicas": "bg-purple-500",
  "Cables": "bg-yellow-500",
};

function BarraProgreso({ label, porcentaje, color }: { label: string; porcentaje: number; color: string }) {
  const lleno = Math.min(porcentaje, 100);
  const excede = porcentaje > 100;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm text-green-800 font-medium">
        <span>{label}</span>
        <span className={excede ? "text-red-500 font-bold" : ""}>{porcentaje.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-green-100 rounded-full h-4 overflow-hidden">
        <div
          className={`h-4 rounded-full transition-all duration-500 ${excede ? "bg-red-500" : color}`}
          style={{ width: `${lleno}%` }}
        />
      </div>
      {excede && <span className="text-red-500 text-xs">⚠ Capacidad superada</span>}
    </div>
  );
}

export default function Resultados({ resultados: raw, onReset }: { resultados: unknown; onReset: () => void }) {
  const data = raw as RespuestaAPI;
  const r = data.resultados;
  const ocupacionTotal = Math.min(r.porcentajeOcupacionTotal, 100);
  const totalExcede = r.porcentajeOcupacionTotal > 100;

  return (
    <div className="flex-1 flex flex-col font-sans py-6 px-6 gap-4">

      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-extrabold text-green-800 tracking-tight">Resultados de la simulación</h2>
      </div>

      {/* Layout principal */}
      <div className="flex-1 flex gap-6">

        {/* Panel izquierdo — datos */}
        <div className="w-2/5 flex flex-col gap-4 bg-white rounded-2xl shadow border border-green-100 px-6 py-6 overflow-y-auto">
          <div className="flex flex-col items-center">
            <h3 className="text-green-800 font-extrabold text-lg tracking-tight">Datos</h3>
            <div className="w-8 h-1 bg-green-400 rounded-full mt-1 mb-2" />
          </div>

          {/* Ocupación total */}
          <div className="flex flex-col gap-1">
            <span className="text-green-800 font-bold text-sm">Ocupación total del depósito</span>
            <div className="w-full bg-green-100 rounded-full h-4 overflow-hidden">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${totalExcede ? "bg-red-500" : "bg-green-600"}`}
                style={{ width: `${ocupacionTotal}%` }}
              />
            </div>
            <span className={`text-xs font-semibold ${totalExcede ? "text-red-500" : "text-green-700"}`}>
              {r.porcentajeOcupacionTotal.toFixed(2)}% utilizado{totalExcede && " — ⚠ Capacidad superada"}
            </span>
          </div>

          {/* Ocupación por sector */}
          <div className="flex flex-col gap-3">
            <span className="text-green-800 font-bold text-sm">Ocupación por sector</span>
            {Object.entries(r.porcentajeOcupacionPorSector).map(([sector, pct]) => (
              <BarraProgreso key={sector} label={sector} porcentaje={pct} color={COLORES[sector] ?? "bg-green-400"} />
            ))}
          </div>

          {/* Capacidad disponible */}
          <div className="flex flex-col gap-2">
            <span className="text-green-800 font-bold text-sm">Capacidad disponible (m³)</span>
            {Object.entries(r.capacidadDisponiblePorSector).map(([sector, val]) => (
              <div key={sector} className="flex justify-between text-xs bg-green-50 rounded-lg px-3 py-1.5 border border-green-100">
                <span className="text-green-700">{sector}</span>
                <span className="font-bold text-green-900">{val.toFixed(4)}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onReset}
            className="mt-auto bg-green-600 hover:bg-green-700 active:scale-95 text-white font-semibold px-6 py-2 rounded-full shadow-md transition-all duration-200 text-sm"
          >
            Nueva simulación
          </button>
        </div>

        {/* Panel derecho — representación gráfica */}
        <div className="flex-1 bg-white rounded-2xl shadow border border-green-100 flex items-center justify-center">
          <span className="text-green-300 text-sm font-medium">Representación gráfica</span>
        </div>

      </div>
    </div>
  );
}
