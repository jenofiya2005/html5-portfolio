// ---------- Mobile nav toggle (keyboard + screen-reader accessible) ----------
(function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", function () {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
})();

// ---------- Light/dark theme toggle (persists via localStorage) ----------
(function () {
  const STORAGE_KEY = "jenofiya-portfolio-theme";
  const root = document.documentElement;
  const btn = document.querySelector(".theme-toggle");

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function applyTheme(theme) {
    // theme is "light" or "dark"
    root.setAttribute("data-theme", theme);
    if (btn) {
      btn.setAttribute("aria-pressed", String(theme === "dark"));
      btn.textContent = theme === "dark" ? "☀ Light" : "🌙 Dark";
    }
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  applyTheme(saved || (systemPrefersDark() ? "dark" : "light"));

  if (btn) {
    btn.addEventListener("click", function () {
      const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  }

  // Follow system changes only if the user hasn't picked a theme manually
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? "dark" : "light");
      }
    });
  }
})();

// ---------- Contact form validation ----------
(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const status = document.getElementById("form-status");
  const fields = [
    { id: "name", validate: (v) => v.trim().length > 0, message: "Please enter your name." },
    {
      id: "email",
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      message: "Please enter a valid email address.",
    },
    { id: "message", validate: (v) => v.trim().length >= 10, message: "Message should be at least 10 characters." },
  ];

  function fieldEls(id) {
    const input = document.getElementById(id);
    const error = document.getElementById(id + "-error");
    return { input, error };
  }

  function validateField(fieldDef) {
    const { input, error } = fieldEls(fieldDef.id);
    if (!input) return true;
    input.dataset.touched = "true";
    const valid = fieldDef.validate(input.value);
    if (error) {
      error.textContent = valid ? "" : fieldDef.message;
      error.classList.toggle("is-visible", !valid);
    }
    input.setAttribute("aria-invalid", valid ? "false" : "true");
    return valid;
  }

  fields.forEach((fieldDef) => {
    const { input } = fieldEls(fieldDef.id);
    if (!input) return;
    input.addEventListener("blur", () => validateField(fieldDef));
    input.addEventListener("input", () => {
      if (input.dataset.touched === "true") validateField(fieldDef);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const results = fields.map(validateField);
    const allValid = results.every(Boolean);

    status.classList.remove("status-success", "status-error");

    if (!allValid) {
      status.textContent = "There are errors in the form. Please review the fields marked in red above.";
      status.classList.add("is-visible", "status-error");
      status.setAttribute("role", "alert");
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // No backend is wired up yet — this simulates a successful submit so the
    // accessible confirmation flow can be reviewed. Replace with a real
    // fetch() call to your form endpoint when one is ready.
    status.textContent = "Thanks — your message has been received. I'll reply within a couple of days.";
    status.classList.add("is-visible", "status-success");
    status.setAttribute("role", "status");
    form.reset();
    fields.forEach((f) => {
      const { input, error } = fieldEls(f.id);
      if (input) {
        input.removeAttribute("aria-invalid");
        delete input.dataset.touched;
      }
      if (error) error.classList.remove("is-visible");
    });
  });
})();
