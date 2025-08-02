# <img alt="icon" src="images/icon-24.png"> Quick Access

A clean, intuitive new tab page where you can access your Favorites, Reading List, and Tab Groups with just one click.

## Screenshots

<table style="width:100%">
<tr>
  <td><a href="docs/chrome-web-store/1_welcome.jpg"><img alt="screenshot 1" src="docs/chrome-web-store/1_welcome.jpg"></a></td>
  <td><a href="docs/chrome-web-store/2_bookmarks.jpg"><img alt="screenshot 2" src="docs/chrome-web-store/2_bookmarks.jpg"></a></td>
  <td><a href="docs/chrome-web-store/3_settings_1.jpg"><img alt="screenshot 3" src="docs/chrome-web-store/3_settings_1.jpg"></a></td>
  <td><a href="docs/chrome-web-store/4_settings_2.jpg"><img alt="screenshot 4" src="docs/chrome-web-store/4_settings_2.jpg"></a></td>
  <td><a href="docs/chrome-web-store/5_reading_lists.jpg"><img alt="screenshot 5" src="docs/chrome-web-store/5_reading_lists.jpg"></a></td>
</tr>
</table>

## Features

- Clean tiled interface on the new tab page
- Side panel for quick access
- Easy switch between history, bookmarks, reading list, and tab groups 
- Quick search across all items
- Create, modify or delete everything in one place
- Drag and drop support (rearrange, organize, pin to desktop as shortcut)
- Automatic dark/light mode detection
- Custom background image, color and background provider URL support
- Built-in favicon and custom favicon provider support
- Customizable grid layout and color themes
- Lightning fast navigation with <kbd>TAB</kbd>, <kbd>↑</kbd>, <kbd>↓</kbd>, <kbd>←</kbd> and <kbd>→</kbd> keys.
- Fully localized interface (available in 36 languages)
- Fine-tuneable permissions. Only request permissions for what you need.
- It just works. All your settings are with you in your Chrome account.
- Works in all browsers that support V3 manifest

## Installation

1. Download the <a href="https://github.com/programmerg/quick-access/archive/refs/tags/v1.4.1.zip">latest release</a> or clone the repository.
2. Open Chrome and go to `chrome://extensions`.
3. Enable "Developer mode".
4. Click "Load unpacked" and select the project folder.
5. Quick Access will be available on the new tab page.

## File Structure

- `_locales/` – Translations
- `images/` – Default icons, favicons
- `src/` – Logic modules (Bookmark, History, Page, Permission, Settings, Tab, TopSite)
- `index.html` – Main HTML page, includes UI and SVG icons
- `index.js` – UI logic: event handling, tiles, search, settings, etc.
- `index.css` – Default styles
- `manifest.json` – Chrome extension manifest
- `service-worker.js` – Service worker, install logic

## Contributing

Bug reports, ideas, and pull requests are welcome!

## License

MIT
