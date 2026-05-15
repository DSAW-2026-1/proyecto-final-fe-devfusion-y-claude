"use client";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-sabana-azul text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
                <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Escudo_Universidad_de_La_Sabana.svg/200px-Escudo_Universidad_de_La_Sabana.svg.png"
                  alt="Logo Unisabana" width={36} height={36} className="object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
              <div>
                <span className="font-bold text-lg block">UnisabanaMarket</span>
                <span className="text-sabana-dorado text-xs">Universidad de La Sabana</span>
              </div>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed max-w-sm">
              El marketplace oficial de la comunidad universitaria de la Universidad de La Sabana. Compra y vende de forma segura entre estudiantes.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-sabana-dorado">Navegar</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link href="/?categoria=Libros" className="hover:text-white transition-colors">Libros</Link></li>
              <li><Link href="/?categoria=Electrónica" className="hover:text-white transition-colors">Electrónica</Link></li>
              <li><Link href="/?categoria=Ropa" className="hover:text-white transition-colors">Ropa</Link></li>
              <li><Link href="/publicar" className="hover:text-white transition-colors">Publicar producto</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-sabana-dorado">Mi cuenta</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><Link href="/mis-compras" className="hover:text-white transition-colors">Mis compras</Link></li>
              <li><Link href="/mis-ventas" className="hover:text-white transition-colors">Mis ventas</Link></li>
              <li><Link href="/mensajes" className="hover:text-white transition-colors">Mensajes</Link></li>
              <li><Link href="/registro" className="hover:text-white transition-colors">Crear cuenta</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Iniciar sesión</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-blue-700 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-blue-300 text-sm">© {new Date().getFullYear()} Marketplace Universidad de La Sabana. Todos los derechos reservados.</p>
          <p className="text-blue-300 text-sm">Chía, Cundinamarca, Colombia</p>
        </div>
      </div>
    </footer>
  );
}
