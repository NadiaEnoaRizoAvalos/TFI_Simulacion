import { NextResponse } from 'next/server';
// Asegúrate de que estas rutas coincidan con la estructura de tus carpetas
import { MotorSimulacion } from '@/lib/3_logica_central/motor'; 
import { MapeadorEstado } from '@/lib/5_integracion/mapeadores';

// 1. TIPADO: Definimos exactamente qué "frutas" aceptamos en la licuadora
interface PeticionSimulacion {
    cantidadImpresoras: number;
    capacidadTotalM3: number;
    tiempoDesmontajePromedio: number;
}

export async function POST(request: Request) {
    // Envolvemos todo en un try/catch para evitar que el servidor se rompa si hay errores
    try {
        // 1. ACÁ ENTRAN LOS DATOS (Recibimos la fruta)
        const body: PeticionSimulacion = await request.json();
        
        // Extraemos las variables validando que existan
        const { cantidadImpresoras, capacidadTotalM3, tiempoDesmontajePromedio } = body;

        // Pequeña validación de seguridad
        if (!cantidadImpresoras || !capacidadTotalM3) {
            return NextResponse.json(
                { error: "Faltan parámetros obligatorios (cantidadImpresoras o capacidadTotalM3)" }, 
                { status: 400 } // Error 400: Bad Request
            );
        }

        // 2. ACÁ PROCESAMOS (La licuadora real)
        // Instanciamos el motor con los datos que mandó el usuario
        const motor = new MotorSimulacion({
            cantidadImpresoras,
            capacidadTotalM3,
            tiempoDesmontajePromedio: tiempoDesmontajePromedio || 25 // Valor por defecto si no lo envían
        });

        // ¡Le damos Play a la simulación! (El paso que te faltaba antes)
        motor.ejecutarSimulacionCompleta();

        // Sacamos la "foto" final de las estadísticas
        const resultadosFinales = MapeadorEstado.generarOutputFinal(motor);

        // 3. ACÁ APARECEN LOS RESULTADOS (Servimos el licuado)
        return NextResponse.json({
            mensaje: "Simulación estocástica completada con éxito",
            parametrosRecibidos: body,
            resultados: resultadosFinales
        }, { status: 200 });

    } catch (error) {
        // Si algo falla en el código, cae acá y responde con un error prolijo
        console.error("Error al ejecutar la simulación:", error);
        return NextResponse.json(
            { error: "Ocurrió un error interno en el servidor al procesar la simulación." },
            { status: 500 } // Error 500: Internal Server Error
        );
    }
}