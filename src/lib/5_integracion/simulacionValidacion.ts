export const SIMULACION_LIMITS = {
  cantidadImpresorasMax: 100_000,
  capacidadTotalM3Min: 0.01,
  capacidadTotalM3Max: 1_000_000,
  capacidadTotalM3MaxDecimals: 2,
  tiempoDesmontajePromedioMax: 10_000,
  tiempoDesmontajePromedioDefault: 25,
} as const;

export type SimulacionField =
  | "cantidadImpresoras"
  | "capacidadTotalM3"
  | "tiempoDesmontajePromedio";

export type SimulacionFieldErrors = Partial<Record<SimulacionField, string>>;

export interface SimulacionInput {
  cantidadImpresoras: number;
  capacidadTotalM3: number;
  tiempoDesmontajePromedio?: number;
}

export interface SimulacionInputValida {
  cantidadImpresoras: number;
  capacidadTotalM3: number;
  tiempoDesmontajePromedio: number;
}

export interface SimulacionValidationResult {
  ok: boolean;
  data?: SimulacionInputValida;
  fieldErrors: SimulacionFieldErrors;
}

const REQUIRED_MESSAGE = "Este campo es obligatorio";
const NUMBER_MESSAGE = "Debe ser un número válido";
const POSITIVE_MESSAGE = "Debe ser mayor a 0";
const CAPACITY_TOO_SMALL_MESSAGE = "El espacio es demasiado chico. Ingresá al menos 0.01 m³.";
const MAX_DECIMALS_MESSAGE = "Usá como máximo 2 decimales. Ejemplo: 0,01.";
const INTEGER_MESSAGE = "Debe ser un número entero";
const TOO_BIG_MESSAGE = "El número es muy grande. Probá con uno más chico.";

function isMissing(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

function normalizeDecimalInput(value: string): string {
  const trimmedValue = value.trim();

  if (trimmedValue.includes(",") && !trimmedValue.includes(".")) {
    return trimmedValue.replace(",", ".");
  }

  return trimmedValue;
}

export function parseSimulacionNumber(value: unknown): number {
  if (typeof value === "number") return value;

  if (typeof value !== "string") return Number.NaN;

  const normalizedValue = normalizeDecimalInput(value);
  if (normalizedValue === "") return Number.NaN;

  return Number(normalizedValue);
}

function countDecimalPlaces(value: unknown): number {
  const normalizedValue = typeof value === "number"
    ? value.toString()
    : typeof value === "string"
      ? normalizeDecimalInput(value)
      : "";

  const decimalPart = normalizedValue.split(".")[1];
  return decimalPart?.length ?? 0;
}

function isPlainObject(value: unknown): value is Partial<SimulacionInput> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validatePositiveNumber(
  value: unknown,
  max: number,
  required: boolean,
  min = 0,
  tooSmallMessage = POSITIVE_MESSAGE,
  maxDecimals?: number,
): string | null {
  if (isMissing(value)) {
    return required ? REQUIRED_MESSAGE : null;
  }

  const numberValue = parseSimulacionNumber(value);

  if (!Number.isFinite(numberValue)) return NUMBER_MESSAGE;
  if (maxDecimals !== undefined && countDecimalPlaces(value) > maxDecimals) return MAX_DECIMALS_MESSAGE;
  if (min === 0 && numberValue <= 0) return tooSmallMessage;
  if (min > 0 && numberValue < min) return tooSmallMessage;
  if (numberValue > max) return TOO_BIG_MESSAGE;

  return null;
}

function validateCantidadImpresoras(value: unknown): string | null {
  if (isMissing(value)) return REQUIRED_MESSAGE;

  const numberValue = parseSimulacionNumber(value);

  if (!Number.isFinite(numberValue)) return NUMBER_MESSAGE;
  if (numberValue <= 0) return POSITIVE_MESSAGE;
  if (!Number.isInteger(numberValue)) return INTEGER_MESSAGE;
  if (numberValue > SIMULACION_LIMITS.cantidadImpresorasMax) return TOO_BIG_MESSAGE;
  if (!Number.isSafeInteger(numberValue)) return TOO_BIG_MESSAGE;

  return null;
}

export function validateSimulacionInput(input: unknown): SimulacionValidationResult {
  const safeInput = isPlainObject(input) ? input : {};
  const fieldErrors: SimulacionFieldErrors = {};

  const cantidadError = validateCantidadImpresoras(safeInput.cantidadImpresoras);
  if (cantidadError) fieldErrors.cantidadImpresoras = cantidadError;

  const capacidadError = validatePositiveNumber(
    safeInput.capacidadTotalM3,
    SIMULACION_LIMITS.capacidadTotalM3Max,
    true,
    SIMULACION_LIMITS.capacidadTotalM3Min,
    CAPACITY_TOO_SMALL_MESSAGE,
    SIMULACION_LIMITS.capacidadTotalM3MaxDecimals,
  );
  if (capacidadError) fieldErrors.capacidadTotalM3 = capacidadError;

  const tiempoError = validatePositiveNumber(
    safeInput.tiempoDesmontajePromedio,
    SIMULACION_LIMITS.tiempoDesmontajePromedioMax,
    false,
  );
  if (tiempoError) fieldErrors.tiempoDesmontajePromedio = tiempoError;

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    fieldErrors: {},
    data: {
      cantidadImpresoras: parseSimulacionNumber(safeInput.cantidadImpresoras),
      capacidadTotalM3: parseSimulacionNumber(safeInput.capacidadTotalM3),
      tiempoDesmontajePromedio: isMissing(safeInput.tiempoDesmontajePromedio)
        ? SIMULACION_LIMITS.tiempoDesmontajePromedioDefault
        : parseSimulacionNumber(safeInput.tiempoDesmontajePromedio),
    },
  };
}

export function validateSimulacionField(
  field: SimulacionField,
  value: unknown,
): string {
  if (field === "cantidadImpresoras") {
    return validateCantidadImpresoras(value) ?? "";
  }

  const max = field === "capacidadTotalM3"
    ? SIMULACION_LIMITS.capacidadTotalM3Max
    : SIMULACION_LIMITS.tiempoDesmontajePromedioMax;

  const required = field === "capacidadTotalM3";
  const min = field === "capacidadTotalM3"
    ? SIMULACION_LIMITS.capacidadTotalM3Min
    : 0;
  const tooSmallMessage = field === "capacidadTotalM3"
    ? CAPACITY_TOO_SMALL_MESSAGE
    : POSITIVE_MESSAGE;

  const maxDecimals = field === "capacidadTotalM3"
    ? SIMULACION_LIMITS.capacidadTotalM3MaxDecimals
    : undefined;

  return validatePositiveNumber(value, max, required, min, tooSmallMessage, maxDecimals) ?? "";
}
