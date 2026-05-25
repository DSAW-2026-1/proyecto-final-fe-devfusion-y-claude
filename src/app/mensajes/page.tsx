"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { MessageSquare, Trash2, AlertTriangle, Search } from "lucide-react";

export default function MensajesPage() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [convs, setConvs] = useState<any[]>([]);
  const [cargandoConvs, setCargandoConvs] = useState(true);
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => { if (!cargando && !usuario) router.push("/login"); }, [usuario, cargando]);

  const fetchConvs = useCallback(async () => {
    if (!usuario) return;
    try {
      const { data } = await api.get("/chat");
      setConvs(data);
    } catch {} finally { setCargandoConvs(false); }
  }, [usuario]);

  useEffect(() => { fetchConvs(); }, [fetchConvs]);

  // Refrescar lista cada 5 segundos
  useEffect(() => {
    const interval = setInterval(fetchConvs, 5000);
    return () => clearInterval(interval);
  }, [fetchConvs]);

  const handleEliminarChat = async (convId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.delete(`/chat/${convId}`);
      setConvs(prev => prev.filter(c => c._id !== convId));
      toast.success("Conversación eliminada");
      if (pathname === `/mensajes/${convId}`) router.push("/mensajes");
    } catch { toast.error("No se pudo eliminar la conversación"); }
    setConfirmando(null);
  };

  const convsFiltradas = convs.filter(conv => {
    if (!busqueda.trim()) return true;
    const esComprador = conv.comprador?._id === usuario?.id;
    const otro = esComprador ? conv.vendedor : conv.comprador;
    return otro?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      conv.productos?.[0]?.nombre?.toLowerCase().includes(busqueda.toLowerCase());
  });

  const ListaConvs = (
    <div className="flex flex-col h-full">
      {/* Header lista */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Mensajes</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar conversación..."
            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sabana-azul"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {cargandoConvs ? (
          <div className="p-3 space-y-2">
            {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : convsFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 px-4 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium text-sm">
              {busqueda ? "Sin resultados" : "No tienes mensajes aún"}
            </p>
            {!busqueda && (
              <Link href="/" className="mt-3 text-sabana-azul text-sm font-medium hover:underline">
                Explorar productos
              </Link>
            )}
          </div>
        ) : (
          convsFiltradas.map(conv => {
            const esComprador = conv.comprador?._id === usuario?.id;
            const otro = esComprador ? conv.vendedor : conv.comprador;
            const tieneNoLeidos = conv.noLeidos > 0;
            const estaActivo = pathname === `/mensajes/${conv._id}`;

            return (
              <div key={conv._id} className="group relative">
                <Link
                  href={`/mensajes/${conv._id}`}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${estaActivo ? "bg-blue-50 border-r-4 border-sabana-azul" : ""}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-sabana-azul flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                      {otro?.foto
                        ? <Image src={otro.foto} alt={otro.nombre} width={48} height={48} className="object-cover w-full h-full" />
                        : otro?.nombre?.charAt(0).toUpperCase()}
                    </div>
                    {tieneNoLeidos && (
                      <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {conv.noLeidos > 9 ? "9+" : conv.noLeidos}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${tieneNoLeidos ? "font-bold text-gray-900" : "font-medium text-gray-800"}`}>
                        {otro?.nombre}
                      </p>
                      <p className="text-gray-400 text-xs flex-shrink-0 ml-2">
                        {new Date(conv.ultimaActividad).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <p className="text-gray-400 text-xs truncate">{conv.productos?.[0]?.nombre}</p>
                    {conv.ultimoMensaje && (
                      <p className={`text-xs truncate ${tieneNoLeidos ? "font-semibold text-gray-600" : "text-gray-400"}`}>
                        {conv.ultimoMensaje}
                      </p>
                    )}
                  </div>
                </Link>
                {/* Botón eliminar */}
                <button
                  onClick={e => { e.preventDefault(); e.stopPropagation(); setConfirmando(conv._id); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="Eliminar conversación"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Modal confirmación */}
      {confirmando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setConfirmando(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">¿Eliminar conversación?</p>
                <p className="text-gray-500 text-xs mt-0.5">Solo se eliminará para ti</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={e => handleEliminarChat(confirmando, e)}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors">
                Eliminar
              </button>
              <button onClick={() => setConfirmando(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Layout desktop: dos paneles */}
      <div className="hidden lg:flex h-[calc(100vh-64px)] border-t border-gray-100">
        {/* Panel izquierdo - lista */}
        <div className="w-80 xl:w-96 border-r border-gray-100 flex-shrink-0 bg-white">
          {ListaConvs}
        </div>
        {/* Panel derecho - placeholder cuando no hay chat seleccionado */}
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Selecciona una conversación</p>
            <p className="text-gray-400 text-sm mt-1">para empezar a chatear</p>
          </div>
        </div>
      </div>

      {/* Layout móvil: solo lista */}
      <div className="lg:hidden">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Mensajes</h1>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar conversación..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sabana-azul"
            />
          </div>
          {cargandoConvs ? (
            <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : convsFiltradas.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{busqueda ? "Sin resultados" : "No tienes mensajes aún"}</p>
              {!busqueda && <Link href="/" className="mt-3 text-sabana-azul text-sm font-medium hover:underline block">Explorar productos</Link>}
            </div>
          ) : (
            <div className="space-y-1">
              {convsFiltradas.map(conv => {
                const esComprador = conv.comprador?._id === usuario?.id;
                const otro = esComprador ? conv.vendedor : conv.comprador;
                const tieneNoLeidos = conv.noLeidos > 0;
                return (
                  <div key={conv._id} className="group relative">
                    <Link href={`/mensajes/${conv._id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-sabana-azul flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                          {otro?.foto ? <Image src={otro.foto} alt={otro.nombre} width={48} height={48} className="object-cover w-full h-full" /> : otro?.nombre?.charAt(0).toUpperCase()}
                        </div>
                        {tieneNoLeidos && (
                          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                            {conv.noLeidos > 9 ? "9+" : conv.noLeidos}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm truncate ${tieneNoLeidos ? "font-bold text-gray-900" : "font-medium text-gray-800"}`}>{otro?.nombre}</p>
                          <p className="text-gray-400 text-xs flex-shrink-0 ml-2">{new Date(conv.ultimaActividad).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}</p>
                        </div>
                        <p className="text-gray-400 text-xs truncate">{conv.productos?.[0]?.nombre}</p>
                        {conv.ultimoMensaje && <p className={`text-xs truncate ${tieneNoLeidos ? "font-semibold text-gray-600" : "text-gray-400"}`}>{conv.ultimoMensaje}</p>}
                      </div>
                    </Link>
                    <button onClick={e => { e.preventDefault(); e.stopPropagation(); setConfirmando(conv._id); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-300 hover:text-red-500 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}