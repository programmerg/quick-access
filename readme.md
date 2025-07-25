# Quick Access

A clean, intuitive new tab page where you can access your Favorites, Reading List, and Tab Groups with just one click.

## Features

- Clean tiled interface on the new tab page
- Side panel for quick access
- Easy switch between bookmarks, reading list, and tab groups 
- Quick search across all items
- Create, modify or delete everything in one place
- Automatic dark/light mode detection
- Custom background image, color and background provider URL support
- Built-in favicon and custom favicon provider support
- Customizable grid layout and color themes (multiple built-in themes)
- Ditch the mouse! Lightning fast navigation with <kbd>TAB</kbd>, <kbd>↑</kbd>, <kbd>↓</kbd>, <kbd>←</kbd> and <kbd>→</kbd> keys.
- Fully localized interface (English, Hungarian, ...)
- Fine-tuneable permissions. Only request permissions for what you need.
- It just works. All your settings are with you in your Chrome account.
- Works in all browsers that support V3 manifest

## Installation

1. Download or clone the repository.
2. Open Chrome and go to `chrome://extensions`.
3. Enable "Developer mode".
4. Click "Load unpacked" and select the project folder.
5. Quick Access will be available on the new tab page.

## File Structure

- `_locales/` – Translations (e.g., English, Hungarian)
- `images/` – Default icons, favicons
- `src/` – Logic modules (Bookmark, History, Page, Permission, Settings, Tab, TopSite)
- `themes/` – Dozens of ready-made themes (colors, icons, backgrounds)
- `index.html` – Main HTML page, includes UI and SVG icons
- `index.js` – Complete UI logic: event handling, tiles, search, settings, etc.
- `index.css` – Default styles
- `manifest.json` – Chrome extension manifest
- `service-worker.js` – Service worker, install logic

## Contributing

Bug reports, ideas, and pull requests are welcome!

## License

MIT
