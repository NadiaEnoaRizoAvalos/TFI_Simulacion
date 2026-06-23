import { describe, expect, it } from "vitest";
import { SIMULACION_LIMITS, validateSimulacionInput } from "./simulacionValidacion";

describe("validateSimulacionInput", () => {
  it("requires cantidadImpresoras and capacidadTotalM3", () => {
    const result = validateSimulacionInput({});

    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toEqual({
      cantidadImpresoras: "Este campo es obligatorio",
      capacidadTotalM3: "Este campo es obligatorio",
    });
  });

  it("rejects non-object input without throwing", () => {
    const inputs = [null, [], "bad-input", 42, true];

    for (const input of inputs) {
      const result = validateSimulacionInput(input);

      expect(result.ok).toBe(false);
      expect(result.fieldErrors).toEqual({
        cantidadImpresoras: "Este campo es obligatorio",
        capacidadTotalM3: "Este campo es obligatorio",
      });
    }
  });

  it("rejects decimal printers", () => {
    const result = validateSimulacionInput({ cantidadImpresoras: 1.5, capacidadTotalM3: 10 });

    expect(result.ok).toBe(false);
    expect(result.fieldErrors.cantidadImpresoras).toBe("Debe ser un número entero");
  });

  it("rejects over-limit printer counts with a user-friendly message", () => {
    const result = validateSimulacionInput({
      cantidadImpresoras: SIMULACION_LIMITS.cantidadImpresorasMax + 1,
      capacidadTotalM3: 10,
    });

    expect(result.ok).toBe(false);
    expect(result.fieldErrors.cantidadImpresoras).toBe(
      "El número es muy grande. Probá con uno más chico.",
    );
  });

  it("rejects unsafe integer printer counts with the same user-friendly message", () => {
    const result = validateSimulacionInput({
      cantidadImpresoras: Number.MAX_SAFE_INTEGER + 1,
      capacidadTotalM3: 10,
    });

    expect(result.ok).toBe(false);
    expect(result.fieldErrors.cantidadImpresoras).toBe(
      "El número es muy grande. Probá con uno más chico.",
    );
  });

  it("rejects non-finite capacity", () => {
    const result = validateSimulacionInput({ cantidadImpresoras: 1, capacidadTotalM3: Infinity });

    expect(result.ok).toBe(false);
    expect(result.fieldErrors.capacidadTotalM3).toBe("Debe ser un número válido");
  });

  it("accepts warehouse capacity decimals with comma or point", () => {
    const commaResult = validateSimulacionInput({
      cantidadImpresoras: 1,
      capacidadTotalM3: "0,11" as unknown as number,
    });
    const pointResult = validateSimulacionInput({
      cantidadImpresoras: 1,
      capacidadTotalM3: "0.11" as unknown as number,
    });

    expect(commaResult.ok).toBe(true);
    expect(commaResult.data?.capacidadTotalM3).toBe(0.11);
    expect(pointResult.ok).toBe(true);
    expect(pointResult.data?.capacidadTotalM3).toBe(0.11);
  });

  it("rejects warehouse capacity with more than two decimals", () => {
    const result = validateSimulacionInput({
      cantidadImpresoras: 1,
      capacidadTotalM3: "0,11111" as unknown as number,
    });

    expect(result.ok).toBe(false);
    expect(result.fieldErrors.capacidadTotalM3).toBe(
      "Usá como máximo 2 decimales. Ejemplo: 0,01.",
    );
  });

  it("rejects warehouse capacity below the minimum useful value", () => {
    const result = validateSimulacionInput({
      cantidadImpresoras: 1,
      capacidadTotalM3: 0,
    });

    expect(result.ok).toBe(false);
    expect(result.fieldErrors.capacidadTotalM3).toBe(
      "El espacio es demasiado chico. Ingresá al menos 0.01 m³.",
    );
  });

  it("defaults tiempoDesmontajePromedio when it is omitted", () => {
    const result = validateSimulacionInput({ cantidadImpresoras: 1, capacidadTotalM3: 10 });

    expect(result.ok).toBe(true);
    expect(result.data?.tiempoDesmontajePromedio).toBe(25);
  });

  it("validates optional tiempoDesmontajePromedio when present", () => {
    const result = validateSimulacionInput({
      cantidadImpresoras: 1,
      capacidadTotalM3: 10,
      tiempoDesmontajePromedio: 0,
    });

    expect(result.ok).toBe(false);
    expect(result.fieldErrors.tiempoDesmontajePromedio).toBe("Debe ser mayor a 0");
  });
});
