export class Settings {

    static defaults = {
        backgroundType:             'none',
        backgroundUrl:              'https://picsum.photos/1920/1080',
        backgroundFile:             null,
        faviconType:                'none',
        faviconUrl:                 'https://www.google.com/s2/favicons?domain={domain}&sz=64',
        gridCols:                   6,
        defaultView:                'bookmarks',
        defaultPath_bookmarks:      '',
        defaultPath_tabGroups:      '',
        defaultPath_readingList:    '',
    };

    static async find(keys = []) {
        return {
          ...await chrome.storage.sync.get(keys),
          ...await chrome.storage.local.get(keys),
        };
    }

    static async get(key) {
        return await Settings.find([key])[key];
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
            'backgroundUrl',
            'faviconType',
            'faviconUrl',
            'gridCols',
            'defaultPath_bookmarks',
            'defaultPath_tabGroups',
            'defaultPath_readingList',
        ]);
        if (Object.keys(syncSettings).length > 0) {
            await this.set(syncSettings, true);
        }

        const localSettings = this.filter(settings, [
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