"use client";
import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Upload, X, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

const CATEGORIAS = ["Libros", "Electrónica", "Ropa", "Deportes", "Alimentos", "Servicios", "Otros"];

export default function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { usuario, cargando } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ nombre: "", descripcion: "", precio: "", categoria: "Libros", estado: "nuevo" });
  const [imagenesExistentes, setImagenesExistentes] = useState<string[]>([]);
  const [imagenesNuevas, setImagenesNuevas] = useState<File[]>([]);
  const [previewsNuevos, setPreviewsNuevos] = useState<string[]>([]);
  const [cargandoProducto, setCargandoProducto] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // Redirigir si no hay sesión
  useEffect(() => { if (!cargando && !usuario) router.push("/login"); }, [usuario, cargando]);

  // Cargar datos del producto
  useEffect(() => {
    if (!id) return;
    api.get(`/productos/${id}`)
      .then(({ data }) => {
        // Verificar que el usuario es el dueño
        if (usuario && data.vendedor._id !== usuario.id) {
          toast.error("No tienes permiso para editar este producto");
          router.push("/");
          return;
        }
        setForm({
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio: String(data.precio),
          categoria: data.categoria,
          estado: data.estado,
        });
        setImagenesExistentes(data.imagenes || []);
      })
      .catch(() => { toast.error("Producto no encontrado"); router.push("/"); })
      .finally(() => setCargandoProducto(false));
  }, [id, usuario]);

  const handleImagenesNuevas = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalActual = imagenesExistentes.length + imagenesNuevas.length;
    if (totalActual + files.length > 5) return toast.error("Máximo 5 imágenes en total");
    const nuevas = [...imagenesNuevas, ...files];
    setImagenesNuevas(nuevas);
    setPreviewsNuevos(nuevas.map((f) => URL.createObjectURL(f)));
  };

  const eliminarExistente = (i: number) => {
    setImagenesExistentes((prev) => prev.filter((_, idx) => idx !== i));
  };

  const eliminarNueva = (i: number) => {
    const nuevas = imagenesNuevas.filter((_, idx) => idx !== i);
    setImagenesNuevas(nuevas);
    setPreviewsNuevos(nuevas.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalImagenes = imagenesExistentes.length + imagenesNuevas.length;
    if (totalImagenes === 0) return toast.error("Debes tener al menos una imagen");
    if (Number(form.precio) <= 0) return toast.error("El precio debe ser mayor a 0");
    setEnviando(true);
    try {
      const fd = new FormData();
      fd.append("nombre", form.nombre);
      fd.append("descripcion", form.descripcion);
      fd.append("precio", form.precio);
      fd.append("categoria", form.categoria);
      fd.append("estado", form.estado);
      // Si quedan imágenes existentes y no hay nuevas, las mandamos como referencia
      if (imagenesNuevas.length > 0) {
        imagenesNuevas.forEach((img) => fd.append("imagenes", img));
      }
      await api.put(`/productos/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("¡Producto actualizado exitosamente!");
      router.push(`/producto/${id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error al actualizar el producto");
    } finally { setEnviando(false); }
  };

  if (cargandoProducto) return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
      <div className="card p-6 h-48 mb-6" />
      <div className="card p-6 h-64" />
    </div>
  );

  const totalImagenes = imagenesExistentes.length + imagenesNuevas.length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href={`/producto/${id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-sabana-azul text-sm mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al producto
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Editar producto</h1>
        <p className="text-gray-500 mt-2">Modifica los campos que quieras actualizar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Imágenes */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Fotos del producto</h2>
          <p className="text-gray-400 text-xs mb-4">Las imágenes actuales se mantienen si no agregas nuevas. Máximo 5 en total.</p>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
            {/* Imágenes existentes */}
            {imagenesExistentes.map((url, i) => (
              <div key={`exist-${i}`} className="relative aspect-square rounded-xl overflow-hidden group">
                <Image src={url} alt={`Imagen ${i + 1}`} fill className="object-cover" />
                <button type="button" onClick={() => eliminarExistente(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
                {i === 0 && imagenesNuevas.length === 0 && (
                  <span className="absolute bottom-1 left-1 bg-sabana-azul text-white text-xs px-1.5 py-0.5 rounded-full">Principal</span>
                )}
              </div>
            ))}

            {/* Imágenes nuevas */}
            {previewsNuevos.map((url, i) => (
              <div key={`nueva-${i}`} className="relative aspect-square rounded-xl overflow-hidden group">
                <Image src={url} alt={`Nueva ${i + 1}`} fill className="object-cover" />
                <button type="button" onClick={() => eliminarNueva(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
                <span className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">Nueva</span>
              </div>
            ))}

            {/* Botón agregar */}
            {totalImagenes < 5 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-sabana-azul flex flex-col items-center justify-center cursor-pointer transition-colors group">
                <Plus className="w-6 h-6 text-gray-400 group-hover:text-sabana-azul" />
                <span className="text-xs text-gray-400 group-hover:text-sabana-azul mt-1">Agregar</span>
                <input type="file" accept="image/*" multiple onChange={handleImagenesNuevas} className="hidden" />
              </label>
            )}
          </div>

          {imagenesNuevas.length > 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              ⚠️ Al guardar con imágenes nuevas, se reemplazarán todas las fotos anteriores.
            </p>
          )}
        </div>

        {/* Información */}
        <div className="card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Información del producto</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título <span className="text-red-500">*</span></label>
            <input type="text" required value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Libro de Cálculo Integral - Larson 9° edición"
              className="input-field" maxLength={100} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción <span className="text-red-500">*</span></label>
            <textarea required value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Describe tu producto: estado, detalles, por qué lo vendes..."
              className="input-field h-32 resize-none" maxLength={1000} />
            <p className="text-gray-400 text-xs mt-1">{form.descripcion.length}/1000 caracteres</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Precio (COP) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                <input type="number" required min="0" value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })}
                  placeholder="0" className="input-field pl-8" />
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

        <div className="flex gap-4">
          <Link href={`/producto/${id}`} className="flex-1 btn-outline flex items-center justify-center gap-2">
            Cancelar
          </Link>
          <button type="submit" disabled={enviando} className="flex-1 btn-primary flex items-center justify-center gap-2 py-4 text-base">
            {enviando
              ? <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Guardando...</>
              : <><Upload className="w-5 h-5" /> Guardar cambios</>}
          </button>
        </div>
      </form>
    </div>
  );
}