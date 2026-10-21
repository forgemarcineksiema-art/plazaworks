import { buildInquiry, buildMailto, projectFromHash } from "../lib/site.mjs";

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
  const settings = document.getElementById("contact-config");
  if (!(form instanceof HTMLFormElement) || !settings) return;
  let email = null;
  try { email = JSON.parse(settings.textContent || "{}").email || null; } catch { return; }
  const status = form.querySelector("[data-form-status]");
  const result = form.querySelector("[data-draft-result]");
  const output = form.querySelector("[data-draft-text]");
  const message = value => { if (status) status.textContent = value; };
  form.hidden = false;

  for (const link of document.querySelectorAll("[data-contact-topic]")) {
    link.addEventListener("click", () => {
      const field = form.elements.namedItem("topic");
      if (field instanceof HTMLSelectElement) field.value = link.dataset.contactTopic;
    });
  }
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    try {
      const values = Object.fromEntries(new FormData(form).entries());
      const inquiry = buildInquiry(values);
      if (!(output instanceof HTMLTextAreaElement) || !result) return;
      output.value = inquiry.subject + "\n\n" + inquiry.body;
      result.hidden = false;
      if (email) {
        location.href = buildMailto(email, inquiry);
        message("Otwieram aplikację pocztową. Wiadomość wyślesz w jej oknie.");
      } else {
        message("Opis jest gotowy do skopiowania. Wiadomość nie została wysłana.");
        output.focus();
      }
    } catch (error) {
      message(error instanceof Error ? error.message : "Sprawdź wpisaną treść.");
    }
  });
  form.querySelector("[data-copy-draft]")?.addEventListener("click", async () => {
    if (!(output instanceof HTMLTextAreaElement)) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(output.value);
      message("Treść skopiowana. Możesz wkleić ją do wiadomości.");
    } catch {
      output.focus();
      output.select();
      message("Treść została zaznaczona. Skopiuj ją z menu urządzenia.");
    }
  });
  form.querySelector("[data-download-draft]")?.addEventListener("click", () => {
    if (!(output instanceof HTMLTextAreaElement)) return;
    const blob = new Blob([output.value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "plazaworks-opis-projektu.txt";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    message("Przygotowano plik z opisem. Zapis nie wysyła wiadomości.");
  });
}

initMenu();
initProjects();
initInquiry();
