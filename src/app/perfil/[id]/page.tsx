import type { Metadata } from "next";
import PerfilClient from "./PerfilClient";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/usuario/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return { title: "Perfil | UnisabanaMarket" };
    const u = await res.json();
    return { title: `${u.nombre} | UnisabanaMarket`, description: `Perfil de ${u.nombre}${u.carrera ? ` - ${u.carrera}` : ""} en el marketplace de Unisabana.` };
  } catch { return { title: "Perfil | UnisabanaMarket" }; }
}

export default async function PerfilPage({ params }: Props) {
  const { id } = await params;
  return <PerfilClient id={id} />;
}