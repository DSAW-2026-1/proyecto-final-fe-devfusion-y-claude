import type { Metadata } from "next";
import ProductoDetalleClient from "./ProductoDetalleClient";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return { title: "Producto no encontrado" };
    const p = await res.json();
    return {
      title: p.nombre,
      description: `${p.descripcion?.substring(0, 150)} - $${p.precio?.toLocaleString("es-CO")}`,
      openGraph: {
        title: p.nombre,
        description: p.descripcion?.substring(0, 150),
        images: p.imagenes?.[0] ? [{ url: p.imagenes[0], width: 800, height: 600, alt: p.nombre }] : [],
        type: "website",
      },
    };
  } catch { return { title: "Producto | UnisabanaMarket" }; }
}

export default async function ProductoPage({ params }: Props) {
  const { id } = await params;
  return <ProductoDetalleClient id={id} />;
}