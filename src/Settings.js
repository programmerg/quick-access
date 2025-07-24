export class Settings {

    static defaults = {
        firstRun:                   true,
        backgroundType:             'none',
        backgroundColor:            '#f8f7f4',
        backgroundUrl:              'https://picsum.photos/1920/1080',
        backgroundFile:             null,
        faviconType:                'none',
        faviconUrl:                 'https://www.google.com/s2/favicons?domain={domain}&sz=64',
        gridCols:                   6,
        defaultView:                '',
        defaultPath_bookmarks:      '',
        defaultPath_tabGroups:      '',
        defaultPath_readingList:    '',
        tileAdd:                    true,
        tileEditAndDelete:          true,
        tileReorder:                true,
        theme: `
            :root {
                --border-radius: 8px;
                --border-radius-lg: 16px;
                --border-radius-xl: 50px;
                --color-danger: rgb(220, 53, 69);
                --color-danger-hover: rgb(201, 48, 63);
                --color-primary: rgb(0, 123, 255);
                --color-primary-hover: rgb(0, 86, 179);
                --color-secondary: rgba(108, 117, 125, 0.9);
                --color-secondary-hover: rgba(108, 117, 125, 0.3);
                --color-tile-icon: rgb(95, 99, 104);
                --color-overlay: rgba(32, 33, 36, 0.1);
            }
            .light {
                --color-base: 255, 255, 255;
                --color-inverse: 60, 60, 60;
                --color-bg: rgba(248, 247, 244, 1);
                --color-text: rgba(var(--color-inverse), 1);
                --color-muted: rgba(102, 102, 102, 1);
                --color-muted-hover: rgba(var(--color-inverse), 0.05);
            }
            .dark {
                --color-base: 60, 60, 60;
                --color-inverse: 255, 255, 255;
                --color-bg: rgba(var(--color-base), 1);
                --color-text: rgba(var(--color-inverse), 1);
                --color-muted: rgba(102, 102, 102, 1);
                --color-muted-hover: rgba(var(--color-inverse), 0.05);
            }
        `.replaceAll('            ', '')
    };

    static async find(keys = []) {
        return {
          ...await chrome.storage.sync.get(keys),
          ...await chrome.storage.local.get(keys),
        };
    }

    static async get(key) {
        return (await Settings.find([key]))[key];
    }

    static async set(object, sync = false) {
        if (sync) {
            await chrome.storage.sync.set(object);
        } else {
            await chrome.storage.local.set(object);
        }
    }

    static async save(settings) {
        const syncSettings = this.filter(settings, [
            'backgroundType',
            'backgroundColor',
            'backgroundUrl',
            'faviconType',
            'faviconUrl',
            'gridCols',
            'defaultPath_bookmarks',
            'defaultPath_tabGroups',
            'defaultPath_readingList',
            'tileAdd',
            'tileEditAndDelete',
            'tileReorder',
            'theme',
        ]);
        if (Object.keys(syncSettings).length > 0) {
            await this.set(syncSettings, true);
        }

        const localSettings = this.filter(settings, [
            'firstRun',
            'defaultView',
            'backgroundFile',
        ]);
        if (Object.keys(localSettings).length > 0) {
            await this.set(localSettings, false);
        }
    }

    static filter(settings, allowed) {
        return Object.keys(settings)
            .filter(key => allowed.includes(key))
            .reduce((obj, key) => {
              obj[key] = settings[key];
              return obj;
            }, {});
    }

    static async delete(keys = []) {
        await chrome.storage.sync.remove(keys);
        await chrome.storage.local.remove(keys);
    }
    
    static async all() {
        return await Settings.find(null);
    }
    
    static async clear() {
        await chrome.storage.sync.clear();
        await chrome.storage.local.clear();
    }
}