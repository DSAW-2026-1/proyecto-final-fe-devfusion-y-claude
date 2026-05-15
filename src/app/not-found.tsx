import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-bold text-sabana-azul mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Página no encontrada</h1>
        <p className="text-gray-500 mb-8">La página que buscas no existe o fue removida.</p>
        <Link href="/" className="btn-primary inline-flex">Volver al inicio</Link>
      </div>
    </div>
  );
}
