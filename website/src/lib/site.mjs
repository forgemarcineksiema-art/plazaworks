export const TOPICS = [
  "Strona lub sklep", "Aplikacja lub system", "Automatyzacja lub AI",
  "Gra lub interakcja", "Współpraca z zespołem", "Inny temat"
];

export function normalizeBase(value = "/") {
  const input = String(value).trim();
  if (!input || input === "/") return "/";
  if (!/^\/?[a-zA-Z0-9._~/-]+\/?$/.test(input)) throw new Error("Nieprawidłowy BASE_PATH.");
  const segments = input.split("/").filter(Boolean);
  if (segments.some(segment => segment === "." || segment === "..")) throw new Error("BASE_PATH nie może zawierać przejść do katalogu nadrzędnego.");
  return "/" + segments.join("/") + "/";
}

export function withBase(path = "", base = "/") {
  const value = String(path);
  if (/^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith("//") || value.split("/").includes("..")) {
    throw new Error("Oczekiwano lokalnej ścieżki.");
  }
  return normalizeBase(base) + value.replace(/^\/+/, "");
}

export function isValidContactEmail(value) {
  return typeof value === "string" && value.length <= 254 &&
    /^[^\s@<>:;,?&#]+@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/.test(value) &&
    !value.includes("..");
}

export function validatedSiteOrigin(value) {
  if (!value) return undefined;
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash ||
      (url.pathname !== "" && url.pathname !== "/")) {
    throw new Error("SITE_URL musi być adresem HTTPS domeny, bez ścieżki i danych logowania.");
  }
  return url.origin;
}

export function resolveMedia(value, base = "/") {
  if (!value) return null;
  if (typeof value !== "string" || !/\.(mp4|webm)$/i.test(value)) {
    throw new Error("SHOWREEL_SRC musi wskazywać plik MP4 lub WebM.");
  }
  if (/^https:\/\//.test(value)) {
    const url = new URL(value);
    if (url.username || url.password) throw new Error("Film nie może zawierać danych logowania.");
    return url.href;
  }
  return withBase(value, base);
}

export function buildInquiry(input) {
  const message = String(input.message ?? "").trim();
  if (message.length < 10 || message.length > 5000) throw new Error("Opisz temat w 10–5000 znakach.");
  const name = String(input.name ?? "").replace(/[\r\n\t]+/g, " ").trim().slice(0, 120);
  const email = String(input.email ?? "").trim();
  if (email && !isValidContactEmail(email)) throw new Error("Sprawdź adres e-mail.");
  const topic = TOPICS.includes(input.topic) ? input.topic : "Inny temat";
  const subject = "PlazaWorks — " + topic;
  const lines = ["Temat: " + topic];
  if (name) lines.push("Imię: " + name);
  if (email) lines.push("E-mail do odpowiedzi: " + email);
  if (input.replyTo) lines.push("Kontakt do odpowiedzi: " + String(input.replyTo).replace(/[\r\n\t]+/g, " ").trim().slice(0, 254));
  lines.push("", message);
  return { subject, body: lines.join("\n") };
}

export function buildMailto(recipient, inquiry) {
  if (!isValidContactEmail(recipient)) throw new Error("Brak poprawnego adresu kontaktowego.");
  return "mailto:" + encodeURIComponent(recipient).replace("%40", "@") +
    "?subject=" + encodeURIComponent(inquiry.subject) +
    "&body=" + encodeURIComponent(inquiry.body);
}

export function projectFromHash(hash, ids, fallback = "blast-battalion") {
  const match = /^#projekt-([a-z0-9-]+)$/.exec(String(hash));
  return match && ids.includes(match[1]) ? match[1] : fallback;
}

export function validateProjects(projects) {
  if (!Array.isArray(projects) || projects.length === 0) throw new Error("Brak projektów.");
  const seen = new Set();
  for (const project of projects) {
    for (const field of ["id","name","summary","effect","mechanism","scope","limits","repo","commit","status","platform"]) {
      if (typeof project[field] !== "string" || !project[field].trim()) throw new Error("Niekompletne dane projektu: " + field);
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.id) || seen.has(project.id)) throw new Error("Nieprawidłowy lub powtórzony identyfikator projektu.");
    seen.add(project.id);
    if (!/^[0-9a-f]{40}$/.test(project.commit)) throw new Error("Projekt wymaga konkretnej wersji kodu.");
    if (!Array.isArray(project.tech) || !project.tech.length || !Array.isArray(project.features) || !project.features.length ||
        !Array.isArray(project.architecture) || !project.architecture.length ||
        !Array.isArray(project.sources) || !project.sources.length) throw new Error("Brak opisu pracy lub źródeł.");
    if (project.image !== null && !/^assets\/img\/[a-z0-9-]+\.(webp|png|jpg)$/.test(project.image)) throw new Error("Nieprawidłowy materiał projektu.");
    if (project.image === null && !project.excerpt) throw new Error("Projekt bez obrazu wymaga rzeczywistego fragmentu źródła.");
    if (project.video && (!project.image || !/^assets\/video\/[a-z0-9-]+\.mp4$/.test(project.video.src) ||
        !Number.isSafeInteger(project.video.width) || project.video.width <= 0 ||
        !Number.isSafeInteger(project.video.height) || project.video.height <= 0 ||
        typeof project.video.caption !== "string" || !project.video.caption.trim() ||
        typeof project.video.description !== "string" || !project.video.description.trim())) {
      throw new Error("Niekompletne lub nieprawidłowe nagranie projektu.");
    }
    for (const source of project.sources) {
      if (!source.label || !source.path || source.path.startsWith("/") || source.path.includes("..") || source.path.includes("://")) throw new Error("Nieprawidłowe źródło projektu.");
    }
  }
  return projects;
}

export function sourceUrl(project, path) {
  return "https://github.com/forgemarcineksiema-art/" + project.repo + "/blob/" + project.commit + "/" + path;
}
