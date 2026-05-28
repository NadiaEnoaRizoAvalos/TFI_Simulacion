import "./globals.css";

export const metadata = {
  title: "Simulador",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-green-100">
        <header className="w-full px-8 py-4 bg-white border-b border-green-100 shadow-sm flex items-center gap-3">
          <span className="text-2xl">🌿</span>
          <span className="text-green-800 font-extrabold text-xl tracking-tight">Simulador</span>
        </header>

        <main className="flex-1 flex flex-col">{children}</main>

        <footer className="w-full px-8 py-4 bg-white border-t border-green-100 text-center text-green-600 text-sm">
          © {new Date().getFullYear()} Simulador — Todos los derechos reservados
        </footer>
      </body>
    </html>
  );
}
