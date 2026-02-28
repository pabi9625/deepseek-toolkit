(function () {
  const storage = window.DeepSeekToolkitStorage;
  const curatedLanguages =
    (window.DeepSeekToolkitLanguages && window.DeepSeekToolkitLanguages.CURATED_LANGUAGES) || ["English"];

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
    const enforceState = $("enforceLanguageState");
    if (!enforceState) {
      return;
    }
    enforceState.classList.toggle("off", !enabled);
    enforceState.textContent = enabled ? "ON" : "OFF";
  }

  function setRulesEnforceStateText(enabled) {
    const rulesState = $("enforceRulesState");
    if (!rulesState) {
      return;
    }
    rulesState.classList.toggle("off", !enabled);
    rulesState.textContent = enabled ? "ON" : "OFF";
  }

  function populateLanguageSelect(selectEl, selectedLanguage) {
    if (!selectEl) {
      return;
    }
    selectEl.innerHTML = "";

    for (const language of curatedLanguages) {
      const option = document.createElement("option");
      option.value = language;
      option.textContent = language;
      if (language === selectedLanguage) {
        option.selected = true;
      }
      selectEl.appendChild(option);
    }
  }

  function setupCustomLanguageDropdown(selectEl) {
    const dropdown = $("languageDropdown");
    const trigger = $("languageDropdownTrigger");
    const valueText = $("languageDropdownValue");
    const menu = $("languageDropdownMenu");
    if (!dropdown || !trigger || !valueText || !menu || !selectEl) {
      return;
    }

    function closeMenu() {
      dropdown.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
    }

    function openMenu() {
      dropdown.classList.add("open");
      trigger.setAttribute("aria-expanded", "true");
    }

    function syncSelectedValue() {
      const selectedOption = selectEl.options[selectEl.selectedIndex];
      valueText.textContent = selectedOption ? selectedOption.textContent : "Select language";
      menu.querySelectorAll(".ds-select-option").forEach((button) => {
        button.classList.toggle("selected", button.dataset.value === selectEl.value);
      });
    }

    function renderOptions() {
      menu.innerHTML = "";
      for (const option of Array.from(selectEl.options)) {
        const optionButton = document.createElement("button");
        optionButton.type = "button";
        optionButton.className = "ds-select-option";
        optionButton.dataset.value = option.value;
        optionButton.setAttribute("role", "option");
        optionButton.textContent = option.textContent;
        optionButton.addEventListener("click", () => {
          const previousValue = selectEl.value;
          selectEl.value = option.value;
          syncSelectedValue();
          closeMenu();
          if (previousValue !== option.value) {
            selectEl.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
        menu.appendChild(optionButton);
      }
      syncSelectedValue();
    }

    trigger.addEventListener("click", () => {
      if (dropdown.classList.contains("open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener("click", (event) => {
      if (!dropdown.contains(event.target)) {
        closeMenu();
      }
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (dropdown.classList.contains("open")) {
          closeMenu();
        } else {
          openMenu();
        }
      }
    });

    selectEl.addEventListener("change", syncSelectedValue);
    renderOptions();
  }

  async function saveSelectedLanguage(language) {
    const normalizedLanguage = String(language || "").trim();
    if (!normalizedLanguage) {
      setStatus("Please choose a language.", true);
      return;
    }

    try {
      await storage.setSelectedLanguage(normalizedLanguage);
      setStatus("Language saved.", false);
    } catch (error) {
      setStatus("Unable to save language.", true);
    }
  }

  // ─── Export Chat ──────────────────────────────────────────────────────────

  function sanitizeFilename(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .substring(0, 50) || "deepseek-chat";
  }

  let pendingMarkdown = null;

  function setupExportChat() {
    const exportBtn = $("exportChatBtn");
    const filenameRow = $("exportFilenameRow");
    const filenameInput = $("exportFilenameInput");
    const downloadBtn = $("exportDownloadBtn");

    if (!exportBtn || !filenameRow || !filenameInput || !downloadBtn) {
      return;
    }

    exportBtn.addEventListener("click", () => {
      exportBtn.disabled = true;
      exportBtn.textContent = "Exporting...";
      exportBtn.classList.add("loading");
      filenameRow.classList.add("hidden");
      pendingMarkdown = null;
      setStatus("", false);

      chrome.runtime.sendMessage({ action: "export-chat" }, (response) => {
        exportBtn.disabled = false;
        exportBtn.textContent = "Export Chat";
        exportBtn.classList.remove("loading");

        if (chrome.runtime.lastError) {
          setStatus("Could not connect to the page.", true);
          return;
        }

        if (!response || response.error) {
          setStatus(response ? response.error : "No response from page.", true);
          return;
        }

        pendingMarkdown = response.markdown;
        filenameInput.value = sanitizeFilename(response.title) + ".md";
        filenameRow.classList.remove("hidden");
        filenameInput.focus();
        filenameInput.select();
        setStatus("Ready to download.", false);
      });
    });

    downloadBtn.addEventListener("click", () => {
      if (!pendingMarkdown) {
        setStatus("Nothing to download.", true);
        return;
      }

      let filename = filenameInput.value.trim();
      if (!filename) {
        filename = "deepseek-chat.md";
      }
      if (!filename.endsWith(".md")) {
        filename += ".md";
      }

      const blob = new Blob([pendingMarkdown], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      setStatus("Downloaded: " + filename, false);
      filenameRow.classList.add("hidden");
      pendingMarkdown = null;
    });

    filenameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        downloadBtn.click();
      }
    });
  }

  // ─── Init ────────────────────────────────────────────────────────────────

  async function init() {
    const languageSelect = $("languageSelect");
    const enforceLanguageToggle = $("enforceLanguageToggle");
    const enforceRulesToggle = $("enforceRulesToggle");
    const openManagerBtn = $("openManagerBtn");

    if (!storage || !languageSelect || !enforceLanguageToggle || !openManagerBtn) {
      return;
    }

    const [selectedLanguage, activeLanguageEnforce, activeRulesEnforce] = await Promise.all([
      storage.getSelectedLanguage(),
      storage.getActiveLanguageEnforce(),
      storage.getActiveRulesEnforce()
    ]);

    populateLanguageSelect(languageSelect, selectedLanguage);
    setupCustomLanguageDropdown(languageSelect);
    enforceLanguageToggle.checked = Boolean(activeLanguageEnforce);
    setEnforceStateText(Boolean(activeLanguageEnforce));

    if (enforceRulesToggle) {
      enforceRulesToggle.checked = Boolean(activeRulesEnforce);
      setRulesEnforceStateText(Boolean(activeRulesEnforce));

      enforceRulesToggle.addEventListener("change", async () => {
        try {
          const enabled = await storage.setActiveRulesEnforce(enforceRulesToggle.checked);
          setRulesEnforceStateText(enabled);
          setStatus(enabled ? "Rules enforcement enabled." : "Rules enforcement disabled.", false);
        } catch (error) {
          setStatus("Unable to update rules enforcement.", true);
        }
      });
    }

    openManagerBtn.addEventListener("click", () => {
      chrome.runtime.openOptionsPage();
    });

    languageSelect.addEventListener("change", async () => {
      await saveSelectedLanguage(languageSelect.value);
    });

    enforceLanguageToggle.addEventListener("change", async () => {
      try {
        const enabled = await storage.setActiveLanguageEnforce(enforceLanguageToggle.checked);
        setEnforceStateText(enabled);
        setStatus(enabled ? "Language enforcement enabled." : "Language enforcement disabled.", false);
      } catch (error) {
        setStatus("Unable to update enforcement.", true);
      }
    });

    setupExportChat();
  }

  init();
})();
