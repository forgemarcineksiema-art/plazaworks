import { buildInquiry, projectFromHash } from "../lib/site.mjs";

function initMenu() {
  const header = document.querySelector("[data-header]");
  const toggle = header?.querySelector("[data-menu-toggle]");
  const nav = header?.querySelector("[data-main-nav]");
  if (!header || !toggle || !nav) return;
  document.documentElement.classList.add("enhanced");
  toggle.hidden = false;
  const close = () => {
    nav.removeAttribute("data-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Menu";
  };
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    if (!open) return close();
    nav.setAttribute("data-open", "");
    toggle.setAttribute("aria-expanded", "true");
    toggle.textContent = "Zamknij";
  });
  nav.addEventListener("click", event => {
    if (event.target instanceof Element && event.target.closest("a")) close();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      close();
      toggle.focus();
    }
  });
  document.addEventListener("click", event => {
    if (event.target instanceof Node && !header.contains(event.target)) close();
  });
}

function initProjects() {
  const root = document.querySelector("[data-projects]");
  if (!root) return;
  const links = Array.from(root.querySelectorAll("[data-project-select]"));
  const panels = Array.from(root.querySelectorAll("[data-project-panel]"));
  const ids = panels.map(panel => panel.dataset.projectPanel);
  const announcement = root.querySelector("[data-project-announcement]");
  const select = (id, announce = false, syncHash = false) => {
    if (!ids.includes(id)) return;
    for (const link of links) {
      if (link.dataset.projectSelect === id) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
    for (const panel of panels) {
      const active = panel.dataset.projectPanel === id;
      if (!active) for (const video of panel.querySelectorAll("video")) video.pause();
      panel.hidden = !active;
    }
    if (syncHash) history.replaceState(null, "", "#projekt-" + id);
    if (announce && announcement) {
      const current = panels.find(panel => panel.dataset.projectPanel === id);
      announcement.textContent = "Wybrano projekt: " + (current?.querySelector("h3")?.textContent || id);
    }
  };
  const scrollToProject = (id, behavior = "instant") => {
    panels.find(panel => panel.dataset.projectPanel === id)?.scrollIntoView({ block: "start", behavior });
  };
  const initialProject = projectFromHash(location.hash, ids);
  select(initialProject);
  if (location.hash.startsWith("#projekt-") && ids.includes(initialProject)) {
    requestAnimationFrame(() => scrollToProject(initialProject));
  }
  for (const link of links) {
    link.addEventListener("click", event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      select(link.dataset.projectSelect, true, true);
      if (matchMedia("(max-width: 720px)").matches) {
        scrollToProject(link.dataset.projectSelect, matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth");
      }
    });
  }
  addEventListener("hashchange", () => {
    if (location.hash.startsWith("#projekt-")) {
      const id = projectFromHash(location.hash, ids);
      select(id, true);
      if (ids.includes(id)) scrollToProject(id);
    }
  });

  for (const panel of panels) {
    const tablist = panel.querySelector("[data-modes]");
    if (!tablist) continue;
    tablist.hidden = false;
    const tabs = Array.from(tablist.querySelectorAll("[data-mode]"));
    const details = Array.from(panel.querySelectorAll("[data-mode-panel]"));
    const activate = (tab, focus = false) => {
      for (const item of tabs) {
        const selected = item === tab;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
      }
      for (const detail of details) detail.hidden = detail.dataset.modePanel !== tab.dataset.mode;
      if (focus) tab.focus();
    };
    for (const [index, tab] of tabs.entries()) {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", event => {
        let next;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        activate(tabs[next], true);
      });
    }
  }
}

