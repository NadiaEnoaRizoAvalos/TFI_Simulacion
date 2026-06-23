import { NextResponse } from "next/server";
import { MotorSimulacion } from "@/lib/3_logica_central/motor";
import { MapeadorEstado } from "@/lib/5_integracion/mapeadores";
import { validateSimulacionInput } from "@/lib/5_integracion/simulacionValidacion";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "El JSON enviado no es válido.",
        fieldErrors: {},
      },
      { status: 400 },
    );
  }

  const validation = validateSimulacionInput(body as Record<string, unknown>);

  if (!validation.ok || !validation.data) {
    return NextResponse.json(
      {
        error: "Revisá los campos del formulario.",
        fieldErrors: validation.fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const motor = new MotorSimulacion(validation.data);
    motor.ejecutarSimulacionCompleta();

    const resultadosFinales = MapeadorEstado.generarOutputFinal(motor);

    return NextResponse.json(
      {
        mensaje: "Simulación estocástica completada con éxito",
        parametrosRecibidos: validation.data,
        resultados: resultadosFinales,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error al ejecutar la simulación:", error);
    return NextResponse.json(
      { error: "Ocurrió un error interno en el servidor al procesar la simulación." },
      { status: 500 },
    );
  }
}
