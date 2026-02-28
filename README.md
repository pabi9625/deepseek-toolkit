# DeepSeek Toolkit

**Take full control of your DeepSeek Chat experience.**

DeepSeek Toolkit is a lightweight Chrome extension that supercharges [chat.deepseek.com](https://chat.deepseek.com) with language enforcement, custom rules, reusable quick prompts, and one-click chat export — all without sending a single byte to external servers. Everything stays local, private, and fast.

---

## Why DeepSeek Toolkit?

If you use DeepSeek Chat regularly, you've probably run into these frustrations:

- The AI responds in the wrong language, and you keep copy-pasting the same "reply in English" instruction.
- You repeat the same detailed prompts over and over for code reviews, debugging, or essay writing.
- You want consistent behavior — like step-by-step reasoning or structured formatting — but have to remind the model every single time.
- There's no built-in way to save a conversation as a clean, readable file.

DeepSeek Toolkit solves all of that with zero friction. Set it once, and it works silently in the background every time you chat.

---

## Features

### Language Enforcement

Choose from **43 languages** and the extension will automatically instruct DeepSeek to respond in your preferred language — every single time. Toggle it on or off whenever you want.

### Custom Rules

Define your own rules that get prepended to every message. Want the model to always prioritize factual accuracy? Prefer step-by-step reasoning? Need structured output? Add those as rules, toggle them individually, and never think about it again. A solid set of defaults is included out of the box.

### Quick Prompts

Type a short code like `/review` or `/debug` and it instantly expands into a full, detailed prompt. Twelve battle-tested prompts come pre-loaded:

| Code | What It Does |
|------|-------------|
| `/analyze` | Deep code analysis |
| `/review` | Thorough code review |
| `/debug` | Step-by-step debugging |
| `/refactor` | Refactoring suggestions |
| `/explain` | Educational breakdown |
| `/assignment` | Academic assignment help |
| `/essay` | Essay writing assistance |
| `/summarize` | Text summarization |
| `/project` | Project planning |
| `/test` | Test case generation |
| `/convert` | Code conversion between languages |
| `/security` | Security audit |

You can also create, edit, and delete your own custom prompts.

### Chat Export

Export any DeepSeek conversation to a clean **Markdown file** with one click. Great for documentation, study notes, or archiving important conversations.

### Dark & Light Theme

The options panel supports both dark and light themes so it feels right at home regardless of your preference.

---

## Privacy First

DeepSeek Toolkit makes **zero external network requests**. All your settings, rules, and prompts are stored locally in your browser using Chrome's built-in storage. Nothing leaves your machine.

---

## Installation

### From Source (Developer Mode)

1. **Download or clone** this repository to your computer.

2. Open **Google Chrome** and navigate to:
   ```
   chrome://extensions
   ```

3. Enable **Developer mode** using the toggle in the top-right corner.

4. Click **"Load unpacked"** and select the extension folder (the one containing `manifest.json`).

5. The DeepSeek Toolkit icon will appear in your browser toolbar. You're ready to go.

> **Tip:** Pin the extension to your toolbar for quick access — click the puzzle piece icon next to the address bar and pin DeepSeek Toolkit.

---

## How to Use

### Getting Started

1. Click the **DeepSeek Toolkit icon** in your toolbar to open the popup.
2. Select your preferred **language** from the dropdown and toggle enforcement on.
3. Click **"Open Manager"** to access the full options page where you can manage rules, quick prompts, and language settings in detail.

### Using Language Enforcement

- Pick a language from the popup dropdown (43 options available).
- Flip the toggle to **ON**.
- Every message you send on DeepSeek Chat will now automatically include a language instruction. No manual effort needed.

### Setting Up Rules

1. Open the **Manager** and navigate to the **Rules** section.
2. Add any rule you'd like the model to follow (e.g., "Always provide sources for factual claims").
3. Toggle individual rules on or off as needed.
4. Enable **Rules Enforcement** to activate them.
5. Active rules are automatically prepended to your messages in a clean, numbered format.

### Using Quick Prompts

1. While chatting on DeepSeek, type a prompt code followed by a space — for example, `/review ` (note the space after).
2. The code instantly expands into the full prompt text.
3. Add your own prompts through the **Quick Prompt** section in the Manager. Each prompt needs a code (starting with `/`) and the expansion text.

### Exporting a Chat

1. Open the conversation you want to save on [chat.deepseek.com](https://chat.deepseek.com).
2. Click the DeepSeek Toolkit icon and hit **"Export Chat"**.
3. Optionally edit the filename.
4. Click **Download** to save the conversation as a Markdown file.

---

## Requirements

- Google Chrome (or any Chromium-based browser like Edge, Brave, or Arc)
- Access to [chat.deepseek.com](https://chat.deepseek.com)

---

## Built With

- Chrome Extension Manifest V3
- Vanilla JavaScript — no frameworks, no build step, no bloat
- Chrome Storage API for local data persistence

---

## License

This project is provided as-is for personal use. Feel free to modify it to suit your workflow.
