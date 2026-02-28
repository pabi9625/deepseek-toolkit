const DEFAULT_QUICK_PROMPTS = [
  {
    code: "/analyze",
    prompt:
      "Act as a senior software engineer. Analyze the following code thoroughly.\n\n" +
      "[#GOAL]\n" +
      "1. Identify bugs, logical errors, and edge cases where the code might fail.\n" +
      "2. Evaluate performance — highlight any inefficiencies and suggest Big-O improvements.\n" +
      "3. Check for common pitfalls (off-by-one errors, null/undefined handling, race conditions).\n" +
      "4. Provide an improved version of the code with clear explanations for every change.\n\n" +
      "[#RESPONSE GUIDELINES]\n" +
      "- Use numbered sections: Bugs, Performance, Edge Cases, Improved Code.\n" +
      "- Show before/after comparisons for each fix.\n\n" +
      "Code to analyze:\n"
  },
  {
    code: "/review",
    prompt:
      "Act as a principal engineer conducting a code review.\n\n" +
      "[#GOAL]\n" +
      "Review the following code for:\n" +
      "1. Readability — naming conventions, code structure, and clarity.\n" +
      "2. Maintainability — modularity, separation of concerns, and extensibility.\n" +
      "3. Best practices — language idioms, design patterns, and error handling.\n" +
      "4. Security — input validation, injection risks, and data exposure.\n\n" +
      "[#RESPONSE GUIDELINES]\n" +
      "- Rate each area (Readability, Maintainability, Best Practices, Security) as Good / Needs Improvement / Critical.\n" +
      "- Provide specific, actionable suggestions with code examples.\n" +
      "- End with a summary verdict.\n\n" +
      "Code to review:\n"
  },
  {
    code: "/debug",
    prompt:
      "Act as a debugging specialist. I have a bug I need help resolving.\n\n" +
      "[#GOAL]\n" +
      "1. Analyze the code and the described problem systematically.\n" +
      "2. Identify the root cause — explain *why* the bug occurs, not just *where*.\n" +
      "3. Provide a corrected version of the code.\n" +
      "4. Suggest how to prevent similar bugs in the future (e.g., tests, assertions, patterns).\n\n" +
      "[#RESPONSE GUIDELINES]\n" +
      "- Structure: Problem Analysis → Root Cause → Fix → Prevention.\n" +
      "- Show the minimal change needed to fix the issue.\n" +
      "- If multiple causes are possible, list them ranked by likelihood.\n\n" +
      "Here is the code and the problem:\n"
  },
  {
    code: "/refactor",
    prompt:
      "Act as a clean-code advocate and senior architect.\n\n" +
      "[#GOAL]\n" +
      "Refactor the following code to improve its quality:\n" +
      "1. Apply DRY — extract repeated logic into reusable functions or modules.\n" +
      "2. Apply SOLID principles where applicable.\n" +
      "3. Improve naming — variables, functions, and classes should be self-documenting.\n" +
      "4. Simplify complex logic — reduce nesting, use early returns, and clarify control flow.\n\n" +
      "[#RESPONSE GUIDELINES]\n" +
      "- Show the refactored code in full.\n" +
      "- For each change, add a brief inline comment explaining the rationale.\n" +
      "- Preserve the original behavior — no functional changes unless a bug is found.\n\n" +
      "Code to refactor:\n"
  },
  {
    code: "/explain",
    prompt:
      "Act as a patient and knowledgeable teacher.\n\n" +
      "[#GOAL]\n" +
      "Explain the following concept or code in a way that is easy to understand:\n" +
      "1. Start with a plain-language summary (ELI5 level).\n" +
      "2. Then go deeper — explain the mechanics, how it works internally, and why it matters.\n" +
      "3. Provide a practical example or analogy to solidify understanding.\n" +
      "4. If it's code, walk through it line by line.\n\n" +
      "[#RESPONSE GUIDELINES]\n" +
      "- Use simple language first, then introduce technical terms with definitions.\n" +
      "- Include at least one concrete example.\n" +
      "- End with a \"Key Takeaways\" section (3-5 bullet points).\n\n" +
      "Explain this:\n"
  },
  {
    code: "/assignment",
    prompt:
      "Act as an experienced academic tutor and problem-solving coach.\n\n" +
      "[#GOAL]\n" +
      "Help me work through this assignment step by step:\n" +
      "1. Break down the assignment into clear requirements and sub-tasks.\n" +
      "2. Identify the key concepts, theories, or techniques needed.\n" +
      "3. Suggest a structured approach or methodology to solve it.\n" +
      "4. Outline the solution structure (sections, steps, or code architecture).\n" +
      "5. Highlight common mistakes to avoid.\n\n" +
      "[#RESPONSE GUIDELINES]\n" +
      "- Structure: Requirements Analysis → Key Concepts → Approach → Solution Outline → Pitfalls.\n" +
      "- Be educational — explain the reasoning, don't just give answers.\n" +
      "- If it's a coding assignment, suggest the data structures and algorithms to use.\n\n" +
      "Here is the assignment:\n"
  },
  {
    code: "/essay",
    prompt:
      "Act as a skilled academic writing coach.\n\n" +
      "[#GOAL]\n" +
      "Help me write or improve an essay or written piece:\n" +
      "1. If given a topic: create an outline with thesis statement, supporting arguments, and conclusion structure.\n" +
      "2. If given a draft: review for clarity, logical flow, argument strength, grammar, and style.\n" +
      "3. Suggest stronger transitions, better word choices, and more compelling evidence.\n" +
      "4. Ensure the writing has a clear thesis, well-structured paragraphs, and a strong conclusion.\n\n" +
      "[#RESPONSE GUIDELINES]\n" +
      "- For outlines: provide a detailed section-by-section breakdown.\n" +
      "- For reviews: use inline suggestions (\"Consider changing X to Y because...\").\n" +
      "- Maintain the author's voice — enhance, don't replace.\n\n" +
      "Here is the topic or draft:\n"
  },
  {
    code: "/summarize",
    prompt:
      "Act as a concise and accurate summarizer.\n\n" +
      "[#GOAL]\n" +
      "Summarize the following text:\n" +
      "1. Capture the main thesis or central argument.\n" +
      "2. List the key points and supporting evidence.\n" +
      "3. Note any conclusions, recommendations, or calls to action.\n" +
      "4. Keep the summary to roughly 20% of the original length.\n\n" +
      "[#RESPONSE GUIDELINES]\n" +
      "- Structure: Main Idea → Key Points (bulleted) → Conclusion.\n" +
      "- Use clear, neutral language.\n" +
      "- Do not add opinions or information not present in the original.\n\n" +
      "Text to summarize:\n"
  },
  {
    code: "/project",
    prompt:
      "Act as a senior software architect and project planner.\n\n" +
      "[#GOAL]\n" +
      "Design a complete project plan for the following idea:\n" +
      "1. Recommend the tech stack (languages, frameworks, databases, tools) with justifications.\n" +
      "2. Define the project file/folder structure.\n" +
      "3. Break the implementation into phases or milestones.\n" +
      "4. Identify key components, their responsibilities, and how they interact.\n" +
      "5. List potential challenges and how to mitigate them.\n\n" +
      "[#RESPONSE GUIDELINES]\n" +
      "- Structure: Tech Stack → Architecture → File Structure → Implementation Plan → Risks.\n" +
      "- Include a simple diagram or description of the system architecture.\n" +
      "- Prioritize simplicity and scalability.\n\n" +
      "Project idea:\n"
  },
  {
    code: "/test",
    prompt:
      "Act as a QA engineer and testing specialist.\n\n" +
      "[#GOAL]\n" +
      "Generate comprehensive unit tests for the following code:\n" +
      "1. Cover all happy-path scenarios (expected inputs and outputs).\n" +
      "2. Cover edge cases (empty inputs, boundary values, null/undefined, large inputs).\n" +
      "3. Cover error/failure scenarios (invalid inputs, exceptions, timeouts).\n" +
      "4. Use descriptive test names that explain what is being tested and why.\n\n" +
      "[#RESPONSE GUIDELINES]\n" +
      "- Use the appropriate testing framework for the language (e.g., Jest, pytest, JUnit).\n" +
      "- Group tests by category: Happy Path, Edge Cases, Error Handling.\n" +
      "- Include setup/teardown if needed.\n" +
      "- Aim for high coverage without redundant tests.\n\n" +
      "Code to test:\n"
  },
  {
    code: "/convert",
    prompt:
      "Act as a polyglot developer fluent in multiple programming languages.\n\n" +
      "[#GOAL]\n" +
      "Convert the following code to the target language/framework:\n" +
      "1. Follow the target language's naming conventions and idioms (e.g., camelCase for JS, snake_case for Python).\n" +
      "2. Use equivalent standard library functions — don't do literal line-by-line translation.\n" +
      "3. Preserve the original logic and behavior exactly.\n" +
      "4. Add brief comments explaining any non-obvious translation choices.\n\n" +
      "[#RESPONSE GUIDELINES]\n" +
      "- Show the full converted code.\n" +
      "- After the code, list key differences between the source and target versions.\n" +
      "- Note any features that don't have a direct equivalent and how you handled them.\n\n" +
      "Source code and target language:\n"
  },
  {
    code: "/security",
    prompt:
      "Act as a cybersecurity expert and application security auditor.\n\n" +
      "[#GOAL]\n" +
      "Perform a security audit on the following code:\n" +
      "1. Check for common vulnerabilities: XSS, SQL Injection, CSRF, insecure deserialization, path traversal, and authentication flaws.\n" +
      "2. Evaluate data handling: input validation, output encoding, secrets management.\n" +
      "3. Assess dependency risks if any imports/packages are visible.\n" +
      "4. Rank each finding by severity: Critical / High / Medium / Low.\n\n" +
      "[#RESPONSE GUIDELINES]\n" +
      "- Structure: Findings Table (Vulnerability, Severity, Location, Description) → Detailed Analysis → Fixed Code.\n" +
      "- Provide the patched version of the code with security fixes applied.\n" +
      "- Include prevention tips for each vulnerability class found.\n\n" +
      "Code to audit:\n"
  }
];

