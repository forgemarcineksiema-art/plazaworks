// PlazaWorks — przełącznik języka i motywu, e-mail kontaktowy, drobna typografia.

// Wpisz tu adres, który ma się pojawić w sekcji Kontakt, np. "kontakt@plazaworks.pl".
// Pusty ciąg ukrywa blok z e-mailem (zostaje przycisk GitHuba).
const CONTACT_EMAIL = "";

const root = document.documentElement;

const META = {
  pl: {
    title: "PlazaWorks · Marcin Płaza — gry, web, Rust, AI",
    description: "PlazaWorks to mini studio Marcina Płazy: gry przeglądarkowe i natywne, strony, aplikacje i oprogramowanie na zamówienie, Rust i wdrożenia AI.",
  },
  en: {
    title: "PlazaWorks · Marcin Płaza — games, web, Rust, AI",
    description: "PlazaWorks is Marcin Płaza’s indie studio: browser and native games, websites, apps and custom software, Rust and AI integration.",
  },
};

function store(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* tryb prywatny: bez zapamiętywania */ }
}

function setLang(lang) {
  root.setAttribute("data-lang", lang);
  root.lang = lang;
  document.title = META[lang].title;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", META[lang].description);
  document.querySelectorAll("[data-set-lang]").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.setLang === lang));
  });
  document.querySelectorAll("img[data-alt-en]").forEach((img) => {
    if (!img.dataset.altPl) img.dataset.altPl = img.alt;
    img.alt = lang === "en" ? img.dataset.altEn : img.dataset.altPl;
  });
}

document.querySelectorAll("[data-set-lang]").forEach((b) => {
  b.addEventListener("click", () => {
    setLang(b.dataset.setLang);
    store("pw-lang", b.dataset.setLang);
  });
});
setLang(root.getAttribute("data-lang") === "en" ? "en" : "pl");

// Motyw: domyślnie systemowy, przycisk przełącza na przeciwny i zapamiętuje wybór.
const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
function isDark() {
  const t = root.getAttribute("data-theme");
  return t ? t === "dark" : darkQuery.matches;
}
document.getElementById("theme-toggle").addEventListener("click", () => {
  const next = isDark() ? "light" : "dark";
  root.setAttribute("data-theme", next);
  store("pw-theme", next);
});

// Kreska pod nagłówkiem po przewinięciu.
const head = document.querySelector(".site-head");
const onScroll = () => head.classList.toggle("is-scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// E-mail kontaktowy.
if (CONTACT_EMAIL) {
  const box = document.getElementById("mail-box");
  const link = document.getElementById("mail-link");
  link.textContent = CONTACT_EMAIL;
  link.href = "mailto:" + CONTACT_EMAIL;
  box.hidden = false;
  const copy = document.getElementById("mail-copy");
  copy.addEventListener("click", () => {
    const done = () => {
      copy.dataset.label = copy.dataset.label || copy.innerHTML;
      copy.textContent = root.lang === "en" ? "Copied" : "Skopiowano";
      setTimeout(() => { copy.innerHTML = copy.dataset.label; }, 1600);
    };
    const select = () => {
      const r = document.createRange();
      r.selectNodeContents(link);
      const s = window.getSelection();
      s.removeAllRanges();
      s.addRange(r);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(CONTACT_EMAIL).then(done, select);
    else select();
  });
}

document.getElementById("year").textContent = String(new Date().getFullYear());

// Polska typografia: jednoliterowe spójniki i przyimki nie zostają na końcu wiersza.
const orphan = /(?<=^|[\s(„\u00a0])([aiouwzAIOUWZ])\s+/g;
document.querySelectorAll('body [lang="pl"]').forEach((el) => {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.parentElement && n.parentElement.closest("pre, code")) continue;
    n.nodeValue = n.nodeValue.replace(orphan, "$1\u00a0");
  }
});
