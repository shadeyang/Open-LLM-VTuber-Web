# Open LLM VTuber

An Electron desktop application with React and TypeScript that provides an AI VTuber experience with Live2D character integration.

## Project Overview

- **Type**: Desktop Application (Electron + React)
- **Core Features**: Real-time AI voice interaction, Live2D character animation, WebSocket-based backend communication, Voice Activity Detection (VAD), multi-language support
- **Tech Stack**: Electron 31, React 18, TypeScript 5.5, Chakra UI v3, Vite, electron-vite

## Development Commands

```bash
# Install dependencies
npm install

# Run development
npm run dev          # Electron app in dev mode
npm run dev:web      # Web-only version (no Electron)

# Build
npm run build:win     # Windows
npm run build:mac     # macOS
npm run build:linux   # Linux
npm run build:web     # Web version

# Code quality
npm run lint          # ESLint
npm run lint:fix      # ESLint with auto-fix
npm run typecheck     # TypeScript (node + web)
npm run format        # Prettier format

# i18n
npm run extract-translations  # Extract i18n strings
```

## Architecture

### Main Process (`src/main/`)
- **index.ts**: Entry point, IPC handlers, app lifecycle
- **window-manager.ts**: Window state, modes (window/pet), mouse events
- **menu-manager.ts**: System tray, context menus

### Preload (`src/preload/`)
- Secure IPC bridge between main and renderer

### Renderer (`src/renderer/src/`)
- **App.tsx**: Root component with providers
- **components/**: UI components (Chat, Settings, Sidebar, etc.)
- **context/**: React Context providers (AiState, ChatHistory, WebSocket, VAD, Live2D, etc.)
- **services/**: WebSocket handler, audio playback
- **hooks/**: Custom React hooks
- **locales/**: i18n translation files
- **utils/**: Utility functions

### Live2D Integration (`src/renderer/WebSDK/`, `src/renderer/MotionSync/`)
- Cubism SDK for character rendering
- Motion sync for lip sync and animations

## State Management

Uses React Context with specialized providers:
- `AiStateContext`: AI conversation state (idle/thinking/speaking/listening)
- `ChatHistoryContext`: Conversation messages
- `Live2DConfigContext`: Model configuration and loading
- `VADContext`: Voice Activity Detection
- `WebSocketContext`: Backend connection
- `SubtitleContext`: Subtitle display
- `GroupContext`: Multi-user sessions

## WebSocket Communication

The app connects to a backend server for AI functionality:
- Audio data (base64 with volume arrays for lip sync)
- Control messages
- Model updates
- Chat history

## ESLint Configuration

The project uses Airbnb-style rules with relaxed settings (many checks disabled in `.eslintrc.js`).

## Key Dependencies

- **UI**: Chakra UI v3, Framer Motion, React Icons
- **State**: Zustand
- **Audio**: ONNX Runtime Web, VAD (Voice Activity Detection)
- **Live2D**: Cubism SDK
- **i18n**: i18next, react-i18next
- **Reactive**: RxJS
