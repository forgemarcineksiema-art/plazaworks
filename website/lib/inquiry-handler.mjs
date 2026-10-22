import { TOPICS } from "../src/lib/site.mjs";
const json = (data, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
const fail = (message, status) => json({ ok: false, message }, status);
const validId = value => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
export function validateSubmission(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Sprawdź treść formularza.");
  const clean = (key, limit) => {
    if (typeof input[key] !== "string" || input[key].length > limit) throw new Error("Sprawdź pole: " + key + ".");
    return input[key].trim();
  };
  const name = clean("name", 120).replace(/[\r\n\t]+/g, " ");
  const replyTo = clean("replyTo", 254).replace(/[\r\n\t]+/g, " ");
  const topic = clean("topic", 100);
  const message = clean("message", 5000);
  if (replyTo.length < 3) throw new Error("Podaj e-mail, telefon lub profil, na który mogę odpowiedzieć.");
  if (message.length < 10) throw new Error("Opisz zadanie w co najmniej 10 znakach.");
  if (!TOPICS.includes(topic)) throw new Error("Wybierz temat z listy.");
  if (!validId(input.submissionId)) throw new Error("Odśwież stronę i spróbuj ponownie.");
  if (input.website) throw new Error("Nie udało się przyjąć formularza. Spróbuj ponownie.");
  return { name, replyTo, topic, message, submissionId: input.submissionId };
}
export async function handleInquiry(request, db) {
  if (request.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } });
  if (request.headers.get("origin") !== new URL(request.url).origin || request.headers.get("sec-fetch-site") === "cross-site") return fail("Wyślij formularz bezpośrednio ze strony PlazaWorks.", 403);
  const isJson = request.headers.get("content-type")?.toLowerCase().startsWith("application/json");
  const isForm = request.headers.get("content-type")?.toLowerCase().startsWith("application/x-www-form-urlencoded");
  if (!isJson && !isForm) return fail("Nieobsługiwany format formularza.", 415);
  if (Number(request.headers.get("content-length") || 0) > 24000) return fail("Opis jest zbyt długi.", 413);
  let input;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 24000) return fail("Opis jest zbyt długi.", 413);
    const data = isJson ? JSON.parse(raw) : { ...Object.fromEntries(new URLSearchParams(raw)), submissionId: crypto.randomUUID() };
    input = validateSubmission(data);
  } catch (error) { return fail(error instanceof SyntaxError ? "Sprawdź treść formularza." : error.message, 422); }
  if (!db) return fail("Formularz jest chwilowo niedostępny. Twoja treść pozostaje w polach poniżej.", 503);
  try {
    const existing = await db.prepare("SELECT id FROM inquiries WHERE submission_id = ?").bind(input.submissionId).first();
    if (existing) return json({ ok: true, id: existing.id });
    const now = Date.now();
    const ip = request.headers.get("cf-connecting-ip");
    if (ip) {
      const window = Math.floor(now / 900000);
      const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("plazaworks-inquiry:" + window + ":" + ip));
      const key = Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, "0")).join("");
      const limit = await db.prepare("INSERT INTO inquiry_limits (key, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count").bind(key, (window + 1) * 900000).first();
      if (limit?.count > 5) return fail("Wysłano już kilka zapytań. Spróbuj ponownie za 15 minut; treść pozostaje w formularzu.", 429);
      await db.prepare("DELETE FROM inquiry_limits WHERE expires_at < ?").bind(now).run();
    }
    const id = crypto.randomUUID();
    const result = await db.prepare("INSERT INTO inquiries (id, submission_id, created_at, name, reply_to, topic, message) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(submission_id) DO NOTHING").bind(id, input.submissionId, now, input.name, input.replyTo, input.topic, input.message).run();
    if (result.success === false) throw new Error("Write failed");
    const saved = await db.prepare("SELECT id FROM inquiries WHERE submission_id = ?").bind(input.submissionId).first();
    if (!saved?.id) throw new Error("Write not confirmed");
    if (isForm) return new Response(null, { status: 303, headers: { Location: "/dziekuje?zgloszenie=" + saved.id, "Cache-Control": "no-store" } });
    return json({ ok: true, id: saved.id }, 201);
  } catch { return fail("Nie udało się potwierdzić zapisu. Twoja treść została w formularzu — spróbuj ponownie.", 503); }
}
