"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, ShoppingCart, MessageCircle, Flag, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

export default function ProductoDetalleClient({ id }: { id: string }) {
  const { usuario } = useAuth();
  const { agregarItem, items } = useCart();
  const router = useRouter();
  const [producto, setProducto] = useState<any>(null);
  const [resenas, setResenas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [imgActiva, setImgActiva] = useState(0);
  const [enviandoChat, setEnviandoChat] = useState(false);
  const [mostrarReporte, setMostrarReporte] = useState(false);
  const [motivoReporte, setMotivoReporte] = useState("spam");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: prod } = await api.get(`/productos/${id}`);
        setProducto(prod);
        const { data: resenasVendedor } = await api.get(`/resenas/vendedor/${prod.vendedor._id}`);
        setResenas(resenasVendedor);
      } catch { toast.error("Producto no encontrado"); router.push("/"); }
      finally { setCargando(false); }
    };
    fetchData();
  }, [id]);

  const enCarrito = items.some((i) => i.productoId === id);

  const handleAgregarCarrito = () => {
    if (!usuario) { toast.error("Inicia sesión para agregar al carrito"); router.push("/login"); return; }
    if (producto.vendedor._id === usuario.id) { toast.error("No puedes comprar tu propio producto"); return; }
    agregarItem({ productoId: id, nombre: producto.nombre, precio: producto.precio, imagen: producto.imagenes[0] || "", vendedorNombre: producto.vendedor.nombre });
    toast.success("Producto agregado al carrito 🛒");
  };

  const handleContactarVendedor = async () => {
    if (!usuario) { toast.error("Inicia sesión para contactar al vendedor"); router.push("/login"); return; }
    if (producto.vendedor._id === usuario.id) { toast.error("Este es tu propio producto"); return; }
    setEnviandoChat(true);
    try {
      const { data } = await api.get(`/chat/producto/${id}`);
      router.push(`/mensajes/${data._id}`);
    } catch { toast.error("Error al abrir el chat"); }
    finally { setEnviandoChat(false); }
  };

  const handleReportar = async () => {
    if (!usuario) { toast.error("Inicia sesión para reportar"); router.push("/login"); return; }
    try {
      await api.post("/admin/reportes", { tipoObjetivo: "producto", productoId: id, motivo: motivoReporte });
      toast.success("Reporte enviado al administrador");
      setMostrarReporte(false);
    } catch { toast.error("Error al enviar reporte"); }
  };

  if (cargando) return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="h-96 bg-gray-200 rounded-2xl" />
        <div className="space-y-4"><div className="h-8 bg-gray-200 rounded w-3/4" /><div className="h-10 bg-gray-200 rounded w-1/3" /><div className="h-32 bg-gray-200 rounded" /></div>
      </div>
    </div>
  );
  if (!producto) return null;

  const botonesAccion = (
    <>
      {producto.vendedor._id !== usuario?.id && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <button onClick={handleAgregarCarrito} disabled={enCarrito}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all ${enCarrito ? "bg-green-100 text-green-700 cursor-default" : "btn-primary"}`}>
            {enCarrito ? <><CheckCircle className="w-5 h-5" /> En el carrito</> : <><ShoppingCart className="w-5 h-5" /> Agregar al carrito</>}
          </button>
          <button onClick={handleContactarVendedor} disabled={enviandoChat}
            className="flex-1 btn-outline flex items-center justify-center gap-2">
            {enviandoChat ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <MessageCircle className="w-5 h-5" />}
            Contactar vendedor
          </button>
        </div>
      )}
      {usuario?.id === producto.vendedor._id && (
        <div className="flex gap-3 mb-4">
          <button onClick={() => router.push(`/producto/${producto._id}/editar`)}
            className="flex items-center gap-2 text-sm bg-blue-50 text-sabana-azul px-4 py-2 rounded-xl font-medium hover:bg-blue-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Editar producto
          </button>
          <button onClick={async () => {
            if (!confirm("¿Seguro que quieres eliminar este producto?")) return;
            try { await api.delete(`/productos/${producto._id}`); toast.success("Producto eliminado"); router.push("/"); }
            catch { toast.error("Error al eliminar"); }
          }} className="flex items-center gap-2 text-sm bg-red-50 text-red-600 px-4 py-2 rounded-xl font-medium hover:bg-red-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            Eliminar
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-sabana-azul transition-colors">Inicio</Link>
        <span>/</span>
        <Link href={`/?categoria=${producto.categoria}`} className="hover:text-sabana-azul transition-colors">{producto.categoria}</Link>
        <span>/</span>
        <span className="text-gray-900 truncate max-w-48">{producto.nombre}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Imágenes */}
        <div>
          <div className="relative h-80 sm:h-96 lg:h-[450px] bg-gray-100 rounded-2xl overflow-hidden mb-3">
            <Image src={producto.imagenes[imgActiva] || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600"} alt={producto.nombre} fill className="object-contain" />
            {producto.imagenes.length > 1 && (
              <>
                <button onClick={() => setImgActiva((p) => (p - 1 + producto.imagenes.length) % producto.imagenes.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow transition-all">
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button onClick={() => setImgActiva((p) => (p + 1) % producto.imagenes.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow transition-all">
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </>
            )}
          </div>
          {producto.imagenes.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {producto.imagenes.map((img: string, i: number) => (
                <button key={i} onClick={() => setImgActiva(i)} className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === imgActiva ? "border-sabana-azul" : "border-gray-200"}`}>
                  <Image src={img} alt={`Imagen ${i + 1}`} width={64} height={64} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}

          {/* Botones debajo de imagen — solo móvil */}
          <div className="lg:hidden mt-4">
            <div className="flex items-center gap-2 mb-3">
              <span className={producto.estado === "nuevo" ? "badge-nuevo" : "badge-usado"}>{producto.estado === "nuevo" ? "Nuevo" : "Usado"}</span>
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">{producto.categoria}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{producto.nombre}</h1>
            <p className="text-3xl font-bold text-sabana-azul mb-4">${producto.precio.toLocaleString("es-CO")}</p>
            {botonesAccion}
          </div>
        </div>

        {/* Info — desktop */}
        <div>
          {/* Badges, título y precio — solo desktop */}
          <div className="hidden lg:block">
            <div className="flex items-center gap-2 mb-3">
              <span className={producto.estado === "nuevo" ? "badge-nuevo" : "badge-usado"}>{producto.estado === "nuevo" ? "Nuevo" : "Usado"}</span>
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">{producto.categoria}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{producto.nombre}</h1>
            <p className="text-4xl font-bold text-sabana-azul mb-4">${producto.precio.toLocaleString("es-CO")}</p>
            {botonesAccion}
          </div>

          {/* Descripción — siempre visible */}
          <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-line">{producto.descripcion}</p>

          {/* Vendedor */}
          <Link href={`/perfil/${producto.vendedor._id}`} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors mb-4">
            <div className="w-14 h-14 rounded-full bg-sabana-azul flex items-center justify-center text-white font-bold text-xl overflow-hidden flex-shrink-0">
              {producto.vendedor.foto
                ? <Image src={producto.vendedor.foto} alt={producto.vendedor.nombre} width={56} height={56} className="object-cover w-full h-full" />
                : producto.vendedor.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{producto.vendedor.nombre}</p>
              {producto.vendedor.carrera && <p className="text-gray-500 text-sm">{producto.vendedor.carrera}</p>}
              {producto.vendedor.reputacion > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  {[1,2,3,4,5].map((s) => <Star key={s} className={`w-4 h-4 ${s <= Math.round(producto.vendedor.reputacion) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />)}
                  <span className="text-sm text-gray-600 ml-1">{producto.vendedor.reputacion.toFixed(1)} ({producto.vendedor.totalResenas} reseñas)</span>
                </div>
              )}
            </div>
          </Link>

          <button onClick={() => setMostrarReporte(!mostrarReporte)} className="flex items-center gap-2 text-gray-400 hover:text-red-500 text-sm transition-colors">
            <Flag className="w-4 h-4" /> Reportar este producto
          </button>
          {mostrarReporte && (
            <div className="mt-3 p-4 bg-red-50 rounded-xl border border-red-100">
              <select value={motivoReporte} onChange={(e) => setMotivoReporte(e.target.value)} className="input-field mb-3 text-sm">
                <option value="spam">Spam</option>
                <option value="fraude">Fraude</option>
                <option value="contenido_inapropiado">Contenido inapropiado</option>
                <option value="precio_abusivo">Precio abusivo</option>
                <option value="otro">Otro</option>
              </select>
              <button onClick={handleReportar} className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors">Enviar reporte</button>
            </div>
          )}
        </div>
      </div>

      {/* Reseñas */}
      {resenas.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reseñas del vendedor ({resenas.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resenas.map((r) => (
              <div key={r._id} className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-sabana-azul flex items-center justify-center text-white font-bold overflow-hidden">
                    {r.comprador?.foto ? <Image src={r.comprador.foto} alt={r.comprador.nombre} width={40} height={40} className="object-cover w-full h-full" /> : r.comprador?.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{r.comprador?.nombre}</p>
                    <div className="flex">
                      {[1,2,3,4,5].map((s) => <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />)}
                    </div>
                  </div>
                </div>
                {r.comentario && <p className="text-gray-600 text-sm leading-relaxed">{r.comentario}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}