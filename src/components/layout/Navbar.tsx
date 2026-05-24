"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Bell, ChevronDown, LogOut, User, Package, MessageSquare, ShieldCheck, Menu, X, Search } from "lucide-react";
import api from "@/lib/api";

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const { cantidad } = useCart();
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [userMenuAbierto, setUserMenuAbierto] = useState(false);
  const [notifAbierto, setNotifAbierto] = useState(false);
  const [notifs, setNotifs] = useState(0);
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);
  const [listaNotifs, setListaNotifs] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchContadores = useCallback(async () => {
    if (!usuario) return;
    try {
      const [{ data: n }, { data: m }] = await Promise.all([
        api.get("/notificaciones/count"),
        api.get("/chat/count"),
      ]);
      setNotifs(n.count);
      setMensajesNoLeidos(m.count);
    } catch {}
  }, [usuario]);

  useEffect(() => {
    fetchContadores();
    const interval = setInterval(fetchContadores, 15000);
    return () => clearInterval(interval);
  }, [fetchContadores]);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuAbierto(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifAbierto(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const abrirNotificaciones = async () => {
    setNotifAbierto(!notifAbierto);
    if (!notifAbierto) {
      try {
        const { data } = await api.get("/notificaciones");
        setListaNotifs(data);
      } catch {}
    }
  };

  const marcarLeida = async (id: string) => {
    try {
      await api.put(`/notificaciones/${id}/leer`);
      setListaNotifs(prev => prev.map(n => n._id === id ? { ...n, leida: true } : n));
      setNotifs(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const marcarTodasLeidas = async () => {
    try {
      await api.put("/notificaciones/todas-leidas");
      setListaNotifs(prev => prev.map(n => ({ ...n, leida: true })));
      setNotifs(0);
    } catch {}
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    if (busqueda.trim()) { router.push(`/?q=${encodeURIComponent(busqueda)}`); setBusqueda(""); }
  };

  const handleLogout = () => { logout(); router.push("/"); setUserMenuAbierto(false); };

  const iconoNotif = (tipo: string) => {
    if (tipo === "compra") return "🛍️";
    if (tipo === "resena") return "⭐";
    if (tipo === "estado") return "📦";
    return "🔔";
  };

  return (
    <nav className="bg-sabana-azul shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
              <Image src="/images/logo-unisabana.jpg" alt="Logo Unisabana" width={36} height={36} className="object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-bold text-lg leading-tight block">UnisabanaMarket</span>
              <span className="text-sabana-dorado text-xs font-medium">Universidad de La Sabana</span>
            </div>
          </Link>

          {/* Búsqueda desktop */}
          <form onSubmit={handleBuscar} className="hidden md:flex flex-1 max-w-lg mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-sabana-dorado text-gray-900 text-sm" />
            </div>
          </form>

          {/* Acciones desktop */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/publicar" className="bg-sabana-dorado text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all">
              + Publicar
            </Link>

            {usuario ? (
              <>
                {/* Carrito */}
                <Link href="/checkout" className="relative p-2 text-white hover:text-sabana-dorado transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {cantidad > 0 && <span className="absolute -top-1 -right-1 bg-sabana-dorado text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{cantidad}</span>}
                </Link>

                {/* Mensajes */}
                <Link href="/mensajes" className="relative p-2 text-white hover:text-sabana-dorado transition-colors">
                  <MessageSquare className="w-5 h-5" />
                  {mensajesNoLeidos > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {mensajesNoLeidos > 9 ? "9+" : mensajesNoLeidos}
                    </span>
                  )}
                </Link>

                {/* Notificaciones dropdown */}
                <div className="relative" ref={notifRef}>
                  <button onClick={abrirNotificaciones} className="relative p-2 text-white hover:text-sabana-dorado transition-colors">
                    <Bell className="w-5 h-5" />
                    {notifs > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {notifs > 9 ? "9+" : notifs}
                      </span>
                    )}
                  </button>

                  {notifAbierto && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <span className="font-semibold text-gray-900 text-sm">Notificaciones</span>
                        {notifs > 0 && (
                          <button onClick={marcarTodasLeidas} className="text-xs text-sabana-azul hover:underline font-medium">
                            Marcar todas como leídas
                          </button>
                        )}
                      </div>

                      {/* Lista */}
                      <div className="max-h-80 overflow-y-auto">
                        {listaNotifs.length === 0 ? (
                          <div className="text-center py-8 text-gray-400 text-sm">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            No tienes notificaciones
                          </div>
                        ) : (
                          listaNotifs.map((n) => (
                            <button
                              key={n._id}
                              onClick={() => { marcarLeida(n._id); if (n.enlace) router.push(n.enlace); setNotifAbierto(false); }}
                              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 flex items-start gap-3 ${!n.leida ? "bg-blue-50" : ""}`}
                            >
                              <span className="text-lg flex-shrink-0 mt-0.5">{iconoNotif(n.tipo)}</span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm leading-snug ${!n.leida ? "font-semibold text-gray-900" : "font-normal text-gray-700"}`}>
                                  {n.titulo}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.mensaje}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(n.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                              {!n.leida && <span className="w-2 h-2 bg-sabana-azul rounded-full flex-shrink-0 mt-1.5" />}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Usuario menu */}
                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setUserMenuAbierto(!userMenuAbierto)} className="flex items-center gap-2 text-white hover:text-sabana-dorado transition-colors p-2 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-sabana-dorado flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                      {usuario.foto ? <Image src={usuario.foto} alt={usuario.nombre} width={32} height={32} className="object-cover w-full h-full" /> : usuario.nombre.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium hidden lg:block max-w-24 truncate">{usuario.nombre}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {userMenuAbierto && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                      <Link href={`/perfil/${usuario.id}`} onClick={() => setUserMenuAbierto(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                        <User className="w-4 h-4 text-sabana-azul" /> Mi perfil
                      </Link>
                      <Link href="/mis-compras" onClick={() => setUserMenuAbierto(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                        <Package className="w-4 h-4 text-sabana-azul" /> Mis compras
                      </Link>
                      <Link href="/mis-ventas" onClick={() => setUserMenuAbierto(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                        <Package className="w-4 h-4 text-sabana-azul" /> Mis ventas
                      </Link>
                      <Link href="/mensajes" onClick={() => setUserMenuAbierto(false)} className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                        <MessageSquare className="w-4 h-4 text-sabana-azul" /> Mensajes
                        {mensajesNoLeidos > 0 && <span className="ml-auto bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{mensajesNoLeidos}</span>}
                      </Link>
                      {usuario.rol === "admin" && (
                        <Link href="/admin" onClick={() => setUserMenuAbierto(false)} className="flex items-center gap-3 px-4 py-2.5 text-sabana-dorado hover:bg-yellow-50 transition-colors text-sm font-semibold">
                          <ShieldCheck className="w-4 h-4" /> Panel Admin
                        </Link>
                      )}
                      <hr className="my-2 border-gray-100" />
                      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors text-sm w-full">
                        <LogOut className="w-4 h-4" /> Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-white hover:text-sabana-dorado text-sm font-medium transition-colors px-3 py-2">Iniciar sesión</Link>
                <Link href="/registro" className="bg-white text-sabana-azul px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">Registrarse</Link>
              </div>
            )}
          </div>

          {/* Hamburguesa móvil */}
          <button className="md:hidden text-white p-2" onClick={() => setMenuAbierto(!menuAbierto)}>
            {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menú móvil */}
        {menuAbierto && (
          <div className="md:hidden pb-4 border-t border-blue-700 pt-4">
            <form onSubmit={handleBuscar} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar productos..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-sabana-dorado text-gray-900 text-sm" />
              </div>
            </form>
            <div className="flex flex-col gap-1">
              <Link href="/publicar" onClick={() => setMenuAbierto(false)} className="bg-sabana-dorado text-white px-4 py-2.5 rounded-xl text-sm font-semibold text-center">+ Publicar producto</Link>
              {usuario ? (
                <>
                  <Link href={`/perfil/${usuario.id}`} onClick={() => setMenuAbierto(false)} className="text-white py-2.5 px-4 hover:bg-blue-700 rounded-xl text-sm">Mi perfil</Link>
                  <Link href="/mis-compras" onClick={() => setMenuAbierto(false)} className="text-white py-2.5 px-4 hover:bg-blue-700 rounded-xl text-sm">Mis compras</Link>
                  <Link href="/mis-ventas" onClick={() => setMenuAbierto(false)} className="text-white py-2.5 px-4 hover:bg-blue-700 rounded-xl text-sm">Mis ventas</Link>
                  <Link href="/mensajes" onClick={() => setMenuAbierto(false)} className="text-white py-2.5 px-4 hover:bg-blue-700 rounded-xl text-sm flex items-center justify-between">
                    Mensajes
                    {mensajesNoLeidos > 0 && <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{mensajesNoLeidos}</span>}
                  </Link>
                  <Link href="/checkout" onClick={() => setMenuAbierto(false)} className="text-white py-2.5 px-4 hover:bg-blue-700 rounded-xl text-sm flex items-center justify-between">
                    Carrito
                    {cantidad > 0 && <span className="bg-sabana-dorado text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{cantidad}</span>}
                  </Link>
                  {usuario.rol === "admin" && <Link href="/admin" onClick={() => setMenuAbierto(false)} className="text-sabana-dorado py-2.5 px-4 hover:bg-blue-700 rounded-xl text-sm font-semibold">Panel Admin</Link>}
                  <button onClick={handleLogout} className="text-red-300 py-2.5 px-4 hover:bg-blue-700 rounded-xl text-sm text-left">Cerrar sesión</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuAbierto(false)} className="text-white py-2.5 px-4 hover:bg-blue-700 rounded-xl text-sm">Iniciar sesión</Link>
                  <Link href="/registro" onClick={() => setMenuAbierto(false)} className="text-white py-2.5 px-4 hover:bg-blue-700 rounded-xl text-sm">Registrarse</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}