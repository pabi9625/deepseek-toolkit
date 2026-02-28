(function () {
  const storage = window.DeepSeekToolkitStorage;

  let rules = [];
  let editingIndex = -1;

  function $(id) {
    return document.getElementById(id);
  }

  function setStatus(message, isError) {
    const statusText = $("statusText");
    if (!statusText) return;
    statusText.textContent = message || "";
    statusText.classList.toggle("error", Boolean(isError));
  }

  function setEnforceStateText(enabled) {
    const stateText = $("activeRulesEnforceState");
    if (!stateText) return;
    stateText.classList.toggle("off", !enabled);
    stateText.textContent = enabled ? "ON" : "OFF";
  }

  function renderRulesList() {
    const list = $("rulesList");
    if (!list) return;
    list.innerHTML = "";

    if (!rules.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "No saved rules yet.";
      list.appendChild(empty);
      return;
    }

    for (let i = 0; i < rules.length; i++) {
      const item = rules[i];
      const isActive = item.active !== false;

      const row = document.createElement("article");
      row.className = "rules-item" + (isActive ? "" : " rules-item-inactive");

      const headerRow = document.createElement("div");
      headerRow.className = "rules-item-header";

      const index = document.createElement("span");
      index.className = "rules-item-index";
      index.textContent = "#" + (i + 1);

      const toggleLabel = document.createElement("label");
      toggleLabel.className = "rules-item-toggle";
      toggleLabel.title = isActive ? "Active — included in chat" : "Inactive — excluded from chat";

      const toggleInput = document.createElement("input");
      toggleInput.type = "checkbox";
      toggleInput.checked = isActive;
      toggleInput.addEventListener("change", async (e) => {
        rules[i] = { ...rules[i], active: Boolean(e.target.checked) };
        rules = await storage.setRules(rules);
        renderRulesList();
        setStatus(
          e.target.checked
            ? "Rule #" + (i + 1) + " added to chat."
            : "Rule #" + (i + 1) + " removed from chat.",
          false
        );
      });

      const toggleTrack = document.createElement("span");
      toggleTrack.className = "rules-item-toggle-track";
      toggleTrack.setAttribute("aria-hidden", "true");

      const toggleKnob = document.createElement("span");
      toggleKnob.className = "rules-item-toggle-knob";

      toggleTrack.appendChild(toggleKnob);
      toggleLabel.appendChild(toggleInput);
      toggleLabel.appendChild(toggleTrack);

      headerRow.appendChild(index);
      headerRow.appendChild(toggleLabel);

      const text = document.createElement("p");
      text.className = "rules-item-text";
      text.textContent = item.rule;

      const actionRow = document.createElement("div");
      actionRow.className = "row";

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "action-btn secondary";
      editButton.textContent = "Edit";
      editButton.addEventListener("click", () => {
        const ruleInput = $("ruleInput");
        if (!ruleInput) return;
        ruleInput.value = item.rule;
        editingIndex = i;
        setStatus("Editing rule #" + (i + 1), false);
      });

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "action-btn danger";
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", async () => {
        rules.splice(i, 1);
        rules = await storage.setRules(rules);
        if (editingIndex === i) resetForm();
        if (editingIndex > i) editingIndex--;
        renderRulesList();
        setStatus("Rule deleted.", false);
      });

      actionRow.appendChild(editButton);
      actionRow.appendChild(deleteButton);

      row.appendChild(headerRow);
      row.appendChild(text);
      row.appendChild(actionRow);
      list.appendChild(row);
    }
  }

  function resetForm() {
    const ruleInput = $("ruleInput");
    if (ruleInput) ruleInput.value = "";
    editingIndex = -1;
    setStatus("", false);
  }

  async function saveRule() {
    const ruleInput = $("ruleInput");
    if (!ruleInput) return;

    const rule = String(ruleInput.value || "").trim();
    if (!rule) {
      setStatus("Rule text is required.", true);
      return;
    }

    if (editingIndex >= 0 && editingIndex < rules.length) {
      const prevActive = rules[editingIndex].active !== false;
      rules[editingIndex] = { rule, active: prevActive };
    } else {
      rules.push({ rule, active: true });
    }

    rules = await storage.setRules(rules);
    renderRulesList();
    resetForm();
    setStatus("Rule saved.", false);
  }

  async function init() {
    if (!storage) return;

    rules = await storage.getRules();
    renderRulesList();

    const enforceToggle = $("activeRulesEnforceToggle");
    if (enforceToggle) {
      const active = await storage.getActiveRulesEnforce();
      enforceToggle.checked = Boolean(active);
      setEnforceStateText(Boolean(active));
      enforceToggle.addEventListener("change", async (event) => {
        const enabled = await storage.setActiveRulesEnforce(Boolean(event.target.checked));
        setEnforceStateText(enabled);
        setStatus(enabled ? "Rules enforcement enabled." : "Rules enforcement disabled.", false);
      });
    }

    const saveRuleBtn = $("saveRuleBtn");
    const resetRuleBtn = $("resetRuleBtn");
    if (saveRuleBtn) saveRuleBtn.addEventListener("click", saveRule);
    if (resetRuleBtn) resetRuleBtn.addEventListener("click", resetForm);
  }

  init();
})();
