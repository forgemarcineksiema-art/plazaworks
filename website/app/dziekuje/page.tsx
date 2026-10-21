import { env } from "cloudflare:workers";
export const dynamic = "force-dynamic";
export const metadata = { title: "Potwierdzenie zapytania — PlazaWorks" };
export default async function Thanks({ searchParams }: { searchParams: Promise<{ zgloszenie?: string }> }) {
  const { zgloszenie } = await searchParams;
  let saved = false;
  if (zgloszenie && /^[0-9a-f-]{36}$/i.test(zgloszenie)) {
    try { saved = !!(await env.DB.prepare("SELECT id FROM inquiries WHERE id = ?").bind(zgloszenie).first()); } catch { /* unavailable */ }
  }
  return <main><header><a href="/">PlazaWorks</a></header><h1>{saved ? "Zapytanie zostało zapisane." : "Nie udało się potwierdzić zapisu."}</h1><p>{saved ? "Odpowiem na podany kontakt." : "Wróć do formularza i spróbuj ponownie."}</p><a href="/#kontakt">Wróć na stronę</a></main>;
}
