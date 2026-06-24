"use client";
import dynamic from "next/dynamic";

const VistaDeposito3D = dynamic(() => import("./vistaSimulador"), {
  ssr: false, // no renderizar en servidor
  loading: () => (
    <span className="text-green-300 text-sm">Cargando vista 3D...</span>
  ),
});
interface Resultados {
  volumenPorUnidad: Record<string, number>;
  capacidadTotalDeposito: number;
  tiempoTotalDesarmado: number;
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
  Plástico: "bg-green-500",
  "Metales Ferrosos": "bg-blue-500",
  "Metales No Ferrosos": "bg-cyan-500",
  "Placas Electrónicas": "bg-purple-500",
  Cables: "bg-yellow-500",
};

function BarraProgreso({
  label,
  porcentaje,
  color,
  advertencia,
}: {
  label: string;
  porcentaje: number;
  color: string;
  advertencia?: boolean;
}) {
  const lleno = Math.min(porcentaje, 100);
  const excede = porcentaje > 100;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm text-green-800 font-medium">
        <span>{label}</span>
        <span className={excede ? "text-red-500 font-bold" : ""}>
          {porcentaje.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-green-100 rounded-full h-4 overflow-hidden">
        <div
          className={`h-4 rounded-full transition-all duration-500 ${excede ? "bg-red-500" : color}`}
          style={{ width: `${lleno}%` }}
        />
      </div>
      {excede && (
        <span className="text-red-500 text-xs font-bold">⚠ Capacidad superada</span>
      )}
      {advertencia && !excede && (
        <div className="flex flex-col mt-1">
          <span className="text-orange-500 text-xs font-bold">[ESTA POR LLEGAR A SU LIMITE]</span>
          <div className="h-0.5 bg-orange-500 w-full mt-0.5" />
        </div>
      )}
    </div>
  );
}

