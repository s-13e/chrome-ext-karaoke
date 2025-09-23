# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension that provides karaoke lyrics overlay for YouTube videos. The extension consists of multiple components:

- **Content Script** (`src/content/`): Injected into YouTube pages to display lyrics overlay
- **Background Script** (`src/background/`): Service worker for API calls and cross-extension messaging
- **Popup** (`src/popup/`): Extension popup interface
- **Options** (`src/options/`): Settings page accessible from browser extensions menu

## Essential Commands

```bash
# Development
npm run dev              # Watch mode development build
npm run build           # Production build
npm run lint            # ESLint check
npm run lint:fix        # ESLint auto-fix
npm run format          # Prettier formatting
npm test                # Run Jest tests with coverage

# Pre-commit checks (as defined in CI)
npm run lint && npm run format && npm test && npm run build
```

## Architecture & Key Patterns

### Extension Architecture

- **Manifest V3** Chrome extension with service worker background script
- **Content Script Injection**: Runs on `https://www.youtube.com/watch*` pages
- **Cross-context Communication**: Background ↔ Content ↔ Popup messaging via Chrome APIs
- **Webpack Multi-entry**: Separate bundles for content, background, popup, options, and audioProcessor

### Core Systems

**Lyrics Pipeline**:

1. Video detection → Artist/title extraction → API queries (LRCLib, MusicBrainz fallback)
2. Language detection → Romanization (Korean, Japanese, Chinese)
3. Lyrics parsing → Sync timing → Display overlay

**Audio Analysis**:

- Real-time audio processing via Web Audio API and AudioWorklet
- Voice Activity Detection (VAD) for karaoke features
- Ad detection to pause lyrics during YouTube ads

**State Management**:

- Chrome storage for persistence
- React Context for UI state
- Cross-component communication via custom event system

### Important File Locations

**Entry Points**:

- `src/content/index.tsx` - Main content script initialization
- `src/background/background.ts` - Service worker for API calls
- `src/popup/index.tsx` - Extension popup
- `src/options/index.tsx` - Settings page

**Core Logic**:

- `src/lib/utils/lyrics/` - Lyrics fetching, parsing, and display logic
- `src/lib/utils/audio/` - Audio analysis and processing
- `src/lib/utils/platform/` - YouTube integration and DOM manipulation
- `src/background/api/` - External API integrations

### Path Aliases

The project uses webpack path aliases:

- `@background` → `src/background`
- `@content` → `src/content`
- `@components` → `src/components`
- `@lib` → `src/lib`
- `@constants` → `src/constants`
- `@hooks` → `src/hooks`
- `@popup` → `src/popup`
- `@styles` → `src/styles`
- `@services` → `src/services`

### Technology Stack

- **React 19** with TypeScript
- **Emotion/Styled** for styling with CSS modules support
- **i18next** for internationalization
- **Webpack 5** with custom multi-entry configuration
- **Web Audio API** + **AudioWorklet** for real-time audio processing
- **Chrome Extension APIs** (storage, messaging, scripting)

### Development Notes

**Chrome Extension Development**:

- Uses Manifest V3 with service worker background script
- Content Security Policy restricts inline scripts
- Extension loads resources via `chrome.runtime.getURL()`

**Audio Processing**:

- AudioWorklet processes audio in separate thread
- VAD (Voice Activity Detection) for microphone input
- MediaElementSource for YouTube video audio analysis

**Platform Integration**:

- SPA navigation detection for YouTube's single-page architecture
- DOM mutation observers for dynamic content
- YouTube player state synchronization

**Internationalization**:

- Supports multiple languages with automatic detection
- Romanization for non-Latin scripts (Korean, Japanese, Chinese)
- Chrome extension i18n format conversion in build process

## API Dependencies

The extension integrates with external services:

- **LRCLib API**: Primary lyrics source
- **MusicBrainz API**: Fallback for song metadata
- **YouTube Data API**: Video metadata (requires `YOUTUBE_API_KEY` in `.env`)

Environment variables should be placed in `.env` file in the project root.

## Special Precautions

### 1. Things to Absolutely Avoid

- Declaring variables with the any type
- Declaring duplicate function or variable names
- Writing incorrect import paths or non-existent function names
- Strictly ensure that function declarations, return types, and parameter types match their actual behavior
- Using environment variables (process.env) that are not explicitly defined in the project without verification
- Creating conditional logic based on undefined environment variables (always verify availability first)

### 2. Recommended Practices

- Use English for all function and variable names, making their roles clear
- Add descriptive comments at the top of new files explaining their purpose
- When using packages:
  - Verify they support the current development language (TypeScript/JavaScript)
  - Confirm wide community adoption and reliability
- Use English for programming terms, but answers and explanations in Korean
- Document external libraries in README.md under ### library section, including name, author, license type, and license link
- Add comments for complex or critical logic parts

### TypeScript Standards

- Enable strong type checking options in tsconfig such as strict: true, noImplicitAny, strictNullChecks
- Declare all types explicitly, prefer unknown and type guards over any
- Explicitly define function parameters and return types
- Use optional chaining (?.), nullish coalescing (??), and type guards to safely handle null and undefined
- Use the non-null assertion operator (!) sparingly and only when absolutely certain
- Refactor long functions/classes to follow Single Responsibility Principle (SRP)
- Favor immutable data structures using readonly and const
- Use enums, utility types (Partial, Pick, Omit, Readonly), and type aliases effectively
- Organize imports and exports, and remove unused code and variables
- Use constants for magic numbers and hardcoded strings, clarifying their meaning
- Maintain documentation and comments for testability, scalability, and collaboration
- Before using any variable (including imported modules, global objects, environment variables), verify its existence in the codebase
- When referencing external variables or APIs, first check if they are properly declared or imported in the current scope

### React Standards

- Define local component props in .tsx files using interfaces named FileNameProps (e.g., for FontStyleMenu.tsx, use FontStyleMenuProps)
- Exported interface/type names should clearly reflect the component’s purpose, e.g., UserListProps
- Explicitly type component props and state; use generics when needed
- Define style, class, and event props consistently, e.g., onClick, style, className
- Prefer functional components (arrow functions)
- Document naming, types, and roles of contexts and custom hooks clearly
- Avoid unnecessary rerenders, prop drilling, and deeply nested children
- Use comments to explain key features, update points, and side effects (e.g., useEffect)
