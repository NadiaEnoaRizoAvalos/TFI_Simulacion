"use client";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Box } from "@react-three/drei";
// Los colores como hex para Three.js (no clases Tailwind)
const coloresCubos: Record<string, string> = {
  Plástico: "#10B981",
  "Metales Ferrosos": "#3B82F6",
  "Metales No Ferrosos": "#06B6D4",
  "Placas Electrónicas": "#8B5CF6",
  "Cables": "#F59E0B",
};
// Dimensiones del galpon
const galponAncho = 10,
  galponAltura = 5,
  galponProfundidad = 8;

interface Props {
  sectores: Record<string, number>; // porcentaje ocupación por sector
  capacidadMaxima: Record<string, number>; // m³ máximo por sector
}

// Ancho máximo que puede ocupar cada cubito en su celda de la grilla
const CELDA_W = (galponAncho - 3) / 3;
const CELDA_D = (galponProfundidad - 3) / 2;
const TAM_BASE = Math.min(CELDA_W, CELDA_D); // cuadrado que cabe en la celda

function CubitoMaterial({
  nombre,
  porcentaje,
  color,
  posicion,
}: {
  nombre: string;
  porcentaje: number;
  color: string;
  posicion: [number, number, number];
}) {
  // La altura crece proporcionalmente al porcentaje usando el alto del galpón
  // Al 100% ocupa el 90% del alto, si desborda lo supera visualmente
  const altura = (porcentaje / 100) * galponAltura * 0.9;
  const base = TAM_BASE;
  // El cubito crece desde el piso hacia arriba, por eso el offset Y es altura/2
  return (
    <group position={[posicion[0], -galponAltura / 2, posicion[2]]}>
      <Box args={[base, altura, base]} position={[0, altura / 2, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      <Text
        position={[0, altura + 0.3, 0]}
        fontSize={0.25}
        color="#1a1a1a"
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
export default function VistaSimulador({ sectores, capacidadMaxima }: Props) {
  const materiales = Object.keys(sectores);
  const total = materiales.length;
  return (
    // Canvas necesita altura explícita, no puede ser h-full sin un padre con altura
    <div className="w-full h-full">
      <Canvas camera={{ position: [12, 8, 12], fov: 50 }}>
        <Suspense fallback={null}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        {/* Galpón: cubo wireframe grande */}
        <Box args={[galponAncho, galponAltura, galponProfundidad]}>
          <meshStandardMaterial color="#bbf7d0" transparent opacity={0.15} depthWrite={false} />
        </Box>
        {/* Borde del galpón */}
        <Box args={[galponAncho, galponAltura, galponProfundidad]}>
          <meshBasicMaterial color="#166534" wireframe />
        </Box>
        {/* Cubitos de materiales distribuidos en grilla dentro del galpón */}
        {materiales.map((nombre, i) => {
          const cols = Math.ceil(Math.sqrt(total));
          const col = i % cols;
          const fila = Math.floor(i / cols);
          const totalFilas = Math.ceil(total / cols);
          const x = -galponAncho / 2 + 1.5 + (col / (cols - 1 || 1)) * (galponAncho - 3);
          const z = -galponProfundidad / 2 + 1.5 + (fila / (totalFilas - 1 || 1)) * (galponProfundidad - 3);
          return (
            <CubitoMaterial
              key={nombre}
              nombre={nombre}
              porcentaje={sectores[nombre]}
              color={coloresCubos[nombre] ?? "#94a3b8"}
              posicion={[x, -galponAltura / 2 + 1, z]}
            />
          );
        })}
        <OrbitControls enablePan={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}
