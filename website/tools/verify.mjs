import { readFile, readdir, stat } from "node:fs/promises";
import { resolve, relative, dirname } from "node:path";
import { gzipSync } from "node:zlib";
import projects from "../src/data/projects.json" with { type: "json" };
import { normalizeBase, validateProjects } from "../src/lib/site.mjs";

validateProjects(projects);
const root = resolve("dist");
const base = normalizeBase(process.env.BASE_PATH || "/");
const errors = [];
const checks = [];
async function walk(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) result.push(...await walk(path));
    else result.push(path);
  }
  return result;
}
const all = await walk(root);
const htmlPaths = all.filter(path => path.endsWith(".html"));
const documents = new Map();
for (const path of htmlPaths) documents.set(path, await readFile(path, "utf8"));
for (const [path, html] of documents) {
  const label = relative(root, path);
  if ((html.match(/<h1\b/g) || []).length !== 1) errors.push(label + ": wymagany jeden nagłówek h1.");
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  if (new Set(ids).size !== ids.length) errors.push(label + ": powtórzone identyfikatory.");
  for (const match of html.matchAll(/\b(?:href|src|poster)="([^"]*)"/g)) {
    let url = match[1].replaceAll("&amp;", "&");
    if (!url) { errors.push(label + ": pusty adres."); continue; }
    if (/^(https?:|mailto:|data:|tel:)/i.test(url)) continue;
    if (url.startsWith("//")) { errors.push(label + ": protokół zależny od strony."); continue; }
    const [rawPath, fragment] = url.split("#");
    let target = path;
    if (rawPath) {
      const clean = decodeURIComponent(rawPath.split("?")[0]);
      if (clean.startsWith("/")) {
        if (!clean.startsWith(base)) { errors.push(label + ": adres poza BASE_PATH: " + clean); continue; }
        target = resolve(root, clean.slice(base.length));
      } else target = resolve(dirname(path), clean);
      if (!target.startsWith(root + "/") && target !== root) { errors.push(label + ": adres poza dist."); continue; }
      try {
        if ((await stat(target)).isDirectory()) target = resolve(target, "index.html");
        await stat(target);
      } catch { errors.push(label + ": brak pliku: " + url); continue; }
    }
    if (fragment && documents.has(target)) {
      const wanted = decodeURIComponent(fragment);
      const targetHtml = documents.get(target);
      if (!targetHtml.includes('id="' + wanted + '"')) errors.push(label + ": brak kotwicy: " + url);
    }
  }
  if (html.includes('href=""') || html.includes("Od strony firmowej po własny silnik")) errors.push(label + ": stara lub niekompletna treść.");
}
const home = documents.get(resolve(root, "index.html")) || "";
if ((home.match(/Projektuję i tworzę oprogramowanie\./g) || []).length !== 1) errors.push("Opis działalności powinien występować na głównej tylko raz.");
for (const heading of ["Projekty własne", "Wybrane projekty"]) {
  if (new RegExp("<h[1-6][^>]*>" + heading + "<").test(home)) errors.push("Powtórzona sekcja portfolio: " + heading);
}
for (const project of projects) {
  if (!documents.has(resolve(root, "projekty", project.id, "index.html"))) errors.push("Brak opisu projektu: " + project.id);
}
const js = all.filter(path => path.endsWith(".js"));
let jsGzip = 0;
for (const path of js) jsGzip += gzipSync(await readFile(path)).byteLength;
if (jsGzip > 64 * 1024) errors.push("Kod JS przekroczył budżet 64 KiB gzip.");
checks.push(htmlPaths.length + " dokumentów HTML", "Odnośniki, kotwice i materiały", "Osiem wybranych prac", "Jedna deklaracja pod logo", "JS: " + jsGzip + " B gzip");
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else console.log("Kontrole statycznego builda OK:\n" + checks.join("\n") + "\nNie zastępują kontroli w przeglądarce.");
