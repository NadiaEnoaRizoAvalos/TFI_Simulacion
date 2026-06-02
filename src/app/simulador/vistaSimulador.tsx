"use client";
import { Suspense, useState } from "react";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Text, Box } from "@react-three/drei";
import * as THREE from "three";

const coloresCubos: Record<string, string> = {
  Plástico: "#10B981",
  "Metales Ferrosos": "#3B82F6",
  "Metales No Ferrosos": "#06B6D4",
  "Placas Electrónicas": "#8B5CF6",
  Cables: "#F59E0B",
};

const galponAncho = 10;
const galponAltura = 5;
const galponProfundidad = 8;

interface Props {
  sectores: Record<string, number>;
}

type GridCell = {
  x: number;
  z: number;
};

type MaterialLayout = {
  celdaInicial: number;
  ancho: number;
  profundidad: number;
};

type DragState = {
  material: string;
  celdaOrigen: number;
  posicionTemporal: [number, number, number];
};

type PointerCaptureTarget = EventTarget & {
  setPointerCapture?: (pointerId: number) => void;
  releasePointerCapture?: (pointerId: number) => void;
};

const COLUMNAS_GRILLA = [-3.6, -1.2, 1.2, 3.6];
const FILAS_GRILLA = [2.35, 0, -2.35];

const celdasGrilla: GridCell[] = FILAS_GRILLA.flatMap((z) =>
  COLUMNAS_GRILLA.map((x) => ({ x, z })),
);

const layoutMateriales: Record<
  string,
  MaterialLayout
> = {
  Plástico: {
    celdaInicial: 2,
    ancho: 1.85,
    profundidad: 1.2,
  },
  "Metales Ferrosos": {
    celdaInicial: 4,
    ancho: 1.85,
    profundidad: 1.2,
  },
  "Metales No Ferrosos": {
    celdaInicial: 7,
    ancho: 1.85,
    profundidad: 1.2,
  },
  "Placas Electrónicas": {
    celdaInicial: 0,
    ancho: 1.85,
    profundidad: 1.2,
  },
  Cables: {
    celdaInicial: 9,
    ancho: 1.85,
    profundidad: 1.2,
  },
};

const planoArrastre = new THREE.Plane(new THREE.Vector3(0, 1, 0), galponAltura / 2);
const pisoY = -galponAltura / 2;
const limiteX = galponAncho / 2 - 0.7;
const limiteZ = galponProfundidad / 2 - 0.7;

function getPosicionPorCelda(celda: number): [number, number, number] {
  const centro = celdasGrilla[celda] ?? { x: 0, z: 0 };
  return [centro.x, pisoY, centro.z];
}

function clampArrastre(x: number, z: number): [number, number] {
  return [
    THREE.MathUtils.clamp(x, -limiteX, limiteX),
    THREE.MathUtils.clamp(z, -limiteZ, limiteZ),
  ];
}

function getCeldaMasCercana(x: number, z: number): number {
  let mejorIndice = 0;
  let mejorDistancia = Number.POSITIVE_INFINITY;

  celdasGrilla.forEach((celda, indice) => {
    const distancia = Math.hypot(celda.x - x, celda.z - z);
    if (distancia < mejorDistancia) {
      mejorDistancia = distancia;
      mejorIndice = indice;
    }
  });

  return mejorIndice;
}

function CubitoMaterial({
  nombre,
  porcentaje,
  color,
  posicion,
  ancho,
  profundidad,
  activo,
  arrastrando,
  onHover,
  onLeave,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  nombre: string;
  porcentaje: number;
  color: string;
  posicion: [number, number, number];
  ancho: number;
  profundidad: number;
  activo: boolean;
  arrastrando: boolean;
  onHover: () => void;
  onLeave: () => void;
  onPointerDown: (event: ThreeEvent<PointerEvent>) => void;
  onPointerMove: (event: ThreeEvent<PointerEvent>) => void;
  onPointerUp: (event: ThreeEvent<PointerEvent>) => void;
}) {
  const altura = (porcentaje / 100) * galponAltura * 0.9;
  const alturaVisible = Math.max(0.22, altura);
  const escala = arrastrando ? 1.1 : activo ? 1.08 : 1;
  const elevacionLabel = arrastrando ? 0.62 : activo ? 0.5 : 0.3;
  const colorLabel = activo ? "#0f5132" : "#1a1a1a";

  return (
    <group position={posicion}>
      <Box
        args={[ancho * escala, alturaVisible, profundidad * escala]}
        position={[0, alturaVisible / 2, 0]}
        onPointerOver={onHover}
        onPointerOut={onLeave}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={arrastrando ? 0.45 : activo ? 0.35 : 0.08}
          roughness={0.55}
          opacity={arrastrando ? 0.92 : 1}
          transparent={arrastrando}
        />
      </Box>
      <Text
        position={[0, alturaVisible + elevacionLabel, 0]}
        fontSize={activo ? 0.29 : 0.25}
        color={colorLabel}
        anchorX="center"
        anchorY="bottom"
      >
        {nombre}
        {"\n"}
        {porcentaje.toFixed(1)}%
      </Text>
    </group>
  );
}

