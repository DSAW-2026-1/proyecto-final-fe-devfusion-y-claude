"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import api from "@/lib/api";

interface Usuario {
  id: string; nombre: string; correo: string; rol: string;
  foto?: string; carrera?: string; reputacion?: number;
}

interface AuthContextType {
  usuario: Usuario | null; token: string | null; cargando: boolean;
  login: (token: string, usuario: Usuario) => void;
  logout: () => void; actualizarUsuario: (u: Partial<Usuario>) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const t = Cookies.get("token") || localStorage.getItem("token");
    const u = localStorage.getItem("usuario");
    if (t && u) { setToken(t); setUsuario(JSON.parse(u)); }
    setCargando(false);
  }, []);

  const login = useCallback((t: string, u: Usuario) => {
    Cookies.set("token", t, { expires: 7 });
    localStorage.setItem("token", t);
    localStorage.setItem("usuario", JSON.stringify(u));
    setToken(t); setUsuario(u);
  }, []);

  const logout = useCallback(() => {
    Cookies.remove("token");
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setToken(null); setUsuario(null);
  }, []);

  const actualizarUsuario = useCallback((datos: Partial<Usuario>) => {
    setUsuario((prev) => {
      if (!prev) return prev;
      const nuevo = { ...prev, ...datos };
      localStorage.setItem("usuario", JSON.stringify(nuevo));
      return nuevo;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, token, cargando, login, logout, actualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
