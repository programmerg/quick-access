# <img alt="icon" src="images/icon-24.png"> Quick Access

A clean, intuitive browser extension that gives you one-click access to all your bookmarks, reading lists, browsing history, and tab groups on the new tab page.

<br>
<table border="0">
<tr>
  <td><a href="docs/screenshots/1_welcome.jpg"><img alt="screenshot 1" src="docs/screenshots/1_welcome.jpg"></a></td>
  <td><a href="docs/screenshots/2_bookmarks.jpg"><img alt="screenshot 2" src="docs/screenshots/2_bookmarks.jpg"></a></td>
  <td><a href="docs/screenshots/3_settings_1.jpg"><img alt="screenshot 3" src="docs/screenshots/3_settings_1.jpg"></a></td>
  <td><a href="docs/screenshots/4_settings_2.jpg"><img alt="screenshot 4" src="docs/screenshots/4_settings_2.jpg"></a></td>
  <td><a href="docs/screenshots/5_reading_lists.jpg"><img alt="screenshot 5" src="docs/screenshots/5_reading_lists.jpg"></a></td>
</tr>
</table>

## Features

- Clean tiled Speed Dial-like interface
- Side panel for quick access
- Easy switch between history, bookmarks, reading list, and tab groups 
- Quick search across all items
- Create, modify or delete everything in one place
- Drag and drop support (rearrange, organize, pin to desktop as shortcut)
- Automatic dark/light mode detection
- Custom wallpaper and wallpaper provider URL support
- Built-in favicon and custom favicon provider support
- Customizable grid layout and color themes
- Lightning fast navigation with <kbd>TAB</kbd>, <kbd>↑</kbd>, <kbd>↓</kbd>, <kbd>←</kbd> and <kbd>→</kbd> arrow keys.
- Fully localized interface (available in 36 languages)
- Fine-tuneable permissions. Only grant as many permissions as you need.
- It just works. All your settings are with you in your Chrome account.
- Works in all chromium based browsers that support V3 manifest (Chrome, Edge, Brave, Opera, Vivaldi, ...)

Thanks for trying it! ;)

This is a hobby project for myself, but let's see if it can conquer the world!

## Installation

Get it from the [Chrome Webstore](https://chromewebstore.google.com/detail/quick-access/pomnndfpgmpdpcjinlcihleaehhblchc)

-- OR -- 

1. Download the <a href="https://github.com/programmerg/quick-access/archive/refs/tags/v1.4.1.zip">latest release</a>.
2. Open your browser and go to `chrome://extensions`.
3. Enable "Developer mode".
4. Click "Load unpacked" and select the project folder.
5. Hooray, you now have your own Quick Access version!

## File Structure

- `_locales/` – Translations
- `images/` – Icons, favicons
- `src/` – Modules like: Bookmark, History, Page, Permission, Settings, Tab, TopSite
- `index.html` – Main HTML page, includes UI and SVG icons
- `index.js` – UI logic: event handling, tiles, search, settings, etc.
- `index.css` – Default styles
- `manifest.json` – Chrome extension manifest
- `service-worker.js` – Service worker, install logic

## Contributing

Bug reports, improvement ideas, and pull requests are welcome!

## License

MIT
