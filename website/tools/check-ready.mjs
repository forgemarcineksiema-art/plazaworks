import { readFile } from "node:fs/promises";
import { site } from "../src/data/site.mjs";
import { isValidContactEmail, validatedSiteOrigin } from "../src/lib/site.mjs";
const errors = [];
if (!isValidContactEmail(site.contactEmail)) errors.push("Brakuje rzeczywistego adresu kontaktowego.");
if (!site.publicationReady) errors.push("Wersja nie została oznaczona do publikacji.");
try { if (!validatedSiteOrigin(process.env.SITE_URL)) errors.push("Brakuje docelowej domeny SITE_URL."); } catch (error) { errors.push(error.message); }
const qa = await readFile(new URL("../design-qa.md", import.meta.url), "utf8");
if (!/^final result: passed$/m.test(qa)) errors.push("Kontrola wyglądu i działania w przeglądarce nie jest zakończona.");
if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
else console.log("Warunki przekazania do publikacji spełnione.");
