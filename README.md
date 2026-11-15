# Postmark

A **[Next.js]** project with **[React]** and **[shadcn/ui]** components.

The app is a **smart email inbox** featuring an **AI-powered assistant** that:
- Sorts and classifies incoming emails into logical folders
- Provides actionable summaries and prioritization
- Offers contextual suggestions for quick responses
- Acts as a personal assistant with natural language queries
- Supports multiple user personas (assistant and client views)
- Features a clean, modern UI with responsive design

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or later)
- pnpm (recommended) – `npm i -g pnpm`

### Installation
```bash
cd d:\postmark
pnpm install
```

### Development
```bash
pnpm dev
# Opens http://localhost:3000 (redirects to /onboarding)
```

### Build
```bash
pnpm build
```

## 📁 Project Structure
```
.
├── app/                    # Next.js app router
│   ├── dashboard/          # Main assistant dashboard
│   ├── conversation/[id]/  # Dynamic conversation detail view
│   ├── client/             # Client view inbox
│   ├── onboarding/         # Onboarding flow & demo setup
│   ├── settings/accounts/  # Account settings & rules
│   └── page.tsx            # Root redirect to /onboarding
├── components/             # Reusable components (InboxChatPanel, etc.)
└── public/                 # Static assets
```

## 🛠️ Technologies
- **Framework:** Next.js 16 (App Router)
- **UI Library:** shadcn/ui with Tailwind CSS v4
- **Icons:** Lucide React
- **Analytics:** Vercel Analytics

## 📄 License
This project is open-source.
