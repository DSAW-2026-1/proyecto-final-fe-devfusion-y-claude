"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Star, Package, Edit2, CheckCircle } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";

export default function PerfilClient({ id }: { id: string }) {
  const { usuario, actualizarUsuario } = useAuth();
  const [perfil, setPerfil] = useState<any>(null);
  const [productos, setProductos] = useState<any[]>([]);
  const [resenas, setResenas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [editForm, setEditForm] = useState({ nombre: "", carrera: "" });
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState("");
  const [guardando, setGuardando] = useState(false);
  const esMiPerfil = usuario?.id === id;

  useEffect(() => {
    const cargar = async () => {
      try {
        const [{ data: u }, { data: prods }, { data: revs }] = await Promise.all([
          api.get(`/auth/usuario/${id}`),
          api.get(`/productos?vendedor=${id}`),
          api.get(`/resenas/vendedor/${id}`),
        ]);
        setPerfil(u);
        setProductos(prods.productos || []);
        setResenas(revs);
        setEditForm({ nombre: u.nombre, carrera: u.carrera || "" });
      } catch { toast.error("Usuario no encontrado"); }
      finally { setCargando(false); }
    };
    cargar();
  }, [id]);

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFotoFile(f);
    setFotoPreview(URL.createObjectURL(f));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const fd = new FormData();
      fd.append("nombre", editForm.nombre);
      fd.append("carrera", editForm.carrera);
      if (fotoFile) fd.append("foto", fotoFile);
      const { data } = await api.put("/auth/perfil", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setPerfil(data.usuario);
      actualizarUsuario({ nombre: data.usuario.nombre, carrera: data.usuario.carrera, foto: data.usuario.foto });
      toast.success("Perfil actualizado");
      setEditando(false);
    } catch { toast.error("Error al actualizar perfil"); }
    finally { setGuardando(false); }
  };

  if (cargando) return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
      <div className="card p-8 flex items-center gap-6 mb-8">
        <div className="w-24 h-24 rounded-full bg-gray-200" />
        <div className="space-y-3 flex-1"><div className="h-6 bg-gray-200 rounded w-48" /><div className="h-4 bg-gray-200 rounded w-32" /></div>
      </div>
    </div>
  );
  if (!perfil) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Perfil header */}
      <div className="card p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-sabana-azul flex items-center justify-center text-white font-bold text-3xl overflow-hidden">
              {(fotoPreview || perfil.foto) ? <Image src={fotoPreview || perfil.foto} alt={perfil.nombre} width={96} height={96} className="object-cover w-full h-full" /> : perfil.nombre.charAt(0).toUpperCase()}
            </div>
            {editando && (
              <label className="absolute bottom-0 right-0 bg-sabana-azul text-white p-1.5 rounded-full cursor-pointer hover:bg-sabana-azul-hover shadow">
                <Edit2 className="w-3.5 h-3.5" />
                <input type="file" accept="image/*" onChange={handleFoto} className="hidden" />
              </label>
            )}
          </div>
          <div className="flex-1">
            {editando ? (
              <div className="space-y-3">
                <input value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} className="input-field text-xl font-bold" placeholder="Tu nombre" />
                <input value={editForm.carrera} onChange={(e) => setEditForm({ ...editForm, carrera: e.target.value })} className="input-field" placeholder="Tu carrera (opcional)" />
                <div className="flex gap-3">
                  <button onClick={handleGuardar} disabled={guardando} className="btn-primary py-2 flex items-center gap-2 text-sm">
                    {guardando ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />} Guardar
                  </button>
                  <button onClick={() => setEditando(false)} className="btn-outline py-2 text-sm">Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{perfil.nombre}</h1>
                  {esMiPerfil && <button onClick={() => setEditando(true)} className="text-gray-400 hover:text-sabana-azul transition-colors"><Edit2 className="w-4 h-4" /></button>}
                </div>
                {perfil.carrera && <p className="text-gray-500 mb-2">{perfil.carrera}</p>}
                {perfil.reputacion > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex">{[1,2,3,4,5].map((s) => <Star key={s} className={`w-4 h-4 ${s <= Math.round(perfil.reputacion) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />)}</div>
                    <span className="text-gray-600 text-sm font-medium">{perfil.reputacion.toFixed(1)} ({perfil.totalResenas} reseñas)</span>
                  </div>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Package className="w-4 h-4" /> {productos.length} productos</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Productos */}
      {productos.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Productos publicados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {productos.map((p) => <ProductCard key={p._id} producto={p} />)}
          </div>
        </section>
      )}

      {/* Reseñas */}
      {resenas.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Reseñas recibidas ({resenas.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resenas.map((r) => (
              <div key={r._id} className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-sabana-azul flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                    {r.comprador?.foto ? <Image src={r.comprador.foto} alt="" width={36} height={36} className="object-cover w-full h-full" /> : r.comprador?.nombre?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{r.comprador?.nombre}</p>
                    <div className="flex">{[1,2,3,4,5].map((s) => <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />)}</div>
                  </div>
                </div>
                {r.comentario && <p className="text-gray-600 text-sm">{r.comentario}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
