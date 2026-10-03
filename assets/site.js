// Portfolio — przełącznik języka i motywu, linki „Zagraj”, e-mail kontaktowy, drobna typografia.

// Wpisz tu adres, który ma się pojawić w sekcji Kontakt, np. "kontakt@plazaworks.pl".
// Pusty ciąg ukrywa blok z e-mailem (zostaje przycisk GitHuba).
const CONTACT_EMAIL = "";

const root = document.documentElement;

const META = {
  pl: {
    title: "Marcin Płaza · programista: gry, web, Rust",
    description: "Portfolio Marcina Płazy (PlazaWorks): własny renderer 3D w Ruście, gry i aplikacje webowe w TypeScripcie, praca z agentami AI. Szukam pracy i zleceń.",
  },
  en: {
    title: "Marcin Płaza · software developer: games, web, Rust",
    description: "Portfolio of Marcin Płaza (PlazaWorks): my own 3D renderer in Rust, web games and apps in TypeScript, working with AI agents. Open to work.",
  },
};

// Grywalne demo na stronie: wpisz adres hostowanego buildu (np. GitHub Pages lub itch.io).
// Pusty url = sekcja ukryta. Gra ładuje się dopiero po kliknięciu „Uruchom grę”.
const DEMO = { url: "", title: "Orbling Skies", poster: "assets/img/orbling-cover.webp" };

if (DEMO.url) {
  document.getElementById("zagraj").hidden = false;
  document.getElementById("demo-title").textContent = DEMO.title;
  document.getElementById("demo-open").href = DEMO.url;
  document.getElementById("demo-poster").src = DEMO.poster;
  document.getElementById("demo-start").addEventListener("click", () => {
    const frame = document.createElement("iframe");
    frame.src = DEMO.url;
    frame.title = DEMO.title;
    frame.allow = "autoplay; fullscreen; gamepad";
    frame.allowFullscreen = true;
    const screen = document.getElementById("demo-screen");
    screen.replaceChildren(frame);
    frame.focus();
  });
}

// Linki „Zagraj”: wpisz adres gry w atrybucie href w index.html. Pusty href = link ukryty.
document.querySelectorAll("a.play").forEach((a) => {
  if (!a.getAttribute("href")) a.hidden = true;
});

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
