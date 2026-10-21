import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { handleInquiry } from "../lib/inquiry-handler.mjs";
import { isOwnerIdentity } from "../lib/inbox-access.mjs";
const migration = readFileSync(new URL("../drizzle/0000_adorable_scrambler.sql", import.meta.url), "utf8");
function database() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(migration);
  const wrap = (sql, values = []) => ({
    bind: (...next) => wrap(sql, next),
    async first() { return sqlite.prepare(sql).get(...values) || null; },
    async run() { const result = sqlite.prepare(sql).run(...values); return { success: true, meta: { changes: Number(result.changes) } }; }
  });
  return { db: { prepare: sql => wrap(sql) }, sqlite };
}
function input(overrides = {}) { return { name: "Łukasz", replyTo: "kontakt@example.com", topic: "Strona lub sklep", message: "Potrzebuję strony dla swojej firmy.", website: "", submissionId: crypto.randomUUID(), ...overrides }; }
function request(data, headers = {}) { return new Request("https://plazaworks.test/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://plazaworks.test", ...headers }, body: JSON.stringify(data) }); }

test("a successful response confirms a persisted message and retries create only one record", async () => {
  const { db, sqlite } = database();
  const data = input({ replyTo: "+48 123 456 789", message: "Opis ze znakami: Łódź & <script>tekst</script>." });
  const first = await handleInquiry(request(data), db);
  assert.equal(first.status, 201);
  const response = await first.json();
  assert.equal(response.ok, true);
  const row = sqlite.prepare("SELECT * FROM inquiries").get();
  assert.equal(row.id, response.id);
  assert.equal(row.reply_to, data.replyTo);
  assert.equal(row.message, data.message);
  assert.equal((await (await handleInquiry(request(data), db)).json()).id, response.id);
  assert.equal(sqlite.prepare("SELECT count(*) AS count FROM inquiries").get().count, 1);
  sqlite.close();
});

test("invalid input, cross-origin requests and unsupported methods never write a message", async () => {
  const { db, sqlite } = database();
  for (const values of [{ replyTo: "" }, { message: "krótko" }, { message: "a".repeat(5001) }, { topic: "Inny temat z zewnątrz" }, { website: "spam" }, { submissionId: "wrong" }]) {
    assert.equal((await handleInquiry(request(input(values)), db)).status, 422);
  }
  assert.equal((await handleInquiry(request(input(), { Origin: "https://foreign.test" }), db)).status, 403);
  assert.equal((await handleInquiry(new Request("https://plazaworks.test/api/inquiries"), db)).status, 405);
  assert.equal(sqlite.prepare("SELECT count(*) AS count FROM inquiries").get().count, 0);
  sqlite.close();
});

test("missing or failing storage cannot produce a success confirmation", async () => {
  assert.equal((await handleInquiry(request(input()), null)).status, 503);
  assert.equal((await handleInquiry(request(input()), { prepare() { throw new Error("database credentials must not appear"); } })).status, 503);
  const response = await handleInquiry(request(input()), { prepare() { return { bind() { return this; }, first: async () => null, run: async () => ({ success: false }) }; } });
  assert.equal(response.status, 503);
  assert.equal((await response.json()).ok, false);
});

test("submission limits do not block retrying an already saved message", async () => {
  const { db, sqlite } = database();
  const headers = { "cf-connecting-ip": "192.0.2.1" };
  const first = input();
  for (let i = 0; i < 5; i++) assert.equal((await handleInquiry(request(i ? input() : first, headers), db)).status, 201);
  assert.equal((await handleInquiry(request(input(), headers), db)).status, 429);
  assert.equal((await handleInquiry(request(first, headers), db)).status, 200);
  assert.equal(sqlite.prepare("SELECT count(*) AS count FROM inquiries").get().count, 5);
  sqlite.close();
});

test("the native form works without JavaScript and redirects only after persistence", async () => {
  const { db, sqlite } = database();
  const data = input();
  delete data.submissionId;
  const response = await handleInquiry(new Request("https://plazaworks.test/api/inquiries", { method: "POST", headers: { Origin: "https://plazaworks.test", "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(data) }), db);
  assert.equal(response.status, 303);
  const saved = sqlite.prepare("SELECT id FROM inquiries").get();
  assert.equal(response.headers.get("location"), "/dziekuje?zgloszenie=" + saved.id);
  assert.ok(!response.headers.get("location").includes(data.replyTo));
  sqlite.close();
});

test("inbox authorization denies anonymous visitors and unrelated signed-in identities", async () => {
  assert.equal(await isOwnerIdentity(null, "unrelated@example.com"), false);
  assert.equal(await isOwnerIdentity("signed-in-user", "unrelated@example.com"), false);
  assert.equal(await isOwnerIdentity("signed-in-user", null), false);
});
