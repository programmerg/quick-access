
import { Bookmark } from "./src/Bookmark.js";
import { Page } from "./src/Page.js";
import { Tab } from "./src/Tab.js";
import { Settings } from "./src/Settings.js";
import { Permissions } from "./src/Permissions.js";

export class UI {

    constructor(settings = {}) {
        this.settings = settings;
        this.currentView = '';
        this.currentPath = [];
        this.lastItems = [];
        this.activeElement = null;
        this.init();
    }

    // MARK: Initialization
    async init() {
        this.applySettings(await Settings.all());
        this.switchView(this.settings.defaultView);
        
        this.registerSearchEventListeners();
        this.registerSettingsFormEventListeners();
        this.registerKeyboardNavigationEventListeners();
        this.registerTileEventListeners();
        this.registerEventListeners();
        this.initTabs();
        
        // Color theme
        const colorTheme = window.matchMedia('(prefers-color-scheme: dark)');
        colorTheme.addEventListener('change', (e) => this.updateTheme(colorTheme.matches));
        this.updateTheme(colorTheme.matches);

        // Internationalization
        document.documentElement.lang = chrome.i18n.getUILanguage();
        this.updateTranslation();

        // TODO: permission handling
        // if (!Permissions.hasAccessTo(['bookmarks'])) {}
        // if (!Permissions.hasAccessTo(['tabGroups'])) {}
        // if (!Permissions.hasAccessTo(['readingList'])) {}
        // chrome.permissions.onAdded
        // chrome.permissions.onRemoved
    }

