# 🌤️ Sunrain

> Where the sun meets the rain

An open-source, free, and privacy-focused mental health self-help platform.

## ✨ Features

- **Check-in** — privately organise several concerns and choose practical support, without a diagnosis or combined health score.
- **Self-help** — four complete activities: grounding, one manageable step, a sleep routine and organising a worry; plus guided breathing and soundscapes.
- **Find support** — six-step guidance, editable contact text, appointment preparation and official service entry points for England and the US; local-care guidance for other regions.
- **Privacy controls** — explicit save, load, export and deletion, with no automatic saving or upload of responses.
- **Crisis support** — maintained external country directory, with a direct emergency-services instruction.

All of these paths and the full scope/privacy statement have eight-language content. This is general education, not a validated treatment programme. Independent clinical and native-language review remains pending. PHQ-9 and GAD-7 public scoring is closed while exact versions, translations, rights and professional review are verified; existing bookmarks lead to sources and working support options.

## 🌍 Languages

English | 简体中文 | 繁體中文 | Español | 日本語 | 한국어 | हिन्दी | العربية

## 🔒 Privacy First

- Check-in responses and notes stay in page memory unless you explicitly save or download them
- No account or advertising trackers
- Health reflection pages exclude third-party analytics and remote fonts
- Hosting/CDN providers can process IP addresses, browser details and requests; some general pages retain Cloudflare page analytics

## 🚀 Getting Started

Use Node 24 (minimum 22.22) and the pnpm version declared in `package.json`.

```bash
# Install dependencies
corepack pnpm install --frozen-lockfile

# Development
pnpm dev

# Build
pnpm build

# Preview build
pnpm preview
```

## 📁 Project Structure

```
src/
├── content/           # Unpublished candidate instruments and historical resource data
├── data/              # Runtime support copy and screening review registry
├── i18n/              # UI translation files
├── lib/               # Core utilities
├── layouts/           # Page layouts
├── components/        # Components
├── pages/             # Pages
└── styles/            # Styles
```

## 📦 Tech Stack

- [Astro](https://astro.build/) - Static site generation
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [React](https://react.dev/) - UI components
- [Lucide](https://lucide.dev/) - Icons

## 📄 Documentation

- [Requirements](./docs/REQUIREMENTS.md)
- [Design](./docs/DESIGN.md)
- [Mental health check-in specification](./docs/MENTAL_HEALTH_CHECK_IN.md) — target screening design and current non-diagnostic implementation boundary
- [Clinical evidence and verification status](./docs/CLINICAL_EVIDENCE.md)
- [Self-help and help-seeking content delivery](./docs/SUPPORT_CONTENT.md) — content references and the original design
- [Current roadmap](./docs/ROADMAP.md)

- [Release and clinical-review gates](./docs/RELEASING.md)

The runtime copy is `src/data/support-copy.json`. The earlier content pack under `docs/content/` is a design draft. Code in this branch implements the general-support paths; a merge or deployed production release and clinical approval must be verified separately.

## 🤝 Contributing

Issues and Pull Requests are welcome!

## ⚠️ Disclaimer

All assessment tools and information provided on this platform are for reference and self-understanding only. They cannot replace professional mental health diagnosis and treatment.

If you are experiencing a mental health crisis, please contact your local crisis hotline or seek professional help immediately.

## 📜 License

[MIT](./LICENSE) for original project code. Third-party materials retain their own rights and attribution requirements; an unverified instrument or translation is not licensed for publication merely by being in this repository.

