"use client";

import { useState } from "react";

interface FormFields {
  cantidadImpresoras: string;
  espacioGalpon: string;
  tiempoDesmontaje: string;
}

interface FormErrors {
  cantidadImpresoras?: string;
  espacioGalpon?: string;
  tiempoDesmontaje?: string;
}

export default function SimuladorForm({ onSubmit }: { onSubmit: (data: Record<string, number>) => void }) {
  const [form, setForm] = useState<FormFields>({
    cantidadImpresoras: "",
    espacioGalpon: "",
    tiempoDesmontaje: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = (name: string, value: string): string => {
    const num = Number(value);
    if (value === "") return "Este campo es obligatorio";
    if (isNaN(num)) return "Debe ser un número válido";
    if (num <= 0) return "Debe ser mayor a 0";
    if (name === "cantidadImpresoras" && !Number.isInteger(num)) return "Debe ser un número entero";
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {
      cantidadImpresoras: validate("cantidadImpresoras", form.cantidadImpresoras),
      espacioGalpon: validate("espacioGalpon", form.espacioGalpon),
      tiempoDesmontaje: validate("tiempoDesmontaje", form.tiempoDesmontaje),
    };
    setErrors(newErrors);
    setTouched({ cantidadImpresoras: true, espacioGalpon: true, tiempoDesmontaje: true });

    if (Object.values(newErrors).every((e) => !e)) {
      onSubmit({
        cantidadImpresoras: Number(form.cantidadImpresoras),
        espacioGalpon: Number(form.espacioGalpon),
        tiempoDesmontaje: Number(form.tiempoDesmontaje),
      });
    }
  };

  const fields = [
    {
      name: "cantidadImpresoras",
      label: "Cantidad de impresoras",
      hint: "Entero mayor a 0",
    },
    {
      name: "espacioGalpon",
      label: "Espacio total del galpón (m³)",
      hint: "Número mayor a 0",
    },
    {
      name: "tiempoDesmontaje",
      label: "Tiempo de desmontaje promedio",
      hint: "Número mayor a 0",
    },
  ];

  return (
    <div className="flex-1 flex items-center justify-center font-sans py-10">
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 px-10 py-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <span className="text-5xl mb-3">⚙️</span>
          <h2 className="text-2xl font-extrabold text-green-800 tracking-tight">Parámetros de simulación</h2>
          <div className="w-12 h-1 bg-green-400 rounded-full mt-3" />
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          {fields.map(({ name, label, hint }) => {
            const error = errors[name as keyof FormErrors];
            const isTouched = touched[name];
            const isValid = isTouched && !error;

            return (
              <div key={name} className="flex flex-col gap-1">
                <label className="text-green-800 font-semibold text-sm">
                  {label}
                </label>
                <input
                  type="number"
                  name={name}
                  value={form[name as keyof FormFields]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min={name === "cantidadImpresoras" ? 1 : 0.01}
                  step={name === "cantidadImpresoras" ? 1 : "any"}
                  placeholder={hint}
                  className={`w-full px-4 py-2.5 rounded-lg border text-green-900 placeholder-green-300 outline-none transition-all duration-200
                    ${error ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200" : ""}
                    ${isValid ? "border-green-400 bg-green-50 focus:ring-2 focus:ring-green-200" : ""}
                    ${!error && !isValid ? "border-green-200 bg-white focus:ring-2 focus:ring-green-200 focus:border-green-400" : ""}
                  `}
                />
                {error && <span className="text-red-500 text-xs">{error}</span>}
                {isValid && <span className="text-green-500 text-xs">✓ Valor válido</span>}
              </div>
            );
          })}

          <button
            type="submit"
            className="mt-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-semibold text-base px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
          >
            Iniciar simulación →
          </button>
        </form>
      </div>
    </div>
  );
}
