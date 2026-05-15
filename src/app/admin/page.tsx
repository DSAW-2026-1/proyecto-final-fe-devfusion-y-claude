"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Users, Package, Flag, BarChart3, Ban, CheckCircle, Trash2 } from "lucide-react";

type Tab = "dashboard" | "usuarios" | "productos" | "reportes";

export default function AdminPage() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [metricas, setMetricas] = useState<any>(null);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [reportes, setReportes] = useState<any[]>([]);

  useEffect(() => {
    if (!cargando) {
      if (!usuario) { router.push("/login"); return; }
      if (usuario.rol !== "admin") { router.push("/"); toast.error("Acceso denegado"); }
    }
  }, [usuario, cargando]);

  useEffect(() => {
    if (usuario?.rol !== "admin") return;
    api.get("/admin/dashboard").then(({ data }) => setMetricas(data)).catch(() => {});
  }, [usuario]);

  useEffect(() => {
    if (usuario?.rol !== "admin") return;
    if (tab === "usuarios") api.get("/admin/usuarios").then(({ data }) => setUsuarios(data)).catch(() => {});
    if (tab === "productos") api.get("/admin/productos").then(({ data }) => setProductos(data)).catch(() => {});
    if (tab === "reportes") api.get("/admin/reportes").then(({ data }) => setReportes(data)).catch(() => {});
  }, [tab, usuario]);

  const bloquearUsuario = async (id: string, bloqueado: boolean) => {
    try {
      await api.put(`/admin/usuarios/${id}/${bloqueado ? "desbloquear" : "bloquear"}`);
      setUsuarios((prev) => prev.map((u) => u._id === id ? { ...u, bloqueado: !bloqueado } : u));
      toast.success(bloqueado ? "Usuario desbloqueado" : "Usuario bloqueado");
    } catch { toast.error("Error al actualizar usuario"); }
  };

  const eliminarProducto = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await api.delete(`/admin/productos/${id}`);
      setProductos((prev) => prev.map((p) => p._id === id ? { ...p, activo: false } : p));
      toast.success("Producto eliminado");
    } catch { toast.error("Error al eliminar producto"); }
  };

  const actualizarReporte = async (id: string, estado: string) => {
    try {
      await api.put(`/admin/reportes/${id}`, { estado });
      setReportes((prev) => prev.map((r) => r._id === id ? { ...r, estado } : r));
      toast.success("Reporte actualizado");
    } catch { toast.error("Error al actualizar reporte"); }
  };

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "usuarios", label: "Usuarios", icon: Users },
    { id: "productos", label: "Productos", icon: Package },
    { id: "reportes", label: "Reportes", icon: Flag },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-sabana-dorado rounded-xl flex items-center justify-center"><BarChart3 className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-gray-900">Panel de Administrador</h1><p className="text-gray-500 text-sm">Universidad de La Sabana — Marketplace</p></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-8 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === id ? "bg-white text-sabana-azul shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {tab === "dashboard" && metricas && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: "Usuarios registrados", valor: metricas.totalUsuarios, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Productos activos", valor: metricas.totalProductos, icon: Package, color: "text-green-600", bg: "bg-green-50" },
            { label: "Órdenes totales", valor: metricas.totalOrdenes, icon: BarChart3, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Reportes pendientes", valor: metricas.reportesPendientes, icon: Flag, color: "text-red-600", bg: "bg-red-50" },
          ].map(({ label, valor, icon: Icon, color, bg }) => (
            <div key={label} className="card p-6">
              <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}><Icon className={`w-6 h-6 ${color}`} /></div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{valor ?? "—"}</p>
              <p className="text-gray-500 text-sm">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Usuarios */}
      {tab === "usuarios" && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{["Usuario", "Correo", "Carrera", "Rol", "Estado", "Acciones"].map((h) => <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {usuarios.map((u) => (
                  <tr key={u._id} className={`hover:bg-gray-50 transition-colors ${u.bloqueado ? "opacity-60" : ""}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-sabana-azul flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                          {u.foto ? <Image src={u.foto} alt={u.nombre} width={32} height={32} className="object-cover w-full h-full" /> : u.nombre?.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{u.nombre}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{u.correo}</td>
                    <td className="py-3 px-4 text-gray-500">{u.carrera || "—"}</td>
                    <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.rol === "admin" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>{u.rol}</span></td>
                    <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.bloqueado ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>{u.bloqueado ? "Bloqueado" : "Activo"}</span></td>
                    <td className="py-3 px-4">
                      {u.rol !== "admin" && (
                        <button onClick={() => bloquearUsuario(u._id, u.bloqueado)}
                          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${u.bloqueado ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-red-50 text-red-700 hover:bg-red-100"}`}>
                          {u.bloqueado ? <><CheckCircle className="w-3.5 h-3.5" /> Desbloquear</> : <><Ban className="w-3.5 h-3.5" /> Bloquear</>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Productos */}
      {tab === "productos" && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{["Producto", "Vendedor", "Precio", "Categoría", "Estado", "Acciones"].map((h) => <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {productos.map((p) => (
                  <tr key={p._id} className={`hover:bg-gray-50 transition-colors ${!p.activo ? "opacity-50" : ""}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden relative flex-shrink-0">
                          {p.imagenes?.[0] && <Image src={p.imagenes[0]} alt={p.nombre} fill className="object-cover" />}
                        </div>
                        <span className="font-medium text-gray-900 truncate max-w-40">{p.nombre}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{p.vendedor?.nombre}</td>
                    <td className="py-3 px-4 font-semibold text-sabana-azul">${p.precio?.toLocaleString("es-CO")}</td>
                    <td className="py-3 px-4 text-gray-500">{p.categoria}</td>
                    <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.activo ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>{p.activo ? "Activo" : "Eliminado"}</span></td>
                    <td className="py-3 px-4">
                      {p.activo && (
                        <button onClick={() => eliminarProducto(p._id)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" /> Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reportes */}
      {tab === "reportes" && (
        <div className="space-y-4">
          {reportes.length === 0 ? (
            <div className="card p-12 text-center"><Flag className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No hay reportes</p></div>
          ) : reportes.map((r) => (
            <div key={r._id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.estado === "pendiente" ? "bg-yellow-100 text-yellow-700" : r.estado === "revisado" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{r.estado}</span>
                  <p className="text-sm text-gray-600 mt-2">Tipo: <span className="font-medium capitalize">{r.tipoObjetivo}</span> — Motivo: <span className="font-medium capitalize">{r.motivo.replace("_", " ")}</span></p>
                  <p className="text-sm text-gray-500">Reportado por: {r.reportadoPor?.nombre}</p>
                  {r.descripcion && <p className="text-sm text-gray-500 mt-1">"{r.descripcion}"</p>}
                </div>
                <div className="flex gap-2">
                  {r.estado !== "revisado" && <button onClick={() => actualizarReporte(r._id, "revisado")} className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium">Revisar</button>}
                  {r.estado !== "resuelto" && <button onClick={() => actualizarReporte(r._id, "resuelto")} className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium">Resolver</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