    // MARK: Translation
    updateTranslation() {
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            el.title = chrome.i18n.getMessage(el.getAttribute('data-i18n-title'));
        });

        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = chrome.i18n.getMessage(el.getAttribute('data-i18n'));
        });
    }

    // MARK: Color theme
    updateTheme(dark = false) {
        let icon = document.querySelector("link[rel~='icon']");

        if (!icon) {
            icon = document.createElement('link');
            icon.rel = "icon";
            icon.type = "image/svg+xml";
            document.head.appendChild(icon);
        }

        icon.href = this.getBrowserIcon() + (dark ? '?dark' : '?light');
        document.body.classList.toggle('dark', dark);
        document.body.classList.toggle('light', !dark);
    }

    getBrowserIcon() {
        if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1) {
            return 'images/opera.svg';
        } else if (navigator.userAgent.indexOf("Edg") != -1) {
            return 'images/edge.svg';
        } else if (navigator.userAgent.indexOf("Chrome") != -1) {
            return 'images/chrome.svg';
        } else if (navigator.userAgent.indexOf("Safari") != -1) {
            return 'images/safari.svg';
        } else if (navigator.userAgent.indexOf("Firefox") != -1) {
            return 'images/firefox.svg';
        }
        return 'images/browser.svg';
    }

    // MARK: Apply settings
    applySettings(settings) {
        this.settings = {
            ...Settings.defaults,
            ...this.settings,
            ...settings
        };

        const body = document.body;
        body.style.backgroundImage = '';
        body.classList.remove('has-background');
        
        switch (this.settings.backgroundType) {
            case 'none':
                break;
            case 'url':
                if (this.settings.backgroundUrl) {
                    body.style.backgroundImage = `url('${this.settings.backgroundUrl}')`;
                    body.classList.add('has-background');
                }
                break;
            case 'file':
                if (this.settings.backgroundFile) {
                    body.style.backgroundImage = `url('${this.settings.backgroundFile}')`;
                    body.classList.add('has-background');
                }
                break;
        }
        
        const content = document.getElementById('content');
        content.className = `grid cols-${this.settings.gridCols}`;
    }

    // MARK: Event listeners
    registerEventListeners() {
        
        document.body.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        
        document.getElementById('settingsBtn').addEventListener('click', (e) => {
            this.openSettings();
        });

        Array.from(document.getElementsByClassName('toggle-btn')).forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = btn.getAttribute('data-toggle');
                this.switchView(view);
            });
        });

        Array.from(document.getElementsByClassName('modal')).forEach(modal => {

            // Close modal on button click
            Array.from(modal.querySelectorAll('button[type="reset"]')).forEach(btn => {
                btn.addEventListener('click', (e) => {
                    modal.close();
                    e.preventDefault();
                });
            });

            // Close modal on click outside
            modal.addEventListener('click', (e) => {
                if (e.target.id === modal.id) {
                    modal.close();
                }
            });
        });

        // Handle form submission
        Array.from(document.getElementsByTagName('form')).forEach(form => {
            form.addEventListener('submit', (e) => {
                const action = this[form.dataset.action];
                if (typeof action === 'function') action.call(this, form);
                e.preventDefault();
            });
        });
    }

    // MARK: View
    switchView(view) {
        if (!['bookmarks', 'readingList', 'tabGroups'].includes(view)) return;

        if (this.currentView != view) {
            this.currentView = view;
            document.querySelectorAll('.toggle-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-toggle') === view);
            });

            this.settings.defaultView = view;
            Settings.save({ defaultView: view });
        }
        this.navigateToPath([]);
    }

    // MARK: Navigate
    navigateToPath(path) {
        this.currentPath = path;
        this.updateBreadcrumb();
        this.loadContent();
    }

    // MARK: Breadcrumbs
    updateBreadcrumb() {
        const breadcrumb = document.getElementById('breadcrumb');
        breadcrumb.innerHTML = '';

        const homeItem = document.createElement('span');
        homeItem.className = 'breadcrumb-item';
        switch (this.currentView) {
            case 'bookmarks':   homeItem.textContent = chrome.i18n.getMessage('bookmarks'); break;
            case 'readingList': homeItem.textContent = chrome.i18n.getMessage('reading_list'); break;
            case 'tabGroups':   homeItem.textContent = chrome.i18n.getMessage('tab_groups'); break;
        }
        homeItem.setAttribute('data-path', '');
        homeItem.addEventListener('click', (e) => {
            this.navigateToPath([]);
        });
        breadcrumb.appendChild(homeItem);

        for (let i = 0; i < this.currentPath.length; i++) {
            const separator = document.createElement('span');
            separator.className = 'breadcrumb-separator';
            separator.textContent = '▸';
            breadcrumb.appendChild(separator);

            const item = document.createElement('span');
            item.className = 'breadcrumb-item';
            item.textContent = this.currentPath[i].title;
            item.setAttribute('data-path', JSON.stringify(this.currentPath.slice(0, i + 1)));
            item.addEventListener('click', (e) => {
                this.navigateToPath(this.currentPath.slice(0, i + 1));
            });
            breadcrumb.appendChild(item);
        }
    }

    // MARK: Content
    async loadContent() {
        const loading = document.getElementById('loading');
        const message = document.getElementById('message');
        const content = document.getElementById('content');

        let parentId = this.settings['defaultPath_' + this.currentView] || '';
        if (this.currentPath.length > 0) {
            parentId = this.currentPath[this.currentPath.length - 1].id;
        }

        content.dataset.parentId = parentId;

        let items = [];
        try {
            loading.classList.toggle('hidden', false);

            // if (!Permissions.hasAccessTo([view])) throw new Error('Missing permission');

            switch (this.currentView) {
                case 'bookmarks':
                    items = await Bookmark.find(parentId);
                    break;
                case 'readingList':
                    items = await Page.find(parentId);
                    break;
                case 'tabGroups':
                    items = await Tab.find(parentId);
                    break;
            }
            this.renderItems(items);
            
            const addBtn = this.createAddTile(parentId);
            if (addBtn) content.appendChild(addBtn);

        } catch (error) {
            console.error(error);
            
            message.classList.toggle('hidden', false);
            message.innerHTML = `
                <h3>${chrome.i18n.getMessage('error_loading_data')}</h3>
                <p>${chrome.i18n.getMessage('error_loading_data_details')}</p>`;

            //content.classList.toggle('hidden', true);

        } finally {
            loading.classList.toggle('hidden', true);
        }
    }

    // MARK: Items (Tiles)
    renderItems(items) {
        const message = document.getElementById('message');
        const content = document.getElementById('content');
        content.innerHTML = '';
        
        if (items.length > 0) {
            message.classList.toggle('hidden', true);

            items.forEach(item => content.appendChild(this.createTile(item)));

        } else {
            message.classList.toggle('hidden', false);
            message.innerHTML = `
                <h3>${chrome.i18n.getMessage('empty_state')}</h3>
                <p>${chrome.i18n.getMessage('empty_state_details')}</p>`;
        }

        this.lastItems = items;
    }

    createTile(item) {
        return (!item.url) // is group?
            ? this.createGroupTile(item)
            : this.createSimpleTile(item);
    }

    handleTileEvent(view, id, eventType, item) {
        if (this.currentView !== view) return;

        const isCurrentFolder = this.currentPath[this.currentPath.length - 1]?.id === id;
        if (isCurrentFolder) {
            switch (eventType) {
                case 'updated':
                    this.currentPath[this.currentPath.length - 1].title = item.title;
                    this.navigateToPath(this.currentPath);
                    break;

                case 'removed':
                    this.navigateToPath(this.currentPath.slice(0, -1));
                    break;
            }
            return;
        }

        const content = document.getElementById('content');
        const oldTile = content.querySelector(`.tile[data-id="${id}"]`);
        const newTile = item ? this.createTile(item) : null;

        const isContentOfCurrentFolder = content.dataset.parentId === item?.parentId;
        if (isContentOfCurrentFolder) {
            switch (eventType) {
                case 'created':
                    content.appendChild(newTile);
                    break;
    
                case 'updated':
                    if (oldTile) { // updated inplace
                        oldTile.innerHTML = newTile.innerHTML;
                    } else { // probably moved here from another folder, so we need to create the tile here
                        content.appendChild(newTile);
                    }
                    break;
    
                case 'removed':
                    if (oldTile) oldTile.remove();
                    break;
            }
        } else { // propably just moved to another folder, so we can remove the tile from here
            if (oldTile) oldTile.remove();
        }
    }
    
    registerTileEventListeners() {
        chrome.bookmarks.onCreated.addListener((id, bookmark) => this.handleTileEvent('bookmarks', null, 'created', new Bookmark(bookmark)));
        chrome.bookmarks.onChanged.addListener(async (id, changeInfo) => this.handleTileEvent('bookmarks', id, 'updated', (await Bookmark.get(id))[0]));
        chrome.bookmarks.onMoved.addListener(async (id, moveInfo) => this.handleTileEvent('bookmarks', id, 'updated', (await Bookmark.get(id))[0]));
        chrome.bookmarks.onRemoved.addListener((id, removeInfo) => this.handleTileEvent('bookmarks', id, 'removed', null));
        // onChildrenReordered

        chrome.readingList.onEntryAdded.addListener((entry) => this.handleTileEvent('readingList', null, 'created', new Page(entry)));
        chrome.readingList.onEntryUpdated.addListener((entry) => this.handleTileEvent('readingList', entry.url, 'updated', new Page(entry)));
        chrome.readingList.onEntryRemoved.addListener((entry) => this.handleTileEvent('readingList', entry.url, 'removed', null));

        chrome.tabGroups.onCreated.addListener((group) => this.handleTileEvent('tabGroups', null, 'created', new Tab(group)));
        chrome.tabGroups.onUpdated.addListener((group) => this.handleTileEvent('tabGroups', group.id, 'updated', new Tab(group)));
        chrome.tabGroups.onMoved.addListener((group) => this.handleTileEvent('tabGroups', group.id, 'updated', new Tab(group)));
        chrome.tabGroups.onRemoved.addListener((group) => this.handleTileEvent('tabGroups', group.id, 'removed', null));

        chrome.tabs.onCreated.addListener((tab) => this.handleTileEvent('tabGroups', null, 'created', new Tab(tab)));
        chrome.tabs.onUpdated.addListener((id, changeInfo, tab) => this.handleTileEvent('tabGroups', id, 'updated', new Tab(tab)));
        chrome.tabs.onMoved.addListener(async (id, moveInfo) => this.handleTileEvent('tabGroups', id, 'updated', (await Tab.get(id))[0]));
        chrome.tabs.onRemoved.addListener((id, removeInfo) => this.handleTileEvent('tabGroups', id, 'removed', null));
        // onReplaced, onAttached, onDetached
    }

    // MARK: Search
    searchItems(query) {
        query = (query || '').trim().toLowerCase();

        const searchInput = document.getElementById('searchInput');
        searchInput.classList.toggle('active', query.length > 0);

        if (!query) return this.loadContent();
        const filtered = this.lastItems.filter(item =>
            item.title.toLowerCase().includes(query) ||
            (item.url && item.url.toLowerCase().includes(query))
        );

        this.renderItems(filtered);
    }

    registerSearchEventListeners() {
        const searchInput = document.getElementById('searchInput');

        searchInput.addEventListener('input', (e) => {
            this.searchItems(searchInput.value);
        });
        
        const searchIcon = document.getElementsByClassName('search-icon')[0];
        if (searchIcon) {
            searchIcon.addEventListener('click', (e) => {
                searchInput.focus();
            });
        }
    }

    // MARK: Keyboard navigation
    registerKeyboardNavigationEventListeners() {
        const content = document.getElementById('content');
        content.addEventListener('keydown', (e) => {
            const tiles = Array.from(content.getElementsByClassName('tile'));
            const index = tiles.indexOf(document.activeElement);
            if (index === -1) return;

            let nextIndex = index;

            switch (e.key) {
                case 'Backspace':
                    this.navigateToPath(this.currentPath.slice(0, -1));
                    break;
                case 'ArrowRight':
                    nextIndex = (index + 1) % tiles.length;
                    break;
                case 'ArrowLeft':
                    nextIndex = (index - 1 + tiles.length) % tiles.length;
                    break;
                case 'ArrowDown':
                    nextIndex = index + this.settings.gridCols;
                    if (nextIndex >= tiles.length) nextIndex = index; // optional: stay in place
                    break;
                case 'ArrowUp':
                    nextIndex = index - this.settings.gridCols;
                    if (nextIndex < 0) nextIndex = index; // optional: stay in place
                    break;
                default:
                    return; // Don't block other keys
            }

            tiles[nextIndex].focus();
            e.preventDefault();
        });
    }

    // MARK: Favicon
    getFaviconUrl(url) {
        try {
            switch (this.settings.faviconType) {
                case 'url':
                    const urlObj = new URL(url);
                    const domain = urlObj.hostname;
                    return this.settings.faviconUrl.replace('{domain}', domain);

                case 'none':
                default:
                    const faviconUrl = new URL(chrome.runtime.getURL('/_favicon/'));
                    faviconUrl.searchParams.set('pageUrl', url);
                    faviconUrl.searchParams.set('size', '48');
                    return faviconUrl.toString();
            }
        } catch (e) {
            return '';
        }
    }

    // MARK: Base tile
    createBaseTile(item) {
        const tile = document.createElement('button');
        tile.className = 'tile';
        tile.dataset.id = item.id ?? item.url;
        tile.dataset.type = item.constructor.name;

        const icon = document.createElement('span');
        icon.className = 'tile-icon';
        tile.appendChild(icon);

        const title = document.createElement('span');
        title.className = 'tile-title';
        title.textContent = item.title ?? '';
        tile.appendChild(title);

        const url = document.createElement('span');
        url.className = 'tile-url';
        try {
            const urlObj = new URL(item.url);
            url.textContent = urlObj.hostname;
        } catch (e) {
            url.textContent = item.url ?? '';
        }
        tile.appendChild(url);

        return tile;
    }

    // MARK: Simple tile
    createSimpleTile(item) {
        const tile = this.createBaseTile(item);
        tile.classList.add('item');

        const icon = tile.querySelector('.tile-icon');
        const favicon = document.createElement('img');
        favicon.src = this.getFaviconUrl(item.url);
        favicon.alt = item.title;
        favicon.onerror = (e) => {
            icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg"><use xlink:href="#item"></svg>';
        };
        icon.appendChild(favicon);

        tile.addEventListener('click', (e) => {
            item.open();
            e.preventDefault();
        });
        this.addEditButton(tile, item);
        this.addDeleteButton(tile, item);

        return tile;
    }

    // MARK: Group tile
    createGroupTile(item) {
        const tile = this.createBaseTile(item);
        tile.classList.add('folder');

        const icon = tile.querySelector('.tile-icon');
        icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg"><use xlink:href="#group"></svg>';
        if (item.color) {
            const color = item.getColor();
            icon.style.color = color;
        }

        tile.addEventListener('click', (e) => {
            this.currentPath.push({ id: item.id, title: item.title });
            this.navigateToPath(this.currentPath);
            e.preventDefault();
        });
        this.addEditButton(tile, item);
        this.addDeleteButton(tile, item);

        return tile;
    }

    // MARK: Create button
    createAddTile(parentId) {
        let item, title = '';
        switch (this.currentView) {
            case 'bookmarks':
                item = new Bookmark({ parentId });
                title = chrome.i18n.getMessage('new_bookmark');
                break;
            case 'readingList':
                item = new Page({ parentId });
                title = chrome.i18n.getMessage('new_page');
                break;
            case 'tabGroups':
                item = new Tab({ parentId });
                title = chrome.i18n.getMessage('new_tab');
                break;
        }
        if ((item instanceof Page || item instanceof Tab) && this.currentPath.length < 1) return;
        
        const tile = this.createBaseTile({ title: title });
        tile.classList.add('add');

        const icon = tile.querySelector('.tile-icon');
        icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg"><use xlink:href="#add"></svg>';
        
        tile.addEventListener('click', (e) => {
            this.openEditItems(item, title);
        });

        return tile;
    }

    // MARK: Edit button
    addEditButton(tile, item) {
        if (item instanceof Tab || (item instanceof Page && !item.url)) return;

        let title = '';
        switch (this.currentView) {
            case 'bookmarks':   
                title = chrome.i18n.getMessage('edit_bookmark');
                break;
            case 'readingList': 
                title = chrome.i18n.getMessage('edit_page');
                break;
            case 'tabGroups':   
                title = chrome.i18n.getMessage('edit_tab');
                break;
        }
        const editBtn = document.createElement('button');
        editBtn.className = 'tile-edit-btn';
        editBtn.title = chrome.i18n.getMessage('edit');
        editBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg"><use xlink:href="#edit"></svg>';
        editBtn.addEventListener('click', (e) => {
            this.openEditItems(item, title);
            e.stopPropagation();
        });

        tile.appendChild(editBtn);
    }

    // MARK: Delete button
    addDeleteButton(tile, item) {
        if ((item instanceof Tab || item instanceof Page) && !item.url) return;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'tile-delete-btn';
        deleteBtn.title = chrome.i18n.getMessage('delete');
        deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg"><use xlink:href="#trash"></svg>';
        deleteBtn.addEventListener('click', (e) => {
            if (confirm(chrome.i18n.getMessage('delete_item_confirm', item.title))) {
                item.remove();
            }
            e.stopPropagation();
        });

        tile.appendChild(deleteBtn);
    }

    // MARK: Settings modal
    openSettings() {
        const modal = document.getElementById('settingsModal');

        const form = modal.firstElementChild;
        form.gridCols.value = this.settings.gridCols;
        form.backgroundType.value = this.settings.backgroundType;
        form.backgroundUrl.value = this.settings.backgroundUrl;
        form.backgroundFile.value = this.settings.backgroundFile;
        form.faviconType.value = this.settings.faviconType;
        form.faviconUrl.value = this.settings.faviconUrl;
        this.createBookmarksDefaultPathOptions(form);
        this.createTabGroupsDefaultPathOptions(form);
        this.createReadingListDefaultPathOptions(form);
        this.toggleBackgroundInputs(form);
        this.toggleBackgroundImage(form);
        this.toggleFaviconInputs(form);

        modal.showModal();
    }

    registerSettingsFormEventListeners() {
        const modal = document.getElementById('settingsModal');
        const form = modal.firstElementChild;

        form.backgroundType.addEventListener('change', (e) => {
            this.toggleBackgroundInputs(form);
        });
        
        form.faviconType.addEventListener('change', (e) => {
            this.toggleFaviconInputs(form);
        });
            
        const fileInput = document.getElementById('backgroundFileImport');
        fileInput.addEventListener('change', (e) => {
            const file = fileInput.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (evt) => {
                form.backgroundFile.value = evt.target.result;
                this.toggleBackgroundImage(form);
            };
            reader.readAsDataURL(file);
        });
    }

    async createBookmarksDefaultPathOptions(form) {
        const target = form.defaultPath_bookmarks;
        const defaultValue = this.settings.defaultPath_bookmarks;
        
        let items = [];
        if (Permissions.hasAccessTo(['bookmarks'])) {
            items = await Bookmark.list();
        }
        this.createSelectOptions(target, items, defaultValue);
    }

    async createTabGroupsDefaultPathOptions(form) {
        const target = form.defaultPath_tabGroups;
        const defaultValue = this.settings.defaultPath_tabGroups;
        
        let items = [];
        if (Permissions.hasAccessTo(['tabGroups'])) {
            items = await Tab.list();
        }
        this.createSelectOptions(target, items, defaultValue);
    }

    async createReadingListDefaultPathOptions(form) {
        const target = form.defaultPath_readingList;
        const defaultValue = this.settings.defaultPath_readingList;

        let items = [];
        if (Permissions.hasAccessTo(['readingList'])) {
            items = await Page.list();
        }
        this.createSelectOptions(target, items, defaultValue);
    }

    createSelectOptions(target, items, defaultValue) {
        target.innerHTML = '';
        for (const item of items) {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.title;
            option.selected = (defaultValue && defaultValue === item.id) ? true : undefined;
            target.appendChild(option);
        }
    }

    toggleBackgroundInputs(form) {
        const backgroundUrlGroup = document.getElementById('backgroundUrlGroup');
        const backgroundFileGroup = document.getElementById('backgroundFileGroup');
        backgroundUrlGroup.classList.toggle('hidden', form.backgroundType.value !== 'url');
        backgroundFileGroup.classList.toggle('hidden', form.backgroundType.value !== 'file');
    }

    toggleBackgroundImage(form) {
        document.getElementById('backgroundFileImport').nextElementSibling.style.backgroundImage = `url("${form.backgroundFile.value}")`;
    }

    toggleFaviconInputs(form) {
        const faviconUrlGroup = document.getElementById('faviconUrlGroup');
        faviconUrlGroup.classList.toggle('hidden', form.faviconType.value !== 'url');
    }

    async saveSettings(form) {
        const modal = form.parentElement;
        
        const newSettings = {
            defaultPath_bookmarks: form.defaultPath_bookmarks.value,
            defaultPath_tabGroups: form.defaultPath_tabGroups.value,
            defaultPath_readingList: form.defaultPath_readingList.value,
            gridCols: parseInt(form.gridCols.value),
            backgroundType: form.backgroundType.value,
            backgroundUrl: form.backgroundUrl.value,
            backgroundFile: form.backgroundFile.value,
            faviconType: form.faviconType.value,
            faviconUrl: form.faviconUrl.value,
        };
        await Settings.save(newSettings);
        this.applySettings(newSettings);
        // this.loadContent(); // force change favicons
        
        modal.close();
    }
    
    // MARK: Tabs
    initTabs() {
        const tabbed = document.querySelector('[data-toggle="tabbed"]');
        const tablist = tabbed.querySelector('ul');
        const tabs = tablist.querySelectorAll('a');
        const panels = tabbed.querySelectorAll('fieldset');
        
        const switchTab = (oldTab, newTab) => {
            newTab.focus();
            // Make the active tab focusable by the user (Tab key)
            newTab.removeAttribute('tabindex');
            // Set the selected state
            newTab.setAttribute('aria-selected', 'true');
            oldTab.removeAttribute('aria-selected');
            oldTab.setAttribute('tabindex', '-1');
            // Get the indices of the new and old tabs to find the correct
            // tab panels to show and hide
            let index = Array.prototype.indexOf.call(tabs, newTab);
            let oldIndex = Array.prototype.indexOf.call(tabs, oldTab);
            panels[oldIndex].hidden = true;
            panels[index].hidden = false;
        }
        
        tablist.setAttribute('role', 'tablist');
        
        // Add semantics are remove user focusability for each tab
        Array.prototype.forEach.call(tabs, (tab, i) => {
            tab.setAttribute('role', 'tab');
            tab.setAttribute('id', 'tab' + (i + 1));
            tab.setAttribute('tabindex', '-1');
            tab.parentNode.setAttribute('role', 'presentation');
            
            // Handle clicking of tabs for mouse users
            tab.addEventListener('click', e => {
            e.preventDefault();
            let currentTab = tablist.querySelector('[aria-selected]');
            if (e.currentTarget !== currentTab) {
                switchTab(currentTab, e.currentTarget);
            }
            });
            
            // Handle keydown events for keyboard users
            tab.addEventListener('keydown', e => {
            // Get the index of the current tab in the tabs node list
            let index = Array.prototype.indexOf.call(tabs, e.currentTarget);
            // Work out which key the user is pressing and
            // Calculate the new tab's index where appropriate
            let dir = e.which === 37 ? index - 1 : e.which === 39 ? index + 1 : e.which === 40 ? 'down' : null;
            if (dir !== null) {
                e.preventDefault();
                // If the down key is pressed, move focus to the open panel,
                // otherwise switch to the adjacent tab
                dir === 'down' ? panels[i].focus() : tabs[dir] ? switchTab(e.currentTarget, tabs[dir]) : void 0;
            }
            });
        });
        
        // Add tab panel semantics and hide them all
        Array.prototype.forEach.call(panels, (panel, i) => {
            panel.setAttribute('role', 'tabpanel');
            panel.setAttribute('tabindex', '-1');
            let id = panel.getAttribute('id');
            panel.setAttribute('aria-labelledby', tabs[i].id);
            panel.hidden = true; 
        });
        
        // Initially activate the first tab and reveal the first tab panel
        tabs[0].removeAttribute('tabindex');
        tabs[0].setAttribute('aria-selected', 'true');
        panels[0].hidden = false;
    }
    
    // MARK: Item modal
    openEditItems(item, title) {
        const modal = document.getElementById('itemModal');
        modal.querySelector('.modal-title').textContent = title;

        this.activeElement = item;

        const form = modal.firstElementChild;
        form.title.value = item.title || '';
        form.url.value = item.url || '';
        form.parentId.value = item.parentId;

        modal.showModal();
    }

    async saveItem(form) {
        const modal = form.parentElement;

        const item = this.activeElement;

        const title = form.title.value.trim();
        const url = form.url.value.trim();
        const parentId = form.parentId.value;

        await item.save({ title, url, parentId });

        modal.close();
    }

}

// MARK: Entry point
document.addEventListener('DOMContentLoaded', (e) => {
    new UI();
});