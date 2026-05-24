"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Send, ArrowLeft, MoreVertical, Pencil, Trash2, Check, X } from "lucide-react";
import { use } from "react";

export default function ChatPage({ params }: { params: Promise<{ convId: string }> }) {
  const { convId } = use(params);
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const [conv, setConv] = useState<any>(null);
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [textoEditar, setTextoEditar] = useState("");
  const contenedorRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => { if (!cargando && !usuario) router.push("/login"); }, [usuario, cargando]);

  const estaAlFondo = useCallback(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return true;
    return contenedor.scrollHeight - contenedor.scrollTop - contenedor.clientHeight < 80;
  }, []);

  const scrollAlFondo = useCallback((forzar = false) => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;
    if (forzar || estaAlFondo()) contenedor.scrollTop = contenedor.scrollHeight;
  }, [estaAlFondo]);

  const fetchMensajes = useCallback(async () => {
    try {
      const { data } = await api.get(`/chat/${convId}/mensajes`);
      setMensajes(prev => {
        if (data.length > prev.length) setTimeout(() => scrollAlFondo(false), 50);
        return data;
      });
    } catch {}
  }, [convId, scrollAlFondo]);

  useEffect(() => {
    if (!usuario) return;
    api.get(`/chat/${convId}/mensajes`)
      .then(({ data }) => { setMensajes(data); setTimeout(() => scrollAlFondo(true), 100); })
      .catch(() => { toast.error("Conversación no encontrada"); router.push("/mensajes"); });
    api.get("/chat").then(({ data }) => {
      const c = data.find((c: any) => c._id === convId);
      if (c) setConv(c);
    });
    intervalRef.current = setInterval(fetchMensajes, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [usuario, convId, fetchMensajes, scrollAlFondo]);

  // Cerrar menú al hacer click fuera del menú abierto
  useEffect(() => {
    if (!menuAbierto) return;
    const handleClickFuera = (e: MouseEvent) => {
      const ref = menuRefs.current[menuAbierto];
      if (ref && !ref.contains(e.target as Node)) {
        setMenuAbierto(null);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, [menuAbierto]);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    try {
      const { data } = await api.post(`/chat/${convId}/mensajes`, { texto });
      setMensajes(prev => [...prev, data]);
      setTexto("");
      setTimeout(() => scrollAlFondo(true), 50);
    } catch { toast.error("Error al enviar mensaje"); }
    finally { setEnviando(false); }
  };

  const handleEliminar = async (msgId: string) => {
    try {
      await api.delete(`/chat/mensajes/${msgId}`);
      setMensajes(prev => prev.filter(m => m._id !== msgId));
      toast.success("Mensaje eliminado");
    } catch { toast.error("No se pudo eliminar el mensaje"); }
    setMenuAbierto(null);
  };

  const iniciarEdicion = (m: any) => {
    setEditando(m._id);
    setTextoEditar(m.texto);
    setMenuAbierto(null);
  };

  const handleEditar = async (msgId: string) => {
    if (!textoEditar.trim()) return;
    try {
      const { data } = await api.put(`/chat/mensajes/${msgId}`, { texto: textoEditar });
      setMensajes(prev => prev.map(m => m._id === msgId ? { ...m, texto: data.texto, editado: true } : m));
      setEditando(null);
      toast.success("Mensaje editado");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "No se pudo editar el mensaje");
      setEditando(null);
    }
  };

  const otro = conv ? (conv.comprador?._id === usuario?.id ? conv.vendedor : conv.comprador) : null;
  const primerProducto = conv?.productos?.[0];

  return (
    <div className="max-w-2xl mx-auto px-0 sm:px-4 sm:py-6 h-screen sm:h-auto flex flex-col">
      <div className="card flex flex-col h-full sm:h-[80vh] overflow-hidden">

        {/* Header */}
        <div className="bg-sabana-azul p-4 flex items-center gap-3">
          <Link href="/mensajes" className="text-white hover:text-sabana-dorado transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          {otro && (
            <>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                {otro.foto
                  ? <Image src={otro.foto} alt={otro.nombre} width={40} height={40} className="object-cover w-full h-full" />
                  : otro.nombre?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-semibold">{otro.nombre}</p>
                {primerProducto && <p className="text-blue-200 text-xs truncate">{primerProducto.nombre}</p>}
              </div>
            </>
          )}
        </div>

        {/* Producto */}
        {primerProducto && (
          <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden relative flex-shrink-0 bg-gray-100">
              {primerProducto.imagenes?.[0] && (
                <Image src={primerProducto.imagenes[0]} alt={primerProducto.nombre} fill className="object-cover" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 truncate">{primerProducto.nombre}</p>
              <p className="text-sabana-azul text-sm font-bold">${primerProducto.precio?.toLocaleString("es-CO")}</p>
            </div>
            <Link href="/checkout" className="ml-auto btn-primary py-1.5 px-3 text-xs flex-shrink-0">Ver carrito</Link>
          </div>
        )}

        {/* Mensajes */}
        <div ref={contenedorRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {mensajes.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-8">Inicia la conversación 👋</div>
          )}
          {mensajes.map((m) => {
            const esMio = m.emisor?._id === usuario?.id || m.emisor === usuario?.id;
            const estaEditando = editando === m._id;
            const esteMenuAbierto = menuAbierto === m._id;

            return (
              <div key={m._id} className={`flex items-end gap-2 ${esMio ? "flex-row-reverse" : "flex-row"}`}>
                {!esMio && (
                  <div className="w-7 h-7 rounded-full bg-sabana-azul flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                    {m.emisor?.foto
                      ? <Image src={m.emisor.foto} alt="" width={28} height={28} className="object-cover w-full h-full" />
                      : m.emisor?.nombre?.charAt(0)}
                  </div>
                )}

                <div className={`flex items-end gap-1 ${esMio ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Burbuja */}
                  <div className={`max-w-xs sm:max-w-sm px-4 py-2.5 rounded-2xl text-sm shadow-sm ${esMio ? "bg-sabana-azul text-white rounded-br-md" : "bg-white text-gray-800 rounded-bl-md"}`}>
                    {estaEditando ? (
                      <div className="flex items-center gap-2 min-w-48">
                        <input
                          autoFocus
                          value={textoEditar}
                          onChange={e => setTextoEditar(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") handleEditar(m._id);
                            if (e.key === "Escape") setEditando(null);
                          }}
                          className="text-gray-900 text-sm rounded-lg px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-sabana-azul w-full"
                        />
                        <button onClick={() => handleEditar(m._id)} className="text-green-400 hover:text-green-300 flex-shrink-0">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditando(null)} className="text-red-400 hover:text-red-300 flex-shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="leading-relaxed">{m.texto}</p>
                        <div className={`flex items-center gap-1 mt-1 ${esMio ? "justify-end" : "justify-start"}`}>
                          <p className={`text-xs ${esMio ? "text-blue-200" : "text-gray-400"}`}>
                            {new Date(m.createdAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          {m.editado && <p className={`text-xs ${esMio ? "text-blue-300" : "text-gray-400"}`}>· editado</p>}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Tres puntos — solo mis mensajes */}
                  {esMio && !estaEditando && (
                    <div
                      className="relative flex-shrink-0 mb-1"
                      ref={el => { menuRefs.current[m._id] = el; }}
                    >
                      <button
                        onMouseDown={e => {
                          e.stopPropagation();
                          setMenuAbierto(esteMenuAbierto ? null : m._id);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {esteMenuAbierto && (
                        <div className="absolute bottom-7 right-0 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 w-32">
                          <button
                            onMouseDown={() => iniciarEdicion(m)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                          >
                            <Pencil className="w-3.5 h-3.5 text-sabana-azul" /> Editar
                          </button>
                          <button
                            onMouseDown={() => handleEliminar(m._id)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 w-full"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <form onSubmit={handleEnviar} className="p-4 bg-white border-t border-gray-100 flex gap-3">
          <input
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sabana-azul"
          />
          <button
            type="submit"
            disabled={!texto.trim() || enviando}
            className="bg-sabana-azul text-white p-3 rounded-2xl hover:bg-sabana-azul-hover transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {enviando
              ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin block" />
              : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}