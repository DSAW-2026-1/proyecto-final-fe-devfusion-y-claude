"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Upload, X, Plus } from "lucide-react";

const CATEGORIAS = ["Libros", "Electrónica", "Ropa", "Deportes", "Alimentos", "Servicios", "Otros"];

export default function PublicarPage() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ nombre: "", descripcion: "", precio: "", categoria: "Libros", estado: "nuevo" });
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => { if (!cargando && !usuario) router.push("/login"); }, [usuario, cargando]);

  const handleImagenes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (imagenes.length + files.length > 5) return toast.error("Máximo 5 imágenes");
    const nuevas = [...imagenes, ...files].slice(0, 5);
    setImagenes(nuevas);
    const urls = nuevas.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const eliminarImagen = (i: number) => {
    const nuevas = imagenes.filter((_, idx) => idx !== i);
    const nuevasPrev = previews.filter((_, idx) => idx !== i);
    setImagenes(nuevas); setPreviews(nuevasPrev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imagenes.length === 0) return toast.error("Agrega al menos una imagen");
    if (Number(form.precio) <= 0) return toast.error("El precio debe ser mayor a 0");
    setEnviando(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      imagenes.forEach((img) => fd.append("imagenes", img));
      const { data } = await api.post("/productos", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("¡Producto publicado exitosamente! 🎉");
      router.push(`/producto/${data.producto._id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error al publicar el producto");
    } finally { setEnviando(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Publicar producto</h1>
        <p className="text-gray-500 mt-2">Completa la información de tu producto para que otros estudiantes lo encuentren</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Imágenes */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Fotos del producto <span className="text-red-500">*</span></h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
            {previews.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                <Image src={url} alt={`Imagen ${i+1}`} fill className="object-cover" />
                <button type="button" onClick={() => eliminarImagen(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
                {i === 0 && <span className="absolute bottom-1 left-1 bg-sabana-azul text-white text-xs px-1.5 py-0.5 rounded-full">Principal</span>}
              </div>
            ))}
            {imagenes.length < 5 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-sabana-azul flex flex-col items-center justify-center cursor-pointer transition-colors group">
                <Plus className="w-6 h-6 text-gray-400 group-hover:text-sabana-azul" />
                <span className="text-xs text-gray-400 group-hover:text-sabana-azul mt-1">Foto</span>
                <input type="file" accept="image/*" multiple onChange={handleImagenes} className="hidden" />
              </label>
            )}
          </div>
          <p className="text-gray-400 text-xs">Máximo 5 fotos. La primera será la imagen principal. Formatos: JPG, PNG, WEBP.</p>
        </div>

        {/* Información */}
        <div className="card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Información del producto</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título <span className="text-red-500">*</span></label>
            <input type="text" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Libro de Cálculo Integral - Larson 9° edición" className="input-field" maxLength={100} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción <span className="text-red-500">*</span></label>
            <textarea required value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Describe tu producto: estado, detalles, por qué lo vendes..." className="input-field h-32 resize-none" maxLength={1000} />
            <p className="text-gray-400 text-xs mt-1">{form.descripcion.length}/1000 caracteres</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Precio (COP) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                <input type="number" required min="0" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} placeholder="0" className="input-field pl-8" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría <span className="text-red-500">*</span></label>
              <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="input-field">
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado <span className="text-red-500">*</span></label>
              <div className="flex gap-3">
                {["nuevo", "usado"].map((est) => (
                  <button key={est} type="button" onClick={() => setForm({ ...form, estado: est })}
                    className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all capitalize ${form.estado === est ? "border-sabana-azul bg-blue-50 text-sabana-azul" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                    {est}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={enviando} className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base">
          {enviando ? <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Publicando...</> : <><Upload className="w-5 h-5" /> Publicar producto</>}
        </button>
      </form>
    </div>
  );
}
