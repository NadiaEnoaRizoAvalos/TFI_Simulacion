

export default function Home() {
  return (
    <div className="flex-1 flex items-center justify-center font-sans">
      <div className="flex flex-col items-center text-center max-w-xl px-8 py-12 bg-white rounded-2xl shadow-lg border border-green-100">
        <span className="text-7xl mb-6">🌿</span>
        <h1 className="text-5xl font-extrabold text-green-800 mb-3 tracking-tight">Simulador</h1>
        <div className="w-16 h-1 bg-green-400 rounded-full mb-6" />
        <p className="text-green-700 text-base leading-relaxed mb-10">
          Bienvenido al simulador. Explorá escenarios, analizá resultados
          y tomá decisiones basadas en datos en tiempo real.
        </p>
        <a
          href="/simulador"
          className="bg-green-600 hover:bg-green-700 active:scale-95 text-white font-semibold text-lg px-10 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
        >
          Comenzar →
        </a>
      </div>
    </div>
  );
}
