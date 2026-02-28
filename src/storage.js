(function () {
  const DEFAULTS = {
    selectedLanguage: "English",
    activeLanguageEnforce: true,
    quickPrompts: [],
    theme: "dark",
    rules: [],
    activeRulesEnforce: true
  };

  const KEYS = {
    selectedLanguage: "selectedLanguage",
    activeLanguageEnforce: "activeLanguageEnforce",
    quickPrompts: "quickPrompts",
    theme: "theme",
    rules: "rules",
    activeRulesEnforce: "activeRulesEnforce"
  };

  function getStorageArea() {
    if (!chrome || !chrome.storage || !chrome.storage.local) {
      throw new Error("chrome.storage.local is unavailable.");
    }
    return chrome.storage.local;
  }

  function get(keys) {
    return new Promise((resolve) => {
      getStorageArea().get(keys, (result) => resolve(result || {}));
    });
  }

  function set(values) {
    return new Promise((resolve) => {
      getStorageArea().set(values, () => resolve());
    });
  }

  function normalizeCode(rawCode) {
    const code = String(rawCode || "").trim();
    if (!code) {
      return "";
    }
    return code.startsWith("/") ? code : "/" + code;
  }

  function sanitizeQuickPrompts(items) {
    if (!Array.isArray(items)) {
      return [];
    }

    const seen = new Set();
    const sanitized = [];

    for (const item of items) {
      const code = normalizeCode(item && item.code);
      const prompt = String((item && item.prompt) || "").trim();

      if (!code || !prompt || seen.has(code.toLowerCase())) {
        continue;
      }

      seen.add(code.toLowerCase());
      sanitized.push({ code, prompt });
    }

    return sanitized;
  }

  async function getSelectedLanguage() {
    const result = await get([KEYS.selectedLanguage]);
    return result[KEYS.selectedLanguage] || DEFAULTS.selectedLanguage;
  }

  async function hasSelectedLanguage() {
    const result = await get([KEYS.selectedLanguage]);
    const value = result[KEYS.selectedLanguage];
    return typeof value === "string" && value.trim().length > 0;
  }

  async function setSelectedLanguage(language) {
    const nextLanguage = String(language || "").trim() || DEFAULTS.selectedLanguage;
    await set({ [KEYS.selectedLanguage]: nextLanguage });
    return nextLanguage;
  }

  async function getActiveLanguageEnforce() {
    const result = await get([KEYS.activeLanguageEnforce]);
    const value = result[KEYS.activeLanguageEnforce];
    if (typeof value === "boolean") {
      return value;
    }
    return DEFAULTS.activeLanguageEnforce;
  }

  async function setActiveLanguageEnforce(isActive) {
    const nextValue = Boolean(isActive);
    await set({ [KEYS.activeLanguageEnforce]: nextValue });
    return nextValue;
  }

  async function getQuickPrompts() {
    const result = await get([KEYS.quickPrompts]);
    return sanitizeQuickPrompts(result[KEYS.quickPrompts] || DEFAULTS.quickPrompts);
  }

  async function setQuickPrompts(prompts) {
    const next = sanitizeQuickPrompts(prompts);
    await set({ [KEYS.quickPrompts]: next });
    return next;
  }

  function sanitizeRules(items) {
    if (!Array.isArray(items)) {
      return [];
    }
    const sanitized = [];
    for (const item of items) {
      const rule = String((item && item.rule) || "").trim();
      if (!rule) continue;
      const active = item && typeof item.active === "boolean" ? item.active : true;
      sanitized.push({ rule, active });
    }
    return sanitized;
  }

  async function getRules() {
    const result = await get([KEYS.rules]);
    return sanitizeRules(result[KEYS.rules] || DEFAULTS.rules);
  }

  async function setRules(rules) {
    const next = sanitizeRules(rules);
    await set({ [KEYS.rules]: next });
    return next;
  }

  async function getActiveRulesEnforce() {
    const result = await get([KEYS.activeRulesEnforce]);
    const value = result[KEYS.activeRulesEnforce];
    if (typeof value === "boolean") {
      return value;
    }
    return DEFAULTS.activeRulesEnforce;
  }

  async function setActiveRulesEnforce(isActive) {
    const nextValue = Boolean(isActive);
    await set({ [KEYS.activeRulesEnforce]: nextValue });
    return nextValue;
  }

  async function getTheme() {
    const result = await get([KEYS.theme]);
    const theme = result[KEYS.theme];
    return theme === "light" ? "light" : DEFAULTS.theme;
  }

  async function setTheme(theme) {
    const nextTheme = theme === "light" ? "light" : "dark";
    await set({ [KEYS.theme]: nextTheme });
    return nextTheme;
  }

  window.DeepSeekToolkitStorage = {
    DEFAULTS,
    KEYS,
    normalizeCode,
    sanitizeQuickPrompts,
    sanitizeRules,
    getSelectedLanguage,
    hasSelectedLanguage,
    setSelectedLanguage,
    getActiveLanguageEnforce,
    setActiveLanguageEnforce,
    getQuickPrompts,
    setQuickPrompts,
    getRules,
    setRules,
    getActiveRulesEnforce,
    setActiveRulesEnforce,
    getTheme,
    setTheme
  };
})();
