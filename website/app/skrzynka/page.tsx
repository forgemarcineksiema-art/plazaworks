import { env } from "cloudflare:workers";
import { isInboxOwner } from "../../lib/inbox-auth";
export const dynamic = "force-dynamic";
export const metadata = { title: "Skrzynka zapytań — PlazaWorks" };
type Inquiry = { id: string; created_at: number; name: string; reply_to: string; topic: string; message: string };
export default async function Inbox({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  if (!(await isInboxOwner())) return <main><h1>Ta skrzynka jest dostępna tylko dla właściciela PlazaWorks.</h1><a href="/">Wróć na stronę</a></main>;
  const query = await searchParams;
  const page = Math.max(1, Math.min(10000, Number.parseInt(query.page || "1", 10) || 1));
  let inquiries: Inquiry[] = [];
  let total = 0;
  let error = false;
  try {
    const count = await env.DB.prepare("SELECT COUNT(*) AS total FROM inquiries").first<{ total: number }>();
    const results = await env.DB.prepare("SELECT id, created_at, name, reply_to, topic, message FROM inquiries ORDER BY created_at DESC, id DESC LIMIT 25 OFFSET ?").bind((page - 1) * 25).all<Inquiry>();
    inquiries = results.results;
    total = count?.total || 0;
  } catch { error = true; }
  return <main>
    <header><a href="/">PlazaWorks</a><span>Panel właściciela</span></header>
    <h1>Skrzynka zapytań</h1>
    <p>Wiadomości przesłane przez formularz na stronie. Kontakt do odpowiedzi znajdziesz przy każdym zgłoszeniu.</p>
    {error ? <p role="alert">Nie udało się odczytać skrzynki. Odśwież stronę za chwilę.</p> : <>
      <div className="inbox-summary"><span>{total} zgłoszeń</span><a href={"/skrzynka?page=" + page}>Odśwież</a></div>
      {inquiries.length === 0 && <p className="empty">Brak zgłoszeń na tej stronie.</p>}
      {inquiries.map(item => <article key={item.id}>
        <div className="inquiry-meta"><span>{item.topic}</span><time dateTime={new Date(item.created_at).toISOString()}>{new Date(item.created_at).toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" })}</time></div>
        <h2>{item.name || "Bez imienia"}</h2>
        <p className="reply"><span>Kontakt do odpowiedzi</span>{item.reply_to}</p>
        <p className="inquiry-message">{item.message}</p>
      </article>)}
      <nav aria-label="Strony skrzynki">{page > 1 && <a href={"/skrzynka?page=" + (page - 1)}>Nowsze zgłoszenia</a>}{page * 25 < total && <a href={"/skrzynka?page=" + (page + 1)}>Starsze zgłoszenia</a>}</nav>
    </>}
  </main>;
}