export default function VistaSimulador({ sectores }: Props) {
  const materiales = Object.keys(sectores);
  const [materialActivo, setMaterialActivo] = useState<string | null>(null);
  const [asignacionCeldas, setAsignacionCeldas] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      Object.entries(layoutMateriales).map(([nombre, layout]) => [nombre, layout.celdaInicial]),
    ),
  );
  const [dragState, setDragState] = useState<DragState | null>(null);

  const manejarInicioArrastre = (nombre: string, event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    const target = event.target as PointerCaptureTarget | null;
    target?.setPointerCapture?.(event.pointerId);
    setMaterialActivo(nombre);
    setDragState({
      material: nombre,
      celdaOrigen: asignacionCeldas[nombre],
      posicionTemporal: getPosicionPorCelda(asignacionCeldas[nombre]),
    });
  };

  const manejarMovimientoArrastre = (nombre: string, event: ThreeEvent<PointerEvent>) => {
    if (!dragState || dragState.material !== nombre) return;
    event.stopPropagation();

    const interseccion = new THREE.Vector3();
    if (!event.ray.intersectPlane(planoArrastre, interseccion)) return;

    const [x, z] = clampArrastre(interseccion.x, interseccion.z);
    setDragState((actual) =>
      actual && actual.material === nombre
        ? { ...actual, posicionTemporal: [x, pisoY, z] }
        : actual,
    );
  };

  const manejarFinArrastre = (nombre: string, event: ThreeEvent<PointerEvent>) => {
    if (!dragState || dragState.material !== nombre) return;
    event.stopPropagation();
    const target = event.target as PointerCaptureTarget | null;
    target?.releasePointerCapture?.(event.pointerId);

    const celdaDestino = getCeldaMasCercana(
      dragState.posicionTemporal[0],
      dragState.posicionTemporal[2],
    );

    const ocupadaPorOtro = Object.entries(asignacionCeldas).some(
      ([material, celda]) => material !== nombre && celda === celdaDestino,
    );

    if (!ocupadaPorOtro) {
      setAsignacionCeldas((actual) => ({
        ...actual,
        [nombre]: celdaDestino,
      }));
    }

    setDragState(null);
  };

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [11, 7.6, 11.5], fov: 44 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.72} />
          <directionalLight position={[10, 10, 5]} intensity={1.1} />
          <Box args={[galponAncho, galponAltura, galponProfundidad]}>
            <meshStandardMaterial color="#bbf7d0" transparent opacity={0.15} depthWrite={false} />
          </Box>
          <Box args={[galponAncho, galponAltura, galponProfundidad]}>
            <meshBasicMaterial color="#166534" wireframe />
          </Box>
          {materiales.map((nombre) => {
            const layout = layoutMateriales[nombre] ?? {
              celdaInicial: 0,
              ancho: 2,
              profundidad: 1.5,
            };
            const arrastrando = dragState?.material === nombre;
            const posicion = arrastrando
              ? dragState.posicionTemporal
              : getPosicionPorCelda(asignacionCeldas[nombre] ?? layout.celdaInicial);

            return (
              <CubitoMaterial
                key={nombre}
                nombre={nombre}
                porcentaje={sectores[nombre]}
                color={coloresCubos[nombre] ?? "#94a3b8"}
                posicion={posicion}
                ancho={layout.ancho}
                profundidad={layout.profundidad}
                activo={materialActivo === nombre || arrastrando}
                arrastrando={arrastrando}
                onHover={() => setMaterialActivo(nombre)}
                onLeave={() => setMaterialActivo((actual) => (actual === nombre ? null : actual))}
                onPointerDown={(event) => manejarInicioArrastre(nombre, event)}
                onPointerMove={(event) => manejarMovimientoArrastre(nombre, event)}
                onPointerUp={(event) => manejarFinArrastre(nombre, event)}
              />
            );
          })}
          <OrbitControls
            enabled={dragState === null}
            enablePan={false}
            minDistance={11}
            maxDistance={17}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
