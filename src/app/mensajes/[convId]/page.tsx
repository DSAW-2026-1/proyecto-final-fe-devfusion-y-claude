"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Send, ArrowLeft, MoreVertical, Pencil, Trash2, Check, X, MessageSquare, AlertTriangle, Search } from "lucide-react";
import { use } from "react";

export default function ChatPage({ params }: { params: Promise<{ convId: string }> }) {
  const { convId } = use(params);
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const [conv, setConv] = useState<any>(null);
  const [convs, setConvs] = useState<any[]>([]);
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [textoEditar, setTextoEditar] = useState("");
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
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

  const fetchConvs = useCallback(async () => {
    try {
      const { data } = await api.get("/chat");
      setConvs(data);
      const c = data.find((c: any) => c._id === convId);
      if (c) setConv(c);
    } catch {}
  }, [convId]);

  useEffect(() => {
    if (!usuario) return;
    api.get(`/chat/${convId}/mensajes`)
      .then(({ data }) => { setMensajes(data); setTimeout(() => scrollAlFondo(true), 100); })
      .catch(() => { toast.error("Conversación no encontrada"); router.push("/mensajes"); });
    fetchConvs();
    intervalRef.current = setInterval(() => { fetchMensajes(); fetchConvs(); }, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [usuario, convId, fetchMensajes, fetchConvs, scrollAlFondo]);

  useEffect(() => {
    if (!menuAbierto) return;
    const handleClickFuera = (e: MouseEvent) => {
      const ref = menuRefs.current[menuAbierto];
      if (ref && !ref.contains(e.target as Node)) setMenuAbierto(null);
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

  const handleEliminarMensaje = async (msgId: string) => {
    try {
      await api.delete(`/chat/mensajes/${msgId}`);
      setMensajes(prev => prev.filter(m => m._id !== msgId));
      toast.success("Mensaje eliminado");
    } catch { toast.error("No se pudo eliminar el mensaje"); }
    setMenuAbierto(null);
  };

  const handleEliminarChat = async (convId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.delete(`/chat/${convId}`);
      toast.success("Conversación eliminada");
      router.push("/mensajes");
    } catch { toast.error("No se pudo eliminar la conversación"); }
    setConfirmando(null);
  };

  const iniciarEdicion = (m: any) => { setEditando(m._id); setTextoEditar(m.texto); setMenuAbierto(null); };

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

  const convsFiltradas = convs.filter(c => {
    if (!busqueda.trim()) return true;
    const esComprador = c.comprador?._id === usuario?.id;
    const otroC = esComprador ? c.vendedor : c.comprador;
    return otroC?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.productos?.[0]?.nombre?.toLowerCase().includes(busqueda.toLowerCase());
  });

  const PanelChat = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link href="/mensajes" className="lg:hidden text-gray-600 hover:text-sabana-azul transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        {otro && (
          <>
            <div className="w-10 h-10 rounded-full bg-sabana-azul flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
              {otro.foto
                ? <Image src={otro.foto} alt={otro.nombre} width={40} height={40} className="object-cover w-full h-full" />
                : otro.nombre?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{otro.nombre}</p>
              {primerProducto && <p className="text-gray-500 text-xs truncate">{primerProducto.nombre}</p>}
            </div>
          </>
        )}
        <button onClick={() => setConfirmando(convId)} className="ml-auto p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Eliminar chat">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Producto */}
      {primerProducto && (
        <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden relative flex-shrink-0 bg-gray-100">
            {primerProducto.imagenes?.[0] && <Image src={primerProducto.imagenes[0]} alt={primerProducto.nombre} fill className="object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{primerProducto.nombre}</p>
            <p className="text-sabana-azul text-sm font-bold">${primerProducto.precio?.toLocaleString("es-CO")}</p>
          </div>
          <Link href="/checkout" className="btn-primary py-1.5 px-3 text-xs flex-shrink-0">Ver carrito</Link>
        </div>
      )}

      {/* Mensajes */}
      <div ref={contenedorRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 min-w-0 w-full">
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
                  {m.emisor?.foto ? <Image src={m.emisor.foto} alt="" width={28} height={28} className="object-cover w-full h-full" /> : m.emisor?.nombre?.charAt(0)}
                </div>
              )}
              <div className={`flex items-end gap-1 ${esMio ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`max-w-[65vw] px-4 py-2.5 rounded-2xl text-sm shadow-sm break-words min-w-0 ${esMio ? "bg-sabana-azul text-white rounded-br-md" : "bg-white text-gray-800 rounded-bl-md"}`}>
                  {estaEditando ? (
                    <div className="flex items-center gap-2 min-w-48">
                      <input autoFocus value={textoEditar} onChange={e => setTextoEditar(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleEditar(m._id); if (e.key === "Escape") setEditando(null); }}
                        className="text-gray-900 text-sm rounded-lg px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-sabana-azul w-full" />
                      <button onClick={() => handleEditar(m._id)} className="text-green-400 hover:text-green-300 flex-shrink-0"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditando(null)} className="text-red-400 hover:text-red-300 flex-shrink-0"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <>
                      <p className="leading-relaxed whitespace-pre-line">{m.texto}</p>
                      <div className={`flex items-center gap-1 mt-1 ${esMio ? "justify-end" : "justify-start"}`}>
                        <p className={`text-xs ${esMio ? "text-blue-200" : "text-gray-400"}`}>
                          {new Date(m.createdAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {m.editado && <p className={`text-xs ${esMio ? "text-blue-300" : "text-gray-400"}`}>· editado</p>}
                      </div>
                    </>
                  )}
                </div>
                {esMio && !estaEditando && (
                  <div className="relative flex-shrink-0 mb-1" ref={el => { menuRefs.current[m._id] = el; }}>
                    <button onMouseDown={e => { e.stopPropagation(); setMenuAbierto(esteMenuAbierto ? null : m._id); }}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {esteMenuAbierto && (
                      <div className="absolute bottom-7 right-0 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 w-32">
                        <button onMouseDown={() => iniciarEdicion(m)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full">
                          <Pencil className="w-3.5 h-3.5 text-sabana-azul" /> Editar
                        </button>
                        <button onMouseDown={() => handleEliminarMensaje(m._id)} className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 w-full">
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
      <form onSubmit={handleEnviar} className="p-3 bg-white border-t border-gray-100 flex gap-2">
        <input type="text" value={texto} onChange={e => setTexto(e.target.value)} placeholder="Escribe un mensaje..."
          className="flex-1 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sabana-azul" />
        <button type="submit" disabled={!texto.trim() || enviando}
          className="bg-sabana-azul text-white p-2.5 rounded-2xl hover:opacity-90 transition-colors disabled:opacity-50 flex-shrink-0">
          {enviando ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin block" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Modal confirmación eliminar chat */}
      {confirmando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setConfirmando(null)}>
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
              <button onClick={e => handleEliminarChat(convId, e)} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors">Eliminar</button>
              <button onClick={() => setConfirmando(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: layout WhatsApp Web */}
      <div className="hidden lg:flex h-[calc(100vh-64px)]">
        {/* Panel izquierdo - lista */}
        <div className="w-80 xl:w-96 border-r border-gray-100 flex-shrink-0 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Mensajes</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar..."
                className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sabana-azul" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {convsFiltradas.map(c => {
              const esComprador = c.comprador?._id === usuario?.id;
              const otroC = esComprador ? c.vendedor : c.comprador;
              const tieneNoLeidos = c.noLeidos > 0;
              const estaActivo = c._id === convId;
              return (
                <div key={c._id} className="group relative">
                  <Link href={`/mensajes/${c._id}`}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${estaActivo ? "bg-blue-50 border-r-4 border-sabana-azul" : ""}`}>
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-sabana-azul flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                        {otroC?.foto ? <Image src={otroC.foto} alt={otroC.nombre} width={48} height={48} className="object-cover w-full h-full" /> : otroC?.nombre?.charAt(0).toUpperCase()}
                      </div>
                      {tieneNoLeidos && (
                        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                          {c.noLeidos > 9 ? "9+" : c.noLeidos}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${tieneNoLeidos ? "font-bold text-gray-900" : "font-medium text-gray-800"}`}>{otroC?.nombre}</p>
                        <p className="text-gray-400 text-xs flex-shrink-0 ml-2">{new Date(c.ultimaActividad).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}</p>
                      </div>
                      <p className="text-gray-400 text-xs truncate">{c.productos?.[0]?.nombre}</p>
                      {c.ultimoMensaje && <p className={`text-xs truncate ${tieneNoLeidos ? "font-semibold text-gray-600" : "text-gray-400"}`}>{c.ultimoMensaje}</p>}
                    </div>
                  </Link>
                  <button onClick={e => { e.preventDefault(); e.stopPropagation(); setConfirmando(c._id); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel derecho - chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {PanelChat}
        </div>
      </div>

      {/* Móvil: solo el chat */}
      <div className="lg:hidden fixed inset-0 top-16 flex flex-col bg-white z-40 overflow-hidden">
        {PanelChat}
      </div>
    </>
  );
}