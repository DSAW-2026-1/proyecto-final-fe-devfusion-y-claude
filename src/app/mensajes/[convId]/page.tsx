"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Send, ArrowLeft, Package } from "lucide-react";
import { use } from "react";

export default function ChatPage({ params }: { params: Promise<{ convId: string }> }) {
  const { convId } = use(params);
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const [conv, setConv] = useState<any>(null);
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { if (!cargando && !usuario) router.push("/login"); }, [usuario, cargando]);

  const fetchMensajes = useCallback(async () => {
    try {
      const { data } = await api.get(`/chat/${convId}/mensajes`);
      setMensajes(data);
    } catch {}
  }, [convId]);

  useEffect(() => {
    if (!usuario) return;
    api.get(`/chat/${convId}/mensajes`).then(({ data }) => setMensajes(data)).catch(() => { toast.error("Conversación no encontrada"); router.push("/mensajes"); });
    api.get("/chat").then(({ data }) => {
      const c = data.find((c: any) => c._id === convId);
      if (c) setConv(c);
    });
    intervalRef.current = setInterval(fetchMensajes, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [usuario, convId, fetchMensajes]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [mensajes]);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    try {
      const { data } = await api.post(`/chat/${convId}/mensajes`, { texto });
      setMensajes((prev) => [...prev, data]);
      setTexto("");
    } catch { toast.error("Error al enviar mensaje"); }
    finally { setEnviando(false); }
  };

  const otro = conv ? (conv.comprador?._id === usuario?.id ? conv.vendedor : conv.comprador) : null;

  return (
    <div className="max-w-2xl mx-auto px-0 sm:px-4 sm:py-6 h-screen sm:h-auto flex flex-col">
      <div className="card flex flex-col h-full sm:h-[80vh] overflow-hidden">
        <div className="bg-sabana-azul p-4 flex items-center gap-3">
          <Link href="/mensajes" className="text-white hover:text-sabana-dorado transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          {otro && (
            <>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                {otro.foto ? <Image src={otro.foto} alt={otro.nombre} width={40} height={40} className="object-cover w-full h-full" /> : otro.nombre?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-semibold">{otro.nombre}</p>
                {conv?.producto && <p className="text-blue-200 text-xs truncate">{conv.producto.nombre}</p>}
              </div>
            </>
          )}
          {conv?.producto && (
            <Link href={`/producto/${conv.producto._id}`} className="ml-auto text-blue-200 hover:text-sabana-dorado transition-colors flex-shrink-0">
              <Package className="w-5 h-5" />
            </Link>
          )}
        </div>

        {conv?.producto && (
          <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden relative flex-shrink-0 bg-gray-100">
              {conv.producto.imagenes?.[0] && <Image src={conv.producto.imagenes[0]} alt={conv.producto.nombre} fill className="object-cover" />}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 truncate">{conv.producto.nombre}</p>
              <p className="text-sabana-azul text-sm font-bold">${conv.producto.precio?.toLocaleString("es-CO")}</p>
            </div>
            <Link href={`/checkout`} className="ml-auto btn-primary py-1.5 px-3 text-xs flex-shrink-0">Ver carrito</Link>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {mensajes.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-8">Inicia la conversación 👋</div>
          )}
          {mensajes.map((m) => {
            const esMio = m.emisor?._id === usuario?.id || m.emisor === usuario?.id;
            return (
              <div key={m._id} className={`flex items-end gap-2 ${esMio ? "flex-row-reverse" : "flex-row"}`}>
                {!esMio && (
                  <div className="w-7 h-7 rounded-full bg-sabana-azul flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                    {m.emisor?.foto ? <Image src={m.emisor.foto} alt="" width={28} height={28} className="object-cover w-full h-full" /> : m.emisor?.nombre?.charAt(0)}
                  </div>
                )}
                <div className={`max-w-xs sm:max-w-sm px-4 py-2.5 rounded-2xl text-sm shadow-sm ${esMio ? "bg-sabana-azul text-white rounded-br-md" : "bg-white text-gray-800 rounded-bl-md"}`}>
                  <p className="leading-relaxed">{m.texto}</p>
                  <p className={`text-xs mt-1 ${esMio ? "text-blue-200" : "text-gray-400"}`}>
                    {new Date(m.createdAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleEnviar} className="p-4 bg-white border-t border-gray-100 flex gap-3">
          <input type="text" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe un mensaje..."
            className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sabana-azul" />
          <button type="submit" disabled={!texto.trim() || enviando}
            className="bg-sabana-azul text-white p-3 rounded-2xl hover:bg-sabana-azul-hover transition-colors disabled:opacity-50 flex-shrink-0">
            {enviando ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin block" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}