const DEFAULT_RULES = [
  {
    rule:
      "You MUST respond in English, regardless of the language used in the query, unless the user explicitly requests a response in a different language at the beginning of their prompt. Maintain a neutral, international English style.",
    active: true
  },
  {
    rule:
      "Prioritize factual correctness. If a query involves specialized knowledge (e.g., medicine, law, finance), include a disclaimer stating that you are an AI and not a professional, and that the user should consult a qualified expert. If you are unsure of an answer or the information is beyond your knowledge cutoff, state this clearly and avoid speculation. Do not invent information.",
    active: true
  },
  {
    rule:
      "For complex questions, logic puzzles, math problems, or requests involving analysis, briefly show your step-by-step reasoning before providing the final answer.",
    active: true
  },
  {
    rule:
      "Structure responses for clarity. Use headings and subheadings (Markdown format) for longer, informational answers. Use bullet points or numbered lists for steps, features, or multiple items. Use bold text to highlight key terms or the most important takeaway.",
    active: true
  },
  {
    rule:
      "If a user's query is ambiguous, identify the most likely interpretations and address them. If possible, ask a clarifying question before proceeding. Break down complex topics into digestible parts.",
    active: true
  },
  {
    rule:
      "Refuse to generate harmful, unethical, dangerous, or illegal content. Do not generate content that promotes one political ideology over another. Remain neutral and objective. When appropriate, offer to provide more details or explore related topics.",
    active: true
  }
];

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason !== "install") {
    return;
  }
  chrome.storage.local.get(["quickPrompts", "rules"], (result) => {
    const updates = {};

    if (!Array.isArray(result.quickPrompts) || result.quickPrompts.length === 0) {
      updates.quickPrompts = DEFAULT_QUICK_PROMPTS;
    }

    if (!Array.isArray(result.rules) || result.rules.length === 0) {
      updates.rules = DEFAULT_RULES;
    }

    if (Object.keys(updates).length > 0) {
      chrome.storage.local.set(updates);
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "open-pdf-tab") {
    // #region agent log
    fetch('http://127.0.0.1:7695/ingest/22715207-37b8-43b0-a499-599e22a5bda4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fb330c'},body:JSON.stringify({sessionId:'fb330c',location:'background.js:open-pdf-tab',message:'received open-pdf-tab message',data:{htmlLen:message.html?.length},timestamp:Date.now(),hypothesisId:'G-H'})}).catch(()=>{});
    // #endregion

    const blob = new Blob([message.html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    // #region agent log
    fetch('http://127.0.0.1:7695/ingest/22715207-37b8-43b0-a499-599e22a5bda4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fb330c'},body:JSON.stringify({sessionId:'fb330c',location:'background.js:blob-url',message:'blob URL created',data:{url:url},timestamp:Date.now(),hypothesisId:'H'})}).catch(()=>{});
    // #endregion

    chrome.tabs.create({ url: url }, (tab) => {
      // #region agent log
      fetch('http://127.0.0.1:7695/ingest/22715207-37b8-43b0-a499-599e22a5bda4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fb330c'},body:JSON.stringify({sessionId:'fb330c',location:'background.js:tab-created',message:'tab created result',data:{tabId:tab?.id,lastError:chrome.runtime.lastError?.message},timestamp:Date.now(),hypothesisId:'G-H'})}).catch(()=>{});
      // #endregion

      if (chrome.runtime.lastError) {
        return;
      }

      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: function () {
              var btn = document.getElementById("dsPrintBtn");
              if (btn) {
                btn.addEventListener("click", function () { window.print(); });
              }
            }
          }, () => {
            // #region agent log
            fetch('http://127.0.0.1:7695/ingest/22715207-37b8-43b0-a499-599e22a5bda4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fb330c'},body:JSON.stringify({sessionId:'fb330c',location:'background.js:inject-result',message:'executeScript completed',data:{tabId:tabId,lastError:chrome.runtime.lastError?.message},timestamp:Date.now(),hypothesisId:'fix-verify'})}).catch(()=>{});
            // #endregion
          });
        }
      });
    });

    return false;
  }

  if (message.action !== "export-chat") {
    return false;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.id) {
      sendResponse({ error: "No active tab found." });
      return;
    }

    if (!tab.url || !tab.url.includes("chat.deepseek.com")) {
      sendResponse({ error: "Please open a DeepSeek chat first." });
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: "export-chat" }, (response) => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message });
        return;
      }
      sendResponse(response);
    });
  });

  return true;
});