export default function Resultados({
  resultados: raw,
  retirosPorSemana,
  onReset,
}: {
  resultados: unknown;
  retirosPorSemana: number;
  onReset: () => void;
}) {
  const data = raw as RespuestaAPI;
  const r = data.resultados;

  // Cálculo de retiros: por cada sector, contar cuántos retiros hacen falta para bajar del umbral 85%
  // y calcular el volumen/porcentaje resultante post-retiro
  let retiro = 0;
  const porcentajePostRetiro: Record<string, number> = {};

  Object.entries(r.porcentajeOcupacionPorSector).forEach(([sector, pct]) => {
    const capacidad = r.capacidadMaximaPorSector[sector];
    const volumenRetiro = capacidad * 0.85;
    let volumenActual = r.cantidadMaterialAcumuladoPorTipo[sector];
    if (pct > 85) {
      while (volumenActual > capacidad * 0.85) {
        volumenActual -= volumenRetiro;
        retiro++;
      }
    }
    porcentajePostRetiro[sector] = capacidad > 0 ? (volumenActual / capacidad) * 100 : 0;
  });

  const diasEstimados = Math.ceil((data.parametrosRecibidos.cantidadImpresoras ?? 0) / 36);
  const semanasDetrabajo = Math.floor(diasEstimados / 5);
  const capacidadRetirosNormales = retirosPorSemana * semanasDetrabajo;

  const retirosNormales = Math.min(retiro, capacidadRetirosNormales);
  const retirosExtraordinarios = Math.max(0, retiro - capacidadRetirosNormales);
  const retirosTotal = retirosNormales + retirosExtraordinarios;
  const coeficienteExtraordinario = retirosTotal > 0 ? retirosExtraordinarios / retirosTotal : 0;
  const superaUmbral = coeficienteExtraordinario > 0.3;

  const porcentajeOcupacionTotalPostRetiro = Object.entries(porcentajePostRetiro).reduce(
    (acc, [sector, pct]) => acc + (pct / 100) * r.capacidadMaximaPorSector[sector],
    0
  ) / r.capacidadTotalDeposito * 100;

  const capacidadDisponiblePostRetiro: Record<string, number> = {};
  Object.entries(porcentajePostRetiro).forEach(([sector, pct]) => {
    const capacidad = r.capacidadMaximaPorSector[sector];
    capacidadDisponiblePostRetiro[sector] = capacidad - (pct / 100) * capacidad;
  });

  const alertaGalpon = porcentajeOcupacionTotalPostRetiro >= 100;
  const advertenciaGeneral = porcentajeOcupacionTotalPostRetiro >= 85 && porcentajeOcupacionTotalPostRetiro < 100;
  const ocupacionTotal = Math.min(porcentajeOcupacionTotalPostRetiro, 100);
  const totalExcede = porcentajeOcupacionTotalPostRetiro >= 100;

  const alertaSecciones: string[] = [];
  const advertenciaSecciones: string[] = [];
  Object.entries(porcentajePostRetiro).forEach(([sector, pct]) => {
    if (pct >= 100) alertaSecciones.push(sector);
    else if (pct >= 85) advertenciaSecciones.push(sector);
  });

  return (
    <div className="flex-1 flex flex-col font-sans py-6 px-6 gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-extrabold text-green-800 tracking-tight">
          Resultados de la simulación
        </h2>
      </div>

      {/* Layout principal */}
      <div className="flex-1 flex flex-col md:flex-row gap-6">
        {/* Panel datos */}
        <div className="w-full md:w-2/5 flex flex-col gap-4 bg-white rounded-2xl shadow border border-green-100 px-6 py-6 overflow-y-auto">
          <div className="flex flex-col items-center">
            <h3 className="text-green-800 font-extrabold text-lg tracking-tight">
              Datos
            </h3>
            <div className="w-8 h-1 bg-green-400 rounded-full mt-1 mb-2" />
          </div>

          {/* Ocupación total */}
          <div className="flex flex-col gap-1">
            <span className="text-green-800 font-bold text-sm">
              Ocupación total del depósito
            </span>
            <div className="w-full bg-green-100 rounded-full h-4 overflow-hidden">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${totalExcede ? "bg-red-500" : "bg-green-600"}`}
                style={{ width: `${ocupacionTotal}%` }}
              />
            </div>
            <span
              className={`text-xs font-semibold ${totalExcede ? "text-red-500" : "text-green-700"}`}
            >
              {porcentajeOcupacionTotalPostRetiro.toFixed(2)}% utilizado
              {totalExcede && " — Capacidad superada"}
            </span>
            {advertenciaGeneral && (
              <div className="flex flex-col mt-1">
                <span className="text-orange-500 text-xs font-bold">[ESTA POR LLEGAR A SU LIMITE]</span>
                <div className="h-0.5 bg-orange-500 w-full mt-0.5" />
              </div>
            )}
          </div>

          {/* Tiempo Total Desarmado */}
          {r.tiempoTotalDesarmado !== undefined && (
            <div className="flex flex-col gap-1 mt-2 mb-2">
              <span className="text-green-800 font-bold text-sm">
                Tiempo empleado en desarmado
              </span>
              <div className="flex justify-between text-xs bg-green-50 rounded-lg px-3 py-1.5 border border-green-100">
                <span className="text-green-700">Total simulado</span>
                <span className="font-bold text-green-900">
                  {r.tiempoTotalDesarmado.toFixed(2)} minutos
                </span>
              </div>
              <div className="flex justify-between text-xs bg-green-50 rounded-lg px-3 py-1.5 border border-green-100">
                <span className="text-green-700">Días estimados</span>
                <span className="font-bold text-green-900">
                  {diasEstimados} días
                </span>
              </div>
            </div>
          )}

          {/* Ocupación por sector */}
          <div className="flex flex-col gap-3">
            <span className="text-green-800 font-bold text-sm">
              Ocupación por sector
            </span>
            {Object.entries(r.porcentajeOcupacionPorSector).map(
              ([sector, pct]) => (
                <BarraProgreso
                  key={sector}
                  label={sector}
                  porcentaje={porcentajePostRetiro[sector] ?? pct}
                  color={COLORES[sector] ?? "bg-green-400"}
                  advertencia={advertenciaSecciones.includes(sector)}
                />
              ),
            )}
          </div>

          {/* Retiros */}
          <div className="flex flex-col gap-2">
            <span className="text-green-800 font-bold text-sm">Retiros semanales</span>
            <div className="flex justify-between text-xs bg-green-50 rounded-lg px-3 py-1.5 border border-green-100">
              <span className="text-green-700">Retiros normales</span>
              <span className="font-bold text-green-900">{retirosNormales}</span>
            </div>
            <div className="flex justify-between text-xs bg-green-50 rounded-lg px-3 py-1.5 border border-green-100">
              <span className="text-green-700">Retiros extraordinarios</span>
              <span className="font-bold text-green-900">{retirosExtraordinarios}</span>
            </div>
            <div className="flex justify-between text-xs bg-green-50 rounded-lg px-3 py-1.5 border border-green-100">
              <span className="text-green-700">Coeficiente extraordinario</span>
              <span className={`font-bold ${superaUmbral ? "text-red-600" : "text-green-900"}`}>
                {(coeficienteExtraordinario * 100).toFixed(1)}%
              </span>
            </div>
            {superaUmbral && (
              <div className="mt-1 rounded-lg border border-red-300 bg-red-50 px-3 py-2">
                <span className="text-red-600 text-xs font-bold">
                  Se debe aumentar el tamaño del galpón para poder cumplir con el umbral de retiros extraordinarios
                </span>
              </div>
            )}
          </div>

          {/* Capacidad disponible */}
          <div className="flex flex-col gap-2">
            <span className="text-green-800 font-bold text-sm">
              Capacidad disponible (m³)
            </span>
            {Object.entries(capacidadDisponiblePostRetiro).map(
              ([sector, val]) => (
                <div
                  key={sector}
                  className="flex justify-between text-xs bg-green-50 rounded-lg px-3 py-1.5 border border-green-100"
                >
                  <span className="text-green-700">{sector}</span>
                  <span className="font-bold text-green-900">
                    {val.toFixed(4)}
                  </span>
                </div>
              ),
            )}
          </div>

          <button
            onClick={onReset}
            className="mt-auto bg-green-600 hover:bg-green-700 active:scale-95 text-white font-semibold px-6 py-2 rounded-full shadow-md transition-all duration-200 text-sm"
          >
            Nueva simulación
          </button>
        </div>

        {/* Panel gráfica */}
        <div className="w-full md:flex-1 h-80 md:h-auto bg-white rounded-2xl shadow border border-green-100 overflow-hidden">
          <VistaDeposito3D
            sectores={porcentajePostRetiro}
            capacidadMaxima={r.capacidadMaximaPorSector}
            alertaGalpon={alertaGalpon}
            alertaSecciones={alertaSecciones}
          />
        </div>
      </div>
    </div>
  );
}
