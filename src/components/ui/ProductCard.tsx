"use client";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";

interface Props {
  producto: { _id: string; nombre: string; precio: number; imagenes: string[]; estado: string; categoria: string; vendedor: { nombre: string; reputacion: number; foto?: string } };
}

export default function ProductCard({ producto }: Props) {
  const img = producto.imagenes?.[0] || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop";
  return (
    <Link href={`/producto/${producto._id}`} className="card group block">
      <div className="relative overflow-hidden h-52 bg-gray-100">
        <Image src={img} alt={producto.nombre} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        <div className="absolute top-3 left-3">
          <span className={producto.estado === "nuevo" ? "badge-nuevo" : "badge-usado"}>
            {producto.estado === "nuevo" ? "Nuevo" : "Usado"}
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-white text-sabana-azul text-xs font-semibold px-2 py-1 rounded-full shadow">
          {producto.categoria}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-sabana-azul transition-colors">{producto.nombre}</h3>
        <p className="text-sabana-azul font-bold text-xl mb-3">${producto.precio.toLocaleString("es-CO")}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-sabana-azul rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden">
              {producto.vendedor?.foto ? <Image src={producto.vendedor.foto} alt={producto.vendedor.nombre} width={24} height={24} className="object-cover w-full h-full" /> : producto.vendedor?.nombre?.charAt(0).toUpperCase()}
            </div>
            <span className="text-gray-500 text-xs truncate max-w-24">{producto.vendedor?.nombre}</span>
          </div>
          {producto.vendedor?.reputacion > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-gray-600 font-medium">{producto.vendedor.reputacion.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
