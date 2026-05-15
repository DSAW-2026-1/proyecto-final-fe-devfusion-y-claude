import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const rutas: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/registro`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
  ];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/productos?limite=100`);
    if (res.ok) {
      const data = await res.json();
      const productosRutas = data.productos.map((p: any) => ({
        url: `${base}/producto/${p._id}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
      rutas.push(...productosRutas);
    }
  } catch {}

  return rutas;
}
