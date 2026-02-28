(function () {
  const storage = window.DeepSeekToolkitStorage;
  const curatedLanguages = (
    (window.DeepSeekToolkitLanguages && window.DeepSeekToolkitLanguages.CURATED_LANGUAGES) || ["English"]
  )
    .slice()
    .sort((a, b) => a.localeCompare(b));

  let quickPrompts = [];
  let editingCode = "";
  let currentSelectedLanguage = "";
  let dropdownVisible = false;

  function $(id) {
    return document.getElementById(id);
  }

  function setStatus(message, isError) {
    const statusText = $("statusText");
    if (!statusText) {
      return;
    }
    statusText.textContent = message || "";
    statusText.classList.toggle("error", Boolean(isError));
  }

  function setEnforceStateText(enabled) {
    const stateText = $("activeLanguageEnforceState");
    if (!stateText) {
      return;
    }
    stateText.classList.toggle("off", !enabled);
    stateText.textContent = enabled ? "ON" : "OFF";
  }

  function applyTheme(theme) {
    document.body.classList.toggle("light", theme === "light");
    const toggle = $("themeToggle");
    if (toggle) {
      toggle.checked = theme === "light";
    }
  }

  function renderLanguageOptions(languages, selectedLanguage) {
    const dropdownList = $("languageDropdownList");
    if (!dropdownList) {
      return;
    }
    dropdownList.innerHTML = "";

    if (!languages.length) {
      const empty = document.createElement("p");
      empty.className = "language-dropdown-empty";
      empty.textContent = "No languages found";
      dropdownList.appendChild(empty);
      return;
    }

    for (const language of languages) {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "language-dropdown-option";
      option.textContent = language;
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", String(language === selectedLanguage));
      if (language === selectedLanguage) {
        option.classList.add("selected");
      }
      option.addEventListener("click", async () => {
        await setSelectedLanguage(language);
        hideLanguageDropdown();
      });
      dropdownList.appendChild(option);
    }
  }

  function scoreLanguageMatch(language, queryText) {
    const query = String(queryText || "").trim().toLowerCase();
    if (!query) {
      return 0;
    }

    const normalizedLanguage = language.toLowerCase();
    if (normalizedLanguage.startsWith(query)) {
      return 0;
    }

    const words = normalizedLanguage.split(/[\s()/-]+/).filter(Boolean);
    if (words.some((word) => word.startsWith(query))) {
      return 1;
    }

    if (normalizedLanguage.includes(query)) {
      return 2;
    }

    return Number.POSITIVE_INFINITY;
  }

  function getSortedLanguages(queryText) {
    const ranked = [];
    for (const language of curatedLanguages) {
      const score = scoreLanguageMatch(language, queryText);
      if (score !== Number.POSITIVE_INFINITY) {
        ranked.push({ language, score });
      }
    }

    ranked.sort((a, b) => {
      if (a.score !== b.score) {
        return a.score - b.score;
      }
      return a.language.localeCompare(b.language);
    });

    return ranked.map((item) => item.language);
  }

  function refreshLanguageOptions() {
    const searchInput = $("languageSearchInput");
    if (!searchInput) {
      return;
    }
    const queryText = searchInput ? searchInput.value : "";
    const options = getSortedLanguages(queryText);
    renderLanguageOptions(options, currentSelectedLanguage);
  }

  function showLanguageDropdown() {
    const combobox = $("languageSearchCombobox");
    const dropdownList = $("languageDropdownList");
    if (!combobox || !dropdownList) {
      return;
    }
    dropdownVisible = true;
    dropdownList.classList.add("open");
    combobox.setAttribute("aria-expanded", "true");
    refreshLanguageOptions();
  }

  function hideLanguageDropdown() {
    const combobox = $("languageSearchCombobox");
    const dropdownList = $("languageDropdownList");
    if (!combobox || !dropdownList) {
      return;
    }
    dropdownVisible = false;
    dropdownList.classList.remove("open");
    combobox.setAttribute("aria-expanded", "false");
  }

  async function setSelectedLanguage(languageText) {
    const language = String(languageText || "").trim();
    const savedLanguageText = $("savedLanguageText");
    const searchInput = $("languageSearchInput");
    if (!language) {
      return;
    }
    currentSelectedLanguage = await storage.setSelectedLanguage(language);
    if (searchInput) {
      searchInput.value = currentSelectedLanguage;
    }
    if (savedLanguageText) {
      savedLanguageText.textContent = "Saved language: " + currentSelectedLanguage;
      savedLanguageText.hidden = false;
    }
    setStatus("Language saved automatically.", false);
  }

  function renderPromptList() {
    const list = $("promptList");
    if (!list) {
      return;
    }
    list.innerHTML = "";

    if (!quickPrompts.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "No saved prompts yet.";
      list.appendChild(empty);
      return;
    }

    for (const item of quickPrompts) {
      const row = document.createElement("article");
      row.className = "prompt-item";

      const code = document.createElement("p");
      code.className = "prompt-code";
      code.textContent = item.code;

      const prompt = document.createElement("p");
      prompt.className = "prompt-preview";
      prompt.textContent = item.prompt;

      const actionRow = document.createElement("div");
      actionRow.className = "row";

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "action-btn secondary";
      editButton.textContent = "Edit";
      editButton.addEventListener("click", () => {
        const codeInput = $("codeInput");
        const promptInput = $("promptInput");
        if (!codeInput || !promptInput) {
          return;
        }
        codeInput.value = item.code;
        promptInput.value = item.prompt;
        editingCode = item.code.toLowerCase();
        setStatus("Editing " + item.code, false);
      });

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "action-btn danger";
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", async () => {
        quickPrompts = quickPrompts.filter((entry) => entry.code.toLowerCase() !== item.code.toLowerCase());
        quickPrompts = await storage.setQuickPrompts(quickPrompts);
        if (editingCode === item.code.toLowerCase()) {
          resetForm();
        }
        renderPromptList();
        setStatus("Deleted " + item.code, false);
      });

      actionRow.appendChild(editButton);
      actionRow.appendChild(deleteButton);

      row.appendChild(code);
      row.appendChild(prompt);
      row.appendChild(actionRow);
      list.appendChild(row);
    }
  }

  function resetForm() {
    const codeInput = $("codeInput");
    const promptInput = $("promptInput");
    if (!codeInput || !promptInput) {
      return;
    }
    codeInput.value = "";
    promptInput.value = "";
    editingCode = "";
    setStatus("", false);
  }

  async function savePrompt() {
    const codeInput = $("codeInput");
    const promptInput = $("promptInput");
    if (!codeInput || !promptInput) {
      return;
    }

    const code = storage.normalizeCode(codeInput.value);
    const prompt = String(promptInput.value || "").trim();

    if (!code || code.length < 2) {
      setStatus("Code is required and must start with /", true);
      return;
    }

    if (!prompt) {
      setStatus("Prompt is required.", true);
      return;
    }

    const codeKey = code.toLowerCase();
    const duplicate = quickPrompts.find((item) => item.code.toLowerCase() === codeKey);
    const isSameEdit = editingCode && editingCode === codeKey;

    if (duplicate && !isSameEdit) {
      setStatus("Code already exists. Use another code or edit the existing one.", true);
      return;
    }

    const nextItem = { code, prompt };
    if (isSameEdit) {
      quickPrompts = quickPrompts.map((item) => (item.code.toLowerCase() === codeKey ? nextItem : item));
    } else if (editingCode && editingCode !== codeKey) {
      quickPrompts = quickPrompts
        .filter((item) => item.code.toLowerCase() !== editingCode)
        .concat(nextItem);
    } else {
      quickPrompts = quickPrompts.concat(nextItem);
    }

    quickPrompts = await storage.setQuickPrompts(quickPrompts);
    renderPromptList();
    resetForm();
    setStatus("Prompt saved.", false);
  }

  async function init() {
    if (!storage) {
      return;
    }

    const hasPromptPanel = Boolean($("promptList") || $("codeInput") || $("promptInput"));
    if (hasPromptPanel) {
      quickPrompts = await storage.getQuickPrompts();
      renderPromptList();
    }
    applyTheme("dark");
    const hasLanguagePanel = Boolean($("languageSearchInput") || $("languageDropdownList"));
    if (hasLanguagePanel) {
      currentSelectedLanguage = await storage.getSelectedLanguage();
    }

    const activeLanguageEnforceToggle = $("activeLanguageEnforceToggle");
    if (activeLanguageEnforceToggle) {
      const activeLanguageEnforce = await storage.getActiveLanguageEnforce();
      activeLanguageEnforceToggle.checked = Boolean(activeLanguageEnforce);
      setEnforceStateText(Boolean(activeLanguageEnforce));
      activeLanguageEnforceToggle.addEventListener("change", async (event) => {
        const enabled = await storage.setActiveLanguageEnforce(Boolean(event.target.checked));
        setEnforceStateText(enabled);
        setStatus(
          enabled ? "Language enforcement enabled." : "Language enforcement disabled.",
          false
        );
      });
    }

    const hasSavedLanguage =
      hasLanguagePanel && storage.hasSelectedLanguage ? await storage.hasSelectedLanguage() : false;
    const savedLanguageText = $("savedLanguageText");
    const searchInput = $("languageSearchInput");
    if (savedLanguageText) {
      if (hasSavedLanguage) {
        savedLanguageText.textContent = "Saved language: " + currentSelectedLanguage;
        savedLanguageText.hidden = false;
      } else {
        savedLanguageText.hidden = true;
      }
    }
    if (searchInput && hasSavedLanguage) {
      searchInput.value = currentSelectedLanguage;
    }
    if (hasLanguagePanel) {
      refreshLanguageOptions();
    }

    const savePromptBtn = $("savePromptBtn");
    const resetFormBtn = $("resetFormBtn");
    if (savePromptBtn) {
      savePromptBtn.addEventListener("click", savePrompt);
    }
    if (resetFormBtn) {
      resetFormBtn.addEventListener("click", resetForm);
    }
    if (searchInput) {
      searchInput.addEventListener("focus", () => {
        showLanguageDropdown();
      });
      searchInput.addEventListener("click", () => {
        showLanguageDropdown();
      });
      searchInput.addEventListener("input", () => {
        showLanguageDropdown();
        refreshLanguageOptions();
      });
      searchInput.addEventListener("keydown", async (event) => {
        if (event.key === "Escape") {
          hideLanguageDropdown();
          return;
        }
        if (event.key === "Enter") {
          event.preventDefault();
          const queryText = String(event.target.value || "").trim().toLowerCase();
          const exactMatch = curatedLanguages.find((language) => language.toLowerCase() === queryText);
          if (exactMatch) {
            await setSelectedLanguage(exactMatch);
            hideLanguageDropdown();
            return;
          }
          const options = getSortedLanguages(event.target.value);
          if (options.length) {
            await setSelectedLanguage(options[0]);
            hideLanguageDropdown();
          }
        }
      });
    }
    document.addEventListener("click", (event) => {
      const pickerSection = $("languagePickerSection");
      if (!dropdownVisible || !pickerSection) {
        return;
      }
      if (!pickerSection.contains(event.target)) {
        hideLanguageDropdown();
      }
    });
    const themeToggle = $("themeToggle");
    if (themeToggle) {
      themeToggle.addEventListener("change", async (event) => {
        const isLight = Boolean(event.target.checked);
        const nextTheme = await storage.setTheme(isLight ? "light" : "dark");
        applyTheme(nextTheme);
      });
    }
  }

  init();
})();
