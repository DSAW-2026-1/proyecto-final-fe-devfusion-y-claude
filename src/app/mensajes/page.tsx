"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { MessageSquare } from "lucide-react";

export default function MensajesPage() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const [convs, setConvs] = useState<any[]>([]);
  const [cargandoConvs, setCargandoConvs] = useState(true);

  useEffect(() => { if (!cargando && !usuario) router.push("/login"); }, [usuario, cargando]);

  useEffect(() => {
    if (!usuario) return;
    api.get("/chat").then(({ data }) => setConvs(data)).finally(() => setCargandoConvs(false));
  }, [usuario]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mensajes</h1>
      {cargandoConvs ? (
        <div className="space-y-3">{[1,2,3,4].map((i) => <div key={i} className="card h-20 animate-pulse" />)}</div>
      ) : convs.length === 0 ? (
        <div className="card p-16 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No tienes mensajes aún</h2>
          <p className="text-gray-400 mb-6">Cuando contactes a un vendedor, la conversación aparecerá aquí</p>
          <Link href="/" className="btn-primary inline-flex">Explorar productos</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {convs.map((conv) => {
            const esComprador = conv.comprador?._id === usuario?.id;
            const otro = esComprador ? conv.vendedor : conv.comprador;
            const tieneNoLeidos = conv.noLeidos > 0;
            return (
              <Link
                key={conv._id}
                href={`/mensajes/${conv._id}`}
                className={`card p-4 flex items-center gap-4 hover:shadow-md transition-all ${tieneNoLeidos ? "border-l-4 border-sabana-azul" : ""}`}
              >
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
                  <div className="flex items-center justify-between mb-1">
                    <p className={`truncate ${tieneNoLeidos ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                      {otro?.nombre}
                    </p>
                    <p className="text-gray-400 text-xs flex-shrink-0 ml-2">
                      {new Date(conv.ultimaActividad).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <p className="text-gray-500 text-sm truncate">{conv.producto?.nombre}</p>
                  {conv.ultimoMensaje && (
                    <p className={`text-xs truncate mt-0.5 ${tieneNoLeidos ? "font-semibold text-gray-700" : "text-gray-400"}`}>
                      {conv.ultimoMensaje}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}