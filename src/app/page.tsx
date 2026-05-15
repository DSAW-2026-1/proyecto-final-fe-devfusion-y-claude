"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Filter, ChevronDown, BookOpen, Laptop, Shirt, Dumbbell, Coffee, Briefcase, Tag, ArrowRight } from "lucide-react";
import api from "@/lib/api";
import ProductCard from "@/components/ui/ProductCard";
import { useSearchParams } from "next/navigation";

const CATEGORIAS = [
  { nombre: "Todos", icono: Tag },
  { nombre: "Libros", icono: BookOpen },
  { nombre: "Electrónica", icono: Laptop },
  { nombre: "Ropa", icono: Shirt },
  { nombre: "Deportes", icono: Dumbbell },
  { nombre: "Alimentos", icono: Coffee },
  { nombre: "Servicios", icono: Briefcase },
  { nombre: "Otros", icono: Tag },
];

export default function HomePage() {
  const searchParams = useSearchParams();
  const [productos, setProductos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busqueda, setBusqueda] = useState(searchParams.get("q") || "");
  const [categoriaActiva, setCategoriaActiva] = useState(searchParams.get("categoria") || "Todos");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [ordenar, setOrdenar] = useState("-createdAt");

  const fetchProductos = useCallback(async (pag = 1) => {
    setCargando(true);
    try {
      const params: any = { pagina: pag, limite: 12 };
      if (busqueda) params.q = busqueda;
      if (categoriaActiva !== "Todos") params.categoria = categoriaActiva;
      if (estadoFiltro) params.estado = estadoFiltro;
      if (precioMax) params.precioMax = precioMax;
      const { data } = await api.get("/productos", { params });
      setProductos(data.productos);
      setTotal(data.total);
      setTotalPaginas(data.totalPaginas);
      setPagina(pag);
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  }, [busqueda, categoriaActiva, estadoFiltro, precioMax]);

  useEffect(() => { fetchProductos(1); }, [fetchProductos]);
  useEffect(() => {
    const q = searchParams.get("q");
    const cat = searchParams.get("categoria");
    if (q) setBusqueda(q);
    if (cat) setCategoriaActiva(cat);
  }, [searchParams]);

  const handleBuscar = (e: React.FormEvent) => { e.preventDefault(); fetchProductos(1); };

  return (
    <div>
      {/* HERO */}
      <section className="relative bg-sabana-azul overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&h=600&fit=crop&q=80"
            alt="Universidad de La Sabana campus" fill className="object-cover" priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-sabana-azul via-sabana-azul/90 to-sabana-azul/70" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-sabana-dorado/20 border border-sabana-dorado/40 text-sabana-dorado text-sm font-medium px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-sabana-dorado rounded-full animate-pulse" />
              Solo para la comunidad Unisabana
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Compra y vende entre<br />
              <span className="text-sabana-dorado">estudiantes</span>
            </h1>
            <p className="text-blue-200 text-lg sm:text-xl mb-8 leading-relaxed">
              El marketplace oficial de la Universidad de La Sabana. Libros, electrónica, ropa y mucho más — de estudiante a estudiante.
            </p>
            <form onSubmit={handleBuscar} className="flex gap-3 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="¿Qué estás buscando?"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-sabana-dorado shadow-lg"
                />
              </div>
              <button type="submit" className="bg-sabana-dorado text-white px-6 py-4 rounded-2xl font-semibold hover:opacity-90 transition-all shadow-lg whitespace-nowrap">
                Buscar
              </button>
            </form>
            <div className="flex items-center gap-6 mt-8 text-blue-200 text-sm">
              <span className="flex items-center gap-2"><span className="text-sabana-dorado font-bold text-lg">{total}+</span> productos</span>
              <span className="w-1 h-1 bg-blue-400 rounded-full" />
              <span>100% comunidad universitaria</span>
              <span className="w-1 h-1 bg-blue-400 rounded-full" />
              <span>Gratis publicar</span>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="bg-white border-b border-gray-100 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            {CATEGORIAS.map(({ nombre, icono: Icono }) => (
              <button key={nombre} onClick={() => setCategoriaActiva(nombre)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  categoriaActiva === nombre
                    ? "bg-sabana-azul text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                <Icono className="w-4 h-4" />
                {nombre}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="text-gray-500 text-sm">{total} resultados</span>
          <div className="flex items-center gap-3 ml-auto">
            <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-sabana-azul bg-white">
              <option value="">Todos los estados</option>
              <option value="nuevo">Nuevo</option>
              <option value="usado">Usado</option>
            </select>
            <select value={precioMax} onChange={(e) => setPrecioMax(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-sabana-azul bg-white">
              <option value="">Cualquier precio</option>
              <option value="20000">Hasta $20.000</option>
              <option value="50000">Hasta $50.000</option>
              <option value="100000">Hasta $100.000</option>
              <option value="200000">Hasta $200.000</option>
              <option value="500000">Hasta $500.000</option>
            </select>
          </div>
        </div>

        {cargando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-52 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No encontramos productos</h3>
            <p className="text-gray-500 mb-6">Intenta con otros filtros o sé el primero en publicar.</p>
            <Link href="/publicar" className="btn-primary inline-flex items-center gap-2">
              Publicar producto <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {productos.map((p) => <ProductCard key={p._id} producto={p} />)}
            </div>
            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button disabled={pagina === 1} onClick={() => fetchProductos(pagina - 1)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  Anterior
                </button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => fetchProductos(p)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${p === pagina ? "bg-sabana-azul text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                    {p}
                  </button>
                ))}
                <button disabled={pagina === totalPaginas} onClick={() => fetchProductos(pagina + 1)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
