(function () {
  const root = document.documentElement;
  const THEME_KEY = "siteTheme"; // "light" | "dark"

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    const btn = document.querySelector("[data-theme-toggle]");
    if (btn) btn.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return setTheme(saved);

    // Default: follow OS preference
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }

  function initThemeToggle() {
    const btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") || "light";
      setTheme(current === "dark" ? "light" : "dark");
    });
  }

  // Projects filter: text search + tag filter
  function initProjectsFilter() {
    const search = document.querySelector("[data-project-search]");
    const filter = document.querySelector("[data-project-filter]");
    const cards = Array.from(document.querySelectorAll("[data-project-card]"));
    if (!search || !filter || cards.length === 0) return;

    function apply() {
      const q = search.value.trim().toLowerCase();
      const tag = filter.value;

      let shown = 0;
      for (const card of cards) {
        const text = (card.getAttribute("data-text") || "").toLowerCase();
        const tags = (card.getAttribute("data-tags") || "").split(",").map(s => s.trim());
        const matchesQ = !q || text.includes(q);
        const matchesTag = tag === "all" || tags.includes(tag);

        const ok = matchesQ && matchesTag;
        card.classList.toggle("hidden", !ok);
        if (ok) shown++;
      }

      const out = document.querySelector("[data-project-count]");
      if (out) out.textContent = String(shown);
    }

    search.addEventListener("input", apply);
    filter.addEventListener("change", apply);

    // Keyboard shortcut: press "/" to focus search (modern touch)
    window.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== search) {
        e.preventDefault();
        search.focus();
      }
    });

    apply();
  }

  initTheme();
  initThemeToggle();
  initProjectsFilter();
})();
// ====== Carousel ======
(function initCarousels() {
  const carousels = document.querySelectorAll("[data-carousel]");
  if (!carousels.length) return;

  carousels.forEach((root) => {
    const viewport = root.querySelector(".carousel-viewport");
    const track = root.querySelector(".carousel-track");
    const slides = Array.from(root.querySelectorAll(".carousel-slide"));
    const prevBtn = root.querySelector("[data-prev]");
    const nextBtn = root.querySelector("[data-next]");
    const dots = Array.from(root.querySelectorAll("[data-dot]"));
    const outIndex = root.querySelector("[data-index]");
    const outTotal = root.querySelector("[data-total]");

    let index = 0;
    const total = slides.length;

    if (outTotal) outTotal.textContent = String(total);

    function update() {
      track.style.transform = `translateX(${-index * 100}%)`;

      if (outIndex) outIndex.textContent = String(index + 1);

      // Buttons (optional: allow wrap-around by removing these)
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === total - 1;

      dots.forEach((d, i) => d.setAttribute("aria-current", i === index ? "true" : "false"));
    }

    function goTo(i) {
      index = Math.max(0, Math.min(total - 1, i));
      update();
    }

    prevBtn?.addEventListener("click", () => goTo(index - 1));
    nextBtn?.addEventListener("click", () => goTo(index + 1));

    dots.forEach((d) => {
      d.addEventListener("click", () => goTo(Number(d.dataset.dot)));
    });

    // Keyboard arrows when viewport focused
    viewport?.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    });

    // Basic touch swipe
    let startX = null;
    viewport?.addEventListener("touchstart", (e) => {
      startX = e.touches[0]?.clientX ?? null;
    }, { passive: true });

    viewport?.addEventListener("touchend", (e) => {
      if (startX === null) return;
      const endX = e.changedTouches[0]?.clientX ?? startX;
      const dx = endX - startX;
      startX = null;

      if (Math.abs(dx) > 40) {
        if (dx > 0) goTo(index - 1);
        else goTo(index + 1);
      }
    });

    update();
  });
})();
// ===== Copy Button for Terminal =====
(function () {
  const buttons = document.querySelectorAll("[data-copy]");
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const wrapper = btn.closest(".terminal-wrapper");
      const content = wrapper.querySelector("[data-copy-content]").innerText;

      navigator.clipboard.writeText(content).then(() => {
        btn.textContent = "Copied!";
        setTimeout(() => {
          btn.textContent = "Copy";
        }, 1200);
      });
    });
  });
})();