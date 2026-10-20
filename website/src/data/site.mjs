import config from "./config.json" with { type: "json" };
import projects from "./projects.json" with { type: "json" };
import { isValidContactEmail, resolveMedia, validateProjects } from "../lib/site.mjs";

const email = process.env.CONTACT_EMAIL?.trim() || config.contactEmail || null;
if (email && !isValidContactEmail(email)) throw new Error("Nieprawidłowy CONTACT_EMAIL.");
export const site = { ...config, contactEmail: email };
/** @type {import("./types").Project[]} */
export const allProjects = validateProjects(projects);
export const sourceOwner = "forgemarcineksiema-art";
export function showreelSource(base = "/") {
  return resolveMedia(process.env.SHOWREEL_SRC?.trim() || site.showreel.src, base);
}
