# Privacy Policy for Music Karaoke for YouTube

**Last Updated:** January 2026

## Overview

Music Karaoke for YouTube ("the Extension") is a browser extension that displays synchronized lyrics on YouTube music videos. This privacy policy explains how we handle user data.

## Data Collection

### What We Collect

| Data Type | Purpose | Storage Location |
|-----------|---------|------------------|
| User preferences | Save your lyrics style settings (font, color, size) | Chrome local storage (your device only) |
| YouTube video IDs | Search for matching lyrics | Not stored permanently |

### What We Do NOT Collect

- Personal identification information
- YouTube account information
- Browsing history or watch history
- Cookies or tracking data
- Any data for advertising purposes

## Third-Party Services

### LRCLib API
- We use [LRCLib](https://lrclib.net) to fetch synchronized lyrics
- Only video metadata (artist name, song title, duration) is sent to search for lyrics
- LRCLib is a community-driven lyrics database

### YouTube Data API
- We use YouTube Data API to retrieve video metadata (title, category, duration)
- This is used solely to determine if a video is a music video and to extract song information
- We comply with [YouTube API Services Terms of Service](https://developers.google.com/youtube/terms/api-services-tos)

## Data Storage

- All user settings are stored locally in Chrome's storage API
- No data is transmitted to our servers
- No analytics or tracking services are used

## Permissions Explained

| Permission | Why We Need It |
|------------|----------------|
| `storage` | Save your preferences locally |
| `activeTab` | Access the current YouTube tab to display lyrics |
| `tabs` | Detect when you navigate to a new video |
| `webNavigation` | Handle YouTube's single-page navigation |
| `scripting` | Inject the lyrics overlay into YouTube pages |

## Data Sharing

We do not sell, trade, or share any user data with third parties.

## Children's Privacy

This extension does not knowingly collect any information from children under 13.

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be reflected in the "Last Updated" date.

## Contact

For questions about this privacy policy or copyright concerns, please contact:
- GitHub Issues: [https://github.com/s-13e/chrome-ext-karaoke/issues](https://github.com/s-13e/chrome-ext-karaoke/issues)

## Copyright Notice

Lyrics displayed by this extension are provided by the LRCLib community database. If you believe any content infringes your copyright, please contact us and we will promptly address the issue.
