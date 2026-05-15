"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Eye, EyeOff, UserPlus, CheckCircle } from "lucide-react";

export default function RegistroPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ nombre: "", correo: "", password: "", confirmar: "", carrera: "" });
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  const correoValido = form.correo.endsWith("@unisabana.edu.co");
  const passwordOk = form.password.length >= 6;
  const confirmOk = form.password === form.confirmar && form.confirmar.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correoValido) return toast.error("El correo debe ser @unisabana.edu.co");
    if (!passwordOk) return toast.error("La contraseña debe tener al menos 6 caracteres");
    if (!confirmOk) return toast.error("Las contraseñas no coinciden");
    setCargando(true);
    try {
      const { data } = await api.post("/auth/registro", { nombre: form.nombre, correo: form.correo, password: form.password, carrera: form.carrera });
      login(data.token, data.usuario);
      toast.success("¡Cuenta creada! Bienvenido a UnisabanaMarket 🎉");
      router.push("/");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error al crear cuenta");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-sabana-azul relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <Image src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=1000&fit=crop" alt="Campus" fill className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-sabana-azul via-sabana-azul/70 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
              <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Escudo_Universidad_de_La_Sabana.svg/200px-Escudo_Universidad_de_La_Sabana.svg.png"
                alt="Logo" width={44} height={44} className="object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            <div>
              <p className="font-bold text-xl">UnisabanaMarket</p>
              <p className="text-sabana-dorado text-sm">Universidad de La Sabana</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Únete a la comunidad<br />de compra y venta</h2>
          <div className="space-y-3 text-blue-200">
            {["Publica gratis tus productos", "Contacta vendedores directamente", "Sistema de reseñas y confianza", "Solo para la comunidad Unisabana"].map((text) => (
              <div key={text} className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-sabana-dorado flex-shrink-0" /><span>{text}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-sabana-azul rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">US</span>
            </div>
            <span className="font-bold text-sabana-azul text-xl">UnisabanaMarket</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear cuenta</h1>
          <p className="text-gray-500 mb-8">Regístrate con tu correo institucional</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo *</label>
              <input type="text" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Tu nombre completo" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correo institucional *</label>
              <div className="relative">
                <input type="email" required value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} placeholder="tu.nombre@unisabana.edu.co" className={`input-field pr-10 ${form.correo && !correoValido ? "border-red-400 focus:ring-red-400" : form.correo && correoValido ? "border-green-400 focus:ring-green-400" : ""}`} />
                {form.correo && (correoValido ? <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" /> : <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-lg">✕</span>)}
              </div>
              {form.correo && !correoValido && <p className="text-red-500 text-xs mt-1">Debe ser un correo @unisabana.edu.co</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Carrera (opcional)</label>
              <input type="text" value={form.carrera} onChange={(e) => setForm({ ...form, carrera: e.target.value })} placeholder="Ej: Ingeniería de Sistemas" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña *</label>
              <div className="relative">
                <input type={verPassword ? "text" : "password"} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" className="input-field pr-12" />
                <button type="button" onClick={() => setVerPassword(!verPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {verPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar contraseña *</label>
              <div className="relative">
                <input type={verPassword ? "text" : "password"} required value={form.confirmar} onChange={(e) => setForm({ ...form, confirmar: e.target.value })} placeholder="Repite tu contraseña" className={`input-field pr-10 ${form.confirmar && !confirmOk ? "border-red-400" : form.confirmar && confirmOk ? "border-green-400" : ""}`} />
                {form.confirmar && (confirmOk ? <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" /> : <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-lg">✕</span>)}
              </div>
            </div>
            <button type="submit" disabled={cargando} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {cargando ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <UserPlus className="w-5 h-5" />}
              {cargando ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
          <p className="text-center text-gray-500 mt-6 text-sm">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-sabana-azul font-semibold hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
