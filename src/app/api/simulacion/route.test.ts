import { describe, expect, it } from "vitest";
import { POST } from "./route";

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/simulacion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/simulacion", () => {
  it("returns 400 for malformed JSON", async () => {
    const request = new Request("http://localhost/api/simulacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{bad-json",
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("El JSON enviado no es válido.");
  });

  it("returns 400 with field errors for invalid input", async () => {
    const response = await POST(jsonRequest({ cantidadImpresoras: 1.5, capacidadTotalM3: 10 }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.fieldErrors.cantidadImpresoras).toBe("Debe ser un número entero");
  });

  it("returns 400 for null JSON", async () => {
    const response = await POST(jsonRequest(null));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.fieldErrors).toEqual({
      cantidadImpresoras: "Este campo es obligatorio",
      capacidadTotalM3: "Este campo es obligatorio",
    });
  });

  it("returns 400 for array and primitive JSON", async () => {
    for (const input of [[], "bad-input", 42]) {
      const response = await POST(jsonRequest(input));
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.fieldErrors.cantidadImpresoras).toBe("Este campo es obligatorio");
      expect(body.fieldErrors.capacidadTotalM3).toBe("Este campo es obligatorio");
    }
  });

  it("returns 200 for valid small input", async () => {
    const response = await POST(
      jsonRequest({
        cantidadImpresoras: 1,
        capacidadTotalM3: 10,
        tiempoTotalDesarmado: 999,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.parametrosRecibidos.tiempoDesmontajePromedio).toBe(25);
    expect(body.parametrosRecibidos.tiempoTotalDesarmado).toBeUndefined();
    expect(body.resultados.capacidadTotalDeposito).toBe(10);
    expect(body.resultados.tiempoTotalDesarmado).toBeGreaterThan(0);
    expect(body.resultados.tiempoTotalDesarmado).not.toBe(999);
  });
});
