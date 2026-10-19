# 🌤️ Sunrain

> Where the sun meets the rain

An open-source, free, and privacy-focused mental health self-help platform.

## ✨ Features

- **Self-Assessment** - PHQ-9 (depression screening) / GAD-7 (anxiety screening)
- **Breathing Exercise** - Customizable guided breathing
- **Crisis Hotlines** - Resources from 30+ countries/regions worldwide

## 🌍 Languages

English | 简体中文 | 繁體中文 | Español | 日本語 | 한국어 | हिन्दी | العربية

## 🔒 Privacy First

- Assessment answers and scores stay on your device
- No account or advertising trackers
- Hosting and CDN providers may process basic traffic and performance data

## 🚀 Getting Started

```bash
# Install dependencies
pnpm install

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
├── content/           # Content data (questionnaires/crisis hotlines)
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
- [Mental health check-in specification](./docs/MENTAL_HEALTH_CHECK_IN.md) — planned user flow, result boundaries, privacy, and disclaimer drafts
- [Clinical evidence and verification status](./docs/CLINICAL_EVIDENCE.md)
- [Self-help and help-seeking content delivery](./docs/SUPPORT_CONTENT.md) — full route mapping and eight-language content drafts
- [Current roadmap](./docs/ROADMAP.md)

The check-in documents describe planned work; they do not indicate that the flow has shipped or received professional clinical review.

## 🤝 Contributing

Issues and Pull Requests are welcome!

## ⚠️ Disclaimer

All assessment tools and information provided on this platform are for reference and self-understanding only. They cannot replace professional mental health diagnosis and treatment.

If you are experiencing a mental health crisis, please contact your local crisis hotline or seek professional help immediately.

## 📜 License

[MIT](./LICENSE)