function initInquiry() {
  const form = document.querySelector("[data-inquiry-form]");
  if (!(form instanceof HTMLFormElement)) return;
  const status = form.querySelector("[data-form-status]");
  const result = form.querySelector("[data-draft-result]");
  const output = form.querySelector("[data-draft-text]");
  const submit = form.querySelector("[data-submit-inquiry]");
  const message = value => { if (status) status.textContent = value; };
  let fingerprint = "";
  let submissionId = "";
  let pending = false;
  for (const link of document.querySelectorAll("[data-contact-topic]")) {
    link.addEventListener("click", () => {
      const field = form.elements.namedItem("topic");
      if (field instanceof HTMLSelectElement) field.value = link.dataset.contactTopic;
    });
  }
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      const inquiry = buildInquiry(values);
      if (output instanceof HTMLTextAreaElement && result) {
        output.value = inquiry.subject + "\n\n" + inquiry.body;
        result.hidden = false;
      }
      const nextFingerprint = JSON.stringify(values);
      if (nextFingerprint !== fingerprint || !submissionId) {
        const bytes = crypto.getRandomValues(new Uint8Array(16));
        bytes[6] = (bytes[6] & 15) | 64;
        bytes[8] = (bytes[8] & 63) | 128;
        const hex = Array.from(bytes, value => value.toString(16).padStart(2, "0")).join("");
        submissionId = [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join("-");
        fingerprint = nextFingerprint;
      }
      pending = true;
      for (const control of form.querySelectorAll("input,select,textarea:not([readonly])")) control.disabled = true;
      if (submit instanceof HTMLButtonElement) { submit.disabled = true; submit.textContent = "Wysyłam…"; }
      form.setAttribute("aria-busy", "true");
      message("Zapisuję Twoje zapytanie…");
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      let response;
      try {
        response = await fetch(form.action, {
          method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ ...values, submissionId }), signal: controller.signal
        });
      } finally { clearTimeout(timeout); }
      let data;
      try { data = await response.json(); } catch { throw new Error("Serwer nie potwierdził zapisu. Spróbuj ponownie."); }
      if (!response.ok || data.ok !== true || !data.id) throw new Error(data.message || "Nie udało się potwierdzić zapisu. Spróbuj ponownie.");
      message("Zapytanie zostało zapisane. Odpowiem na podany kontakt. Kopię możesz zachować poniżej.");
      form.dataset.sent = "true";
    } catch (error) {
      const text = error instanceof Error && error.name !== "AbortError" && error.name !== "TypeError"
        ? error.message : "Nie udało się potwierdzić zapisu. Sprawdź połączenie i spróbuj ponownie.";
      message(text + " Twoja treść pozostaje w formularzu.");
    } finally {
      pending = false;
      for (const control of form.querySelectorAll("input,select,textarea:not([readonly])")) control.disabled = false;
      form.removeAttribute("aria-busy");
      if (submit instanceof HTMLButtonElement) { submit.disabled = false; submit.textContent = "Wyślij zapytanie"; }
    }
  });
  form.querySelector("[data-copy-draft]")?.addEventListener("click", async () => {
    if (!(output instanceof HTMLTextAreaElement)) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(output.value);
      message("Treść skopiowana.");
    } catch {
      output.focus(); output.select();
      message("Treść została zaznaczona. Skopiuj ją z menu urządzenia.");
    }
  });
  form.querySelector("[data-download-draft]")?.addEventListener("click", () => {
    if (!(output instanceof HTMLTextAreaElement)) return;
    const url = URL.createObjectURL(new Blob([output.value], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = "plazaworks-zapytanie.txt";
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    message("Przygotowano kopię zapytania do zapisania.");
  });
}

function initServices() {
  const openFromHash = () => {
    const target = document.getElementById(location.hash.slice(1));
    if (target instanceof HTMLDetailsElement && target.hasAttribute("data-service")) target.open = true;
  };
  openFromHash();
  addEventListener("hashchange", openFromHash);
  for (const link of document.querySelectorAll(".services-band a")) {
    link.addEventListener("click", () => {
      const target = document.getElementById(link.hash.slice(1));
      if (target instanceof HTMLDetailsElement) target.open = true;
    });
  }
}

initMenu();
initProjects();
initServices();
initInquiry();
