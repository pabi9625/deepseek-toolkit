(function () {
  const LANG_PREFIX_RE = /^Please respond only in .+?\.\n\n/i;
  const RULES_PREFIX_RE = /^\[Rules\]\n[\s\S]*?\[\/Rules\]\n\n/i;

  const storage = window.DeepSeekToolkitStorage;

  if (!storage) {
    return;
  }

  let selectedLanguage = "English";
  let activeLanguageEnforce = true;
  let quickPromptMap = new Map();
  let rules = [];
  let activeRulesEnforce = true;

  // ─── Helpers ─────────────────────────────────────────────────────────────

  function getLanguagePrefix(lang) {
    return "Please respond only in " + lang + ".\n\n";
  }

  function getRulesPrefix(rulesList) {
    if (!rulesList || !rulesList.length) return "";
    const activeRules = rulesList.filter(function (item) {
      return item.active !== false;
    });
    if (!activeRules.length) return "";
    const lines = activeRules.map(function (item, i) {
      return (i + 1) + ". " + item.rule;
    }).join("\n");
    return "[Rules]\n" + lines + "\n[/Rules]\n\n";
  }

  function isEl(el) {
    return el instanceof HTMLElement;
  }

  function notHidden(el) {
    if (!isEl(el)) return false;
    const s = window.getComputedStyle(el);
    return s.display !== "none" && s.visibility !== "hidden";
  }

  // ─── DOM Finders ─────────────────────────────────────────────────────────

  function findInputElement() {
    const order = [
      'textarea[placeholder]',
      'div[contenteditable="true"][role="textbox"]',
      'div[contenteditable="true"]',
      'textarea'
    ];
    for (const sel of order) {
      for (const node of document.querySelectorAll(sel)) {
        if (notHidden(node)) return node;
      }
    }
    return null;
  }

  // ─── Input text read/write ────────────────────────────────────────────────

  function getInputText(input) {
    if (!input) return "";
    if ("value" in input) return input.value || "";
    // For contenteditable, innerText preserves newlines better
    return input.innerText || input.textContent || "";
  }

  // React-friendly setter for both textarea and contenteditable
  function setInputText(input, text) {
    if (!input) return;

    if ("value" in input) {
      // Trigger React's synthetic onChange via native setter
      const proto = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value") ||
                    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
      if (proto && proto.set) {
        proto.set.call(input, text);
      } else {
        input.value = text;
      }
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }

    // contenteditable — use execCommand so React's event loop sees the change
    input.focus();
    const sel = window.getSelection();
    if (sel) {
      const r = document.createRange();
      r.selectNodeContents(input);
      sel.removeAllRanges();
      sel.addRange(r);
    }

    let ok = false;
    try {
      ok = document.execCommand("insertText", false, text);
    } catch (_) {}

    // Verify execCommand actually worked
    const got = (input.innerText || input.textContent || "").trim();
    if (!ok || got !== text.trim()) {
      // Direct fallback — clear and set innerText, then dispatch InputEvent
      while (input.firstChild) input.removeChild(input.firstChild);
      input.appendChild(document.createTextNode(text));
      input.dispatchEvent(
        new InputEvent("input", { bubbles: true, cancelable: true, inputType: "insertText", data: text })
      );
    }

    // Cursor to end
    const s2 = window.getSelection();
    if (s2 && input.lastChild) {
      const r2 = document.createRange();
      r2.selectNodeContents(input);
      r2.collapse(false);
      s2.removeAllRanges();
      s2.addRange(r2);
    }
  }

  // ─── State ────────────────────────────────────────────────────────────────

  function refreshQuickPromptMap(items) {
    quickPromptMap = new Map();
    for (const item of items) {
      const code = storage.normalizeCode(item.code).toLowerCase();
      if (code && item.prompt) quickPromptMap.set(code, item.prompt);
    }
  }

  async function loadState() {
    const [nextLanguage, nextQuickPrompts, nextActiveLanguageEnforce, nextRules, nextActiveRulesEnforce] = await Promise.all([
      storage.getSelectedLanguage(),
      storage.getQuickPrompts(),
      storage.getActiveLanguageEnforce(),
      storage.getRules(),
      storage.getActiveRulesEnforce()
    ]);
    selectedLanguage = nextLanguage;
    activeLanguageEnforce = Boolean(nextActiveLanguageEnforce);
    refreshQuickPromptMap(nextQuickPrompts);
    rules = nextRules;
    activeRulesEnforce = Boolean(nextActiveRulesEnforce);
  }

  // ─── Quick Prompt Expansion ───────────────────────────────────────────────

  function maybeExpandCodeword(input) {
    const value = getInputText(input);
  // Expand only after the user finishes a code token with whitespace (e.g. "/assignment ").
  const next = value.replace(/(^|\s)(\/[^\s]+)(?=\s)/g, (fullMatch, prefix, rawCode) => {
      const code = storage.normalizeCode(rawCode).toLowerCase();
      const prompt = quickPromptMap.get(code);
      if (!prompt) return fullMatch;
      return prefix + prompt;
    });
    if (next === value) return;
    setInputText(input, next);
  }

  // ─── Language Prefix Enforcement ─────────────────────────────────────────

  function ensurePrefixes() {
    const input = findInputElement();
    if (!input) return;

    const current = getInputText(input);
    if (!current.trim()) return;

    let body = current.replace(RULES_PREFIX_RE, "").replace(LANG_PREFIX_RE, "");

    let prefix = "";

    if (activeRulesEnforce && rules.length) {
      prefix += getRulesPrefix(rules);
    }

    if (activeLanguageEnforce) {
      prefix += getLanguagePrefix(selectedLanguage);
    }

    const desired = prefix + body;

    if (desired === current) return;
    setInputText(input, desired);
  }

  // ─── Event Wiring ─────────────────────────────────────────────────────────

  function isSendTrigger(el) {
    if (!isEl(el)) return false;
    const btn = el.closest("button");
    if (!btn) return false;
    const label = (
      (btn.getAttribute("aria-label") || "") + " " + (btn.innerText || btn.textContent || "")
    ).toLowerCase();
    // DeepSeek's send button has an SVG arrow; also check submit type
    return (
      label.includes("send") ||
      btn.type === "submit" ||
      label.includes("arrow") ||
      btn.getAttribute("aria-label") === "" && btn.closest("form") !== null
    );
  }

  function attachInputListeners() {
    document.addEventListener("input", (e) => {
      const t = e.target;
      if (isEl(t) && t.matches('textarea, [contenteditable="true"]')) {
        maybeExpandCodeword(t);
      }
    }, true);

    document.addEventListener("keydown", (e) => {
      const t = e.target;
      if (!isEl(t) || !t.matches('textarea, [contenteditable="true"]')) return;
      if (e.key === "Enter" && !e.shiftKey) {
        ensurePrefixes();
      }
    }, true);

    document.addEventListener("submit", () => ensurePrefixes(), true);

    for (const evtName of ["pointerdown", "click"]) {
      document.addEventListener(evtName, (e) => {
        if (isSendTrigger(e.target)) ensurePrefixes();
      }, true);
    }
  }

  function attachStorageListener() {
    if (!chrome.storage || !chrome.storage.onChanged) return;
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "local") return;
      if (changes.selectedLanguage) {
        selectedLanguage = changes.selectedLanguage.newValue || "English";
      }
      if (changes.activeLanguageEnforce) {
        activeLanguageEnforce = Boolean(changes.activeLanguageEnforce.newValue);
      }
      if (changes.quickPrompts) {
        refreshQuickPromptMap(storage.sanitizeQuickPrompts(changes.quickPrompts.newValue || []));
      }
      if (changes.rules) {
        rules = storage.sanitizeRules(changes.rules.newValue || []);
      }
      if (changes.activeRulesEnforce) {
        activeRulesEnforce = Boolean(changes.activeRulesEnforce.newValue);
      }
    });
  }

  // ─── Chat Export (DOM Scraping) ──────────────────────────────────────────

  function htmlToMarkdown(el) {
    if (!el) return "";
    var md = "";

    for (var node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        md += node.textContent;
        continue;
      }
      if (!(node instanceof HTMLElement)) continue;

      var tag = node.tagName.toLowerCase();

      if (tag === "pre") {
        var codeEl = node.querySelector("code");
        var lang = "";
        if (codeEl) {
          var cls = codeEl.className || "";
          var m = cls.match(/language-(\S+)/);
          if (m) lang = m[1];
        }
        var codeText = (codeEl || node).textContent || "";
        md += "\n```" + lang + "\n" + codeText + "\n```\n";
        continue;
      }

      if (tag === "code") {
        md += "`" + (node.textContent || "") + "`";
        continue;
      }

      if (tag === "strong" || tag === "b") {
        md += "**" + htmlToMarkdown(node) + "**";
        continue;
      }

      if (tag === "em" || tag === "i") {
        md += "*" + htmlToMarkdown(node) + "*";
        continue;
      }

      if (tag === "a") {
        var href = node.getAttribute("href") || "";
        md += "[" + htmlToMarkdown(node) + "](" + href + ")";
        continue;
      }

      if (tag === "br") {
        md += "\n";
        continue;
      }

      if (tag === "hr") {
        md += "\n---\n";
        continue;
      }

      if (/^h[1-6]$/.test(tag)) {
        var level = parseInt(tag[1], 10);
        md += "\n" + "#".repeat(level) + " " + htmlToMarkdown(node) + "\n";
        continue;
      }

      if (tag === "p") {
        md += "\n" + htmlToMarkdown(node) + "\n";
        continue;
      }

      if (tag === "blockquote") {
        var inner = htmlToMarkdown(node).trim().split("\n").map(function (l) { return "> " + l; }).join("\n");
        md += "\n" + inner + "\n";
        continue;
      }

      if (tag === "ul" || tag === "ol") {
        var items = node.querySelectorAll(":scope > li");
        items.forEach(function (li, idx) {
          var bullet = tag === "ol" ? (idx + 1) + ". " : "- ";
          md += bullet + htmlToMarkdown(li).trim() + "\n";
        });
        md += "\n";
        continue;
      }

      if (tag === "li") {
        md += htmlToMarkdown(node);
        continue;
      }

      if (tag === "table") {
        var rows = node.querySelectorAll("tr");
        rows.forEach(function (tr, rIdx) {
          var cells = tr.querySelectorAll("th, td");
          var line = "| " + Array.from(cells).map(function (c) { return htmlToMarkdown(c).trim(); }).join(" | ") + " |";
          md += line + "\n";
          if (rIdx === 0) {
            md += "| " + Array.from(cells).map(function () { return "---"; }).join(" | ") + " |\n";
          }
        });
        md += "\n";
        continue;
      }

      md += htmlToMarkdown(node);
    }

    return md;
  }

  function scrapeChatToMarkdown() {
    var turns = [];
    var firstUserMsg = "";

    // ── Assistant content: .ds-markdown blocks that are NOT inside a think-content container
    var assistantMdEls = Array.from(document.body.querySelectorAll('.ds-markdown')).filter(function(el) {
      return !el.closest('[class*="think-content"]');
    });

    // ── User messages: [class*="ds-message"] elements that contain NO non-think .ds-markdown
    var allMsgEls = Array.from(document.body.querySelectorAll('[class*="ds-message"]'));
    var userMsgEls = allMsgEls.filter(function(el) {
      var hasResponseMd = Array.from(el.querySelectorAll('.ds-markdown')).some(function(md) {
        return !md.closest('[class*="think-content"]');
      });
      return !hasResponseMd;
    });

    // ── Combine and sort by DOM order
    var combined = [];
    assistantMdEls.forEach(function(el) { combined.push({ el: el, role: "Assistant" }); });
    userMsgEls.forEach(function(el) { combined.push({ el: el, role: "User" }); });

    combined.sort(function(a, b) {
      var pos = a.el.compareDocumentPosition(b.el);
      return (pos & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
    });

    combined.forEach(function(item) {
      if (item.role === "Assistant") {
        var content = htmlToMarkdown(item.el).trim();
        if (content) turns.push({ role: "Assistant", content: content });
      } else {
        var text = (item.el.innerText || item.el.textContent || "").trim();
        if (text) {
          if (!firstUserMsg) firstUserMsg = text;
          turns.push({ role: "User", content: text });
        }
      }
    });

    if (turns.length === 0) {
      return null;
    }

    // Prefer browser tab title (DeepSeek sets it to the chat name), strip the " - DeepSeek" suffix
    var tabTitle = document.title ? document.title.replace(/\s*[-–|]\s*DeepSeek.*$/i, "").trim() : "";
    // Fallback: look for a visible title element in the page
    var titleEl = document.querySelector('[class*="chat-title"], [class*="conversation-title"], [class*="title"]');
    var domTitle = (titleEl && titleEl.textContent) ? titleEl.textContent.trim() : "";
    var title = tabTitle || domTitle || firstUserMsg || "DeepSeek Chat";
    if (title.length > 60) title = title.substring(0, 60) + "...";

    var md = "# " + title + "\n\n";
    turns.forEach(function(turn) {
      md += "---\n\n";
      md += "## " + turn.role + "\n\n";
      md += turn.content + "\n\n";
    });

    return { title: title, markdown: md };
  }

  function attachExportListener() {
    if (!chrome.runtime || !chrome.runtime.onMessage) return;
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
      if (message.action !== "export-chat") return false;

      try {
        var result = scrapeChatToMarkdown();
        if (!result) {
          sendResponse({ error: "No conversation found on this page." });
        } else {
          sendResponse(result);
        }
      } catch (err) {
        sendResponse({ error: "Failed to scrape chat: " + (err.message || err) });
      }

      return true;
    });
  }

  // ─── Init ─────────────────────────────────────────────────────────────────

  async function init() {
    await loadState();
    attachInputListeners();
    attachStorageListener();
    attachExportListener();
  }

  init().catch(() => {});
})();
