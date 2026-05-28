"use client";
import { useState } from "react";
import SimuladorForm from "./simuladorForm";
import SimulacionLoading from "./simulacionLoading";
import Resultados from "./resultados";

type Vista = "form" | "loading" | "resultados";

export interface SimulacionParams {
  cantidadImpresoras: number;
  capacidadTotalM3: number;
  tiempoDesmontajePromedio: number;
}

export default function Simulador() {
  const [vista, setVista] = useState<Vista>("form");
  const [params, setParams] = useState<SimulacionParams | null>(null);
  const [resultados, setResultados] = useState<unknown>(null);

  const handleSubmit = async (data: Record<string, number>) => {
    const payload: SimulacionParams = {
      cantidadImpresoras: data.cantidadImpresoras,
      capacidadTotalM3: data.espacioGalpon,
      tiempoDesmontajePromedio: data.tiempoDesmontaje,
    };
    setParams(payload);
    setVista("loading");

    try {
      const res = await fetch("/api/simulacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error("Error del servidor:", res.status, errBody);
        setVista("form");
        alert(`Error del servidor (${res.status}). Revisá la consola para más detalles.`);
        return;
      }

      const json = await res.json();
      setResultados(json);
      setVista("resultados");
    } catch (err) {
      console.error("Error al conectar con el servidor:", err);
      setVista("form");
      alert("Error al conectar con el servidor. Revisá la consola para más detalles.");
    }
  };

  const handleReset = () => { setVista("form"); setResultados(null); };

  if (vista === "loading" && params) return <SimulacionLoading params={params} />;
  if (vista === "resultados") return <Resultados resultados={resultados} onReset={handleReset} />;
  return <SimuladorForm onSubmit={handleSubmit} />;
}
