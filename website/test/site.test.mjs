import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeBase, withBase, isValidContactEmail, validatedSiteOrigin, resolveMedia,
  buildInquiry, buildMailto, projectFromHash, validateProjects, sourceUrl
} from "../src/lib/site.mjs";
import projects from "../src/data/projects.json" with { type: "json" };

test("routes work at an origin root and under a GitHub Pages prefix", () => {
  assert.equal(normalizeBase("plazaworks"), "/plazaworks/");
  assert.equal(normalizeBase("/plazaworks/"), "/plazaworks/");
  assert.equal(withBase("projekty/blast-battalion/", "/"), "/projekty/blast-battalion/");
  assert.equal(withBase("projekty/blast-battalion/", "/plazaworks/"), "/plazaworks/projekty/blast-battalion/");
  assert.equal(withBase("assets/img/driving-coast.webp", "/plazaworks/"), "/plazaworks/assets/img/driving-coast.webp");
});

test("base and asset paths cannot escape to another origin or parent directory", () => {
  for (const base of ["/../", "/x/../y/", "https://example.com/", "/x?y", "/x#y"]) assert.throws(() => normalizeBase(base));
  for (const path of ["//example.com/file", "javascript:alert(1)", "../file"]) assert.throws(() => withBase(path));
});

test("site origin is HTTPS and does not contain credentials or a base path", () => {
  assert.equal(validatedSiteOrigin("https://example.com/"), "https://example.com");
  assert.equal(validatedSiteOrigin(""), undefined);
  for (const origin of ["http://example.com", "https://name:password@example.com", "https://example.com/path", "https://example.com/?x=1"]) assert.throws(() => validatedSiteOrigin(origin));
});

test("an unset showreel does not create a pretend player", () => {
  assert.equal(resolveMedia(null), null);
  assert.equal(resolveMedia("media/reel.mp4", "/plazaworks/"), "/plazaworks/media/reel.mp4");
  assert.equal(resolveMedia("https://example.com/reel.webm"), "https://example.com/reel.webm");
  for (const source of ["javascript:reel.mp4", "//example.com/reel.mp4", "https://name:password@example.com/reel.mp4", "reel.html"]) assert.throws(() => resolveMedia(source));
});

test("inquiry handles Polish letters and mail query separators without header injection", () => {
  const inquiry = buildInquiry({
    name: "Łukasz\r\nInjected: value",
    email: "lukasz+projekt@example.com",
    topic: "Strona lub sklep",
    message: "Potrzebuję strony & sklepu? Nazwa: Łódź #1."
  });
  const url = buildMailto("kontakt@example.com", inquiry);
  assert.ok(url.startsWith("mailto:kontakt@example.com?subject="));
  assert.ok(url.includes("%26"));
  assert.ok(url.includes("%23"));
  const params = new URLSearchParams(url.slice(url.indexOf("?") + 1));
  assert.equal(params.get("subject"), "PlazaWorks — Strona lub sklep");
  assert.equal(params.get("body"), inquiry.body);
  assert.ok(inquiry.body.includes("Łukasz Injected: value"));
  assert.ok(!inquiry.subject.includes("\n"));
});

test("contact refuses missing recipients and preserves the inquiry when input is invalid", () => {
  assert.ok(isValidContactEmail("marcin+firma@example.pl"));
  for (const email of ["", null, "wrong", "a@example.com?bcc=other@example.com", "a@example.com\r\nBcc:x@y.pl", "a@b..com"]) {
    assert.equal(isValidContactEmail(email), false);
    assert.throws(() => buildMailto(email, { subject: "Temat", body: "Treść" }));
  }
  assert.throws(() => buildInquiry({ message: "krótko" }));
  assert.throws(() => buildInquiry({ message: "x".repeat(5001) }));
  assert.throws(() => buildInquiry({ message: "Dłuższy opis projektu", email: "bad" }));
  const fallback = buildInquiry({ topic: "Injected\r\nSubject: new", message: "Dłuższy opis projektu" });
  assert.equal(fallback.subject, "PlazaWorks — Inny temat");
});

test("project deep links choose only known ids", () => {
  const ids = projects.map(project => project.id);
  assert.equal(projectFromHash("#projekt-driving-game", ids), "driving-game");
  assert.equal(projectFromHash("#projekt-does-not-exist", ids), "blast-battalion");
  assert.equal(projectFromHash("#kontakt", ids), "blast-battalion");
  assert.equal(projectFromHash("#projekt-%3Cscript%3E", ids), "blast-battalion");
});

test("portfolio contains the eight selected projects with pinned source versions", () => {
  assert.equal(validateProjects(projects), projects);
  assert.deepEqual(projects.map(project => project.id), [
    "driving-game","wot-rust","fragile-express","orbling-skies",
    "blast-battalion","tanki","cloudkeep","hz-bot"
  ]);
  const blast = projects.find(project => project.id === "blast-battalion");
  assert.equal(sourceUrl(blast, "src/terrain.js"), "https://github.com/forgemarcineksiema-art/blast-battalion/blob/24ba4c556f13c02c8acc1a8c06306e4139976650/src/terrain.js");
  const copy = structuredClone(projects);
  copy[1].id = copy[0].id;
  assert.throws(() => validateProjects(copy));
  copy[1].id = "wot-rust";
  copy[1].commit = "main";
  assert.throws(() => validateProjects(copy));
});
