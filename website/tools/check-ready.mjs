import { readFile } from "node:fs/promises";
import { site } from "../src/data/site.mjs";
import { validatedSiteOrigin } from "../src/lib/site.mjs";
const errors = [];
const hosting = JSON.parse(await readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"));
if (hosting.d1 !== "DB") errors.push("Brakuje konfiguracji skrzynki zapytań.");
if (!site.publicationReady) errors.push("Wersja nie została oznaczona do publikacji.");
try { if (!validatedSiteOrigin(process.env.SITE_URL)) errors.push("Brakuje docelowej domeny SITE_URL."); } catch (error) { errors.push(error.message); }
const qa = await readFile(new URL("../design-qa.md", import.meta.url), "utf8");
if (!/^final result: passed$/m.test(qa)) errors.push("Kontrola wyglądu i działania w przeglądarce nie jest zakończona.");
if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
else console.log("Warunki przekazania do publikacji spełnione.");
