(function () {
  const COLLAPSED_KEY = "dstoolkit_sidebar_collapsed";

  function setActiveNavButton(activeButton) {
    const buttons = document.querySelectorAll(".sidebar-nav-btn");
    buttons.forEach((button) => {
      button.classList.toggle("active", button === activeButton);
    });
  }

  function setHeaderForButton(button) {
    const title = button.getAttribute("data-title") || "Workspace";
    const subtitles = {
      "Language Selection": "Configure the default response language for quick prompts.",
      "Quick Prompt": "Create, edit, and organize reusable quick prompts.",
      "Rules": "Define rules that are automatically prefixed to every chat message."
    };
    const subtitle = subtitles[title] || "Manage your toolkit settings.";
    const titleNode = document.getElementById("managerPageTitle");
    const subtitleNode = document.getElementById("managerPageSubtitle");
    if (titleNode) {
      titleNode.textContent = title;
    }
    if (subtitleNode) {
      subtitleNode.textContent = subtitle;
    }
  }

  function setSidebarCollapsed(collapsed) {
    const layout = document.querySelector(".manager-layout");
    const expandBtn = document.getElementById("sidebarExpandBtn");
    if (!layout) return;

    layout.classList.toggle("sidebar-collapsed", collapsed);
    if (expandBtn) {
      expandBtn.hidden = !collapsed;
    }

    try {
      localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
    } catch (_) {}
  }

  function isSidebarCollapsed() {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === "1";
    } catch (_) {
      return false;
    }
  }

  function setupSidebarToggle() {
    const toggleBtn = document.getElementById("sidebarToggleBtn");
    const expandBtn = document.getElementById("sidebarExpandBtn");
    const layout = document.querySelector(".manager-layout");
    if (!layout) return;

    if (isSidebarCollapsed()) {
      setSidebarCollapsed(true);
    }

    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        const isCollapsed = layout.classList.contains("sidebar-collapsed");
        setSidebarCollapsed(!isCollapsed);
      });
    }

    if (expandBtn) {
      expandBtn.addEventListener("click", () => {
        setSidebarCollapsed(false);
      });
    }
  }

  function setupNavigation() {
    const frame = document.getElementById("managerFrame");
    if (!frame) return;

    const buttons = document.querySelectorAll(".sidebar-nav-btn");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const page = button.getAttribute("data-page");
        if (!page) return;
        frame.setAttribute("src", page);
        setActiveNavButton(button);
        setHeaderForButton(button);
      });
    });

    const defaultButton = document.querySelector(".sidebar-nav-btn.active");
    if (defaultButton) {
      setHeaderForButton(defaultButton);
    }
  }

  setupSidebarToggle();
  setupNavigation();
})();
