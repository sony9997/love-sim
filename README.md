# Love Sim

A dating simulation game (visual novel style) built with Next.js 16, featuring AI-powered dynamic character dialogue powered by Google Gemini.

## Features

- **AI-Powered Dialogue**: Characters respond dynamically using Google Gemini 2.5 Flash, with context-aware conversations based on memories, mood, and relationship status
- **Agent System**: Each character has personality traits, goals, memory, and mood that evolve through interactions
- **Relationship Progression**: Build relationships with 4 unique heroines, from stranger to lover
- **Character Scheduling**: Characters follow daily routines and appear at different locations based on time
- **Bilingual Support**: Full English and Chinese language support

## Characters

| Character | Personality | Location |
|-----------|-------------|----------|
| Su Qingqian (苏清浅) | Cold, Rational, Formal | Library / Student Council |
| Chen Siyao (陈思瑶) | Hot, Emotional, Casual | Campus / City |
| Ling Ruoyu (凌若雨) | Shy, Rational, Emotional | Physics Lab |
| Lu Jiaxin (陆佳欣) | Hot, Outgoing, Casual | Bar / Biker Club |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Configuration

Create a `.env.local` file:

```
NEXT_PUBLIC_GEMINI_API_KEY=your_google_gemini_api_key
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play the game.

### Testing

```bash
# Run unit tests
npx vitest run

# Run E2E tests
npm run test:e2e
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2.0
- **State Management**: Zustand 5.0.8
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion 12
- **Testing**: Vitest + Playwright
- **AI**: Google Gemini 2.5 Flash

## Project Structure

```
src/
├── app/                 # Next.js App Router
├── components/game/     # Game UI components
│   ├── GameEngine.tsx   # Main state machine
│   ├── MainMenu.tsx     # Start screen
│   ├── DialogueSystem.tsx # Dialogue and script execution
│   └── AgentVisualization.tsx # Debug dashboard
└── lib/
    ├── game-data/       # Game data and types
    ├── agent/           # Agent system (mood, memory, relationships)
    ├── store.ts         # Zustand state
    └── ai-service.ts    # Gemini API integration
```

## License

MIT
