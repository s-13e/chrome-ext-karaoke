# Music Karaoke for YouTube

Display real-time synced lyrics on YouTube music videos.

## Features

- **Real-time lyrics sync** - Lyrics automatically sync with video playback
- **Multiple display modes** - Dual line, single line, and full lyrics view
- **Romanization support** - Korean, Japanese, Chinese, Thai, Arabic, Hindi transliteration
- **Customizable styling** - Font, color, size, and text effects
- **Pronunciation guide** - Show reading/pronunciation alongside original lyrics

## Installation

### Chrome Web Store

여기 링크

### Manual Installation (Development)

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the extension
4. Open Chrome and go to `chrome://extensions/`
5. Enable "Developer mode"
6. Click "Load unpacked" and select the `dist` folder

## Screenshots

<!-- Add screenshots here -->

## Romanization Support
Korean, Japanese, Chinese, Thai, Arabic, Hindi

## Development

```bash
# Install dependencies
npm install

# Development build (watch mode)
npm run dev

# Production build
npm run build

# Lint
npm run lint

# Format
npm run format

# Run tests
npm test
```

### Utility Scripts

```bash
# Bump version (syncs package.json and manifest.json)
# When: Before each release
node scripts/bump-version.js patch   # 1.0.0 -> 1.0.1
node scripts/bump-version.js minor   # 1.0.0 -> 1.1.0
node scripts/bump-version.js major   # 1.0.0 -> 2.0.0

# Package extension for Chrome Web Store
# When: After production build, before store submission
node scripts/package-extension.js    # Creates youtube-karaoke-v{version}.zip

# Validate i18n translation files
# When: After adding/modifying translation keys
node scripts/validate-i18n.js        # Checks for missing/unused translation keys

# Generate license information
# When: After adding/removing npm dependencies
node scripts/generate-licenses.js    # Updates src/constants/generatedLicenses.ts
```

## License

Third-party licenses and credits are available in the extension settings under the License tab.
