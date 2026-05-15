"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Eye, EyeOff, LogIn } from "lucide-react";
import type { Metadata } from "next";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ correo: "", password: "" });
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.token, data.usuario);
      toast.success(`¡Bienvenido, ${data.usuario.nombre}!`);
      router.push("/");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error al iniciar sesión");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - imagen */}
      <div className="hidden lg:flex lg:w-1/2 bg-sabana-azul relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <Image src="https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800&h=1000&fit=crop" alt="Campus" fill className="object-cover" />
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
          <h2 className="text-3xl font-bold mb-4">El mercado de<br />tu comunidad universitaria</h2>
          <p className="text-blue-200 leading-relaxed">Compra y vende entre estudiantes de forma segura y confiable dentro del campus.</p>
        </div>
      </div>

      {/* Panel derecho - formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-sabana-azul rounded-full flex items-center justify-center overflow-hidden">
              <Image src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Escudo_Universidad_de_La_Sabana.svg/200px-Escudo_Universidad_de_La_Sabana.svg.png"
                alt="Logo" width={36} height={36} className="object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            <span className="font-bold text-sabana-azul text-xl">UnisabanaMarket</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Iniciar sesión</h1>
          <p className="text-gray-500 mb-8">Ingresa con tu correo institucional Unisabana</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correo institucional</label>
              <input type="email" required value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })}
                placeholder="tu.nombre@unisabana.edu.co" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <div className="relative">
                <input type={verPassword ? "text" : "password"} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Tu contraseña" className="input-field pr-12" />
                <button type="button" onClick={() => setVerPassword(!verPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {verPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={cargando} className="btn-primary w-full flex items-center justify-center gap-2">
              {cargando ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <LogIn className="w-5 h-5" />}
              {cargando ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6 text-sm">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="text-sabana-azul font-semibold hover:underline">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
