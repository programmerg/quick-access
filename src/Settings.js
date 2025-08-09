export class Settings {

    constructor({
        firstRun, defaultView, defaultPath_bookmarks, defaultPath_readingList, defaultPath_tabGroups, defaultPath_history, backgroundFile, backgroundTime,
        backgroundColor, backgroundType, backgroundUrl, faviconType, faviconUrl, gridCols, tileAdd, tileEditAndDelete, tileReorder, theme
    }) {
        this.firstRun                   = Boolean(firstRun                  ?? true);
        this.defaultView                = String(defaultView                ?? '');
        this.defaultPath_bookmarks      = String(defaultPath_bookmarks      ?? '[]');
        this.defaultPath_readingList    = String(defaultPath_readingList    ?? '[]');
        this.defaultPath_tabGroups      = String(defaultPath_tabGroups      ?? '[]');
        this.defaultPath_history        = String(defaultPath_history        ?? '[]');
        this.backgroundColor            = String(backgroundColor            ?? '#000000');
        this.backgroundType             = String(backgroundType             ?? 'url'); // none, file
        this.backgroundUrl              = String(backgroundUrl              ?? 'https://picsum.photos/1920/1080');
        this.backgroundFile             = String(backgroundFile             ?? '');
        this.backgroundTime             = Number(backgroundTime             ?? '');
        this.faviconType                = String(faviconType                ?? 'none'); // url
        this.faviconUrl                 = String(faviconUrl                 ?? 'https://www.google.com/s2/favicons?domain={domain}&sz=64');
        this.gridCols                   = Number(gridCols                   ?? 5);
        this.tileAdd                    = Boolean(tileAdd                   ?? true);
        this.tileEditAndDelete          = Boolean(tileEditAndDelete         ?? true);
        this.tileReorder                = Boolean(tileReorder               ?? true);
        this.theme                      = String(theme                      ?? '');
    }
    
    static async all() {
        const results = await this.find(null);
        return results;
    }

    static async find(keys = []) {
        const sync = await browser.storage?.sync?.get(keys);
        const local = await browser.storage?.local?.get(keys);
        return new this({ ...sync, ...local });
    }

    static async get(key) {
        const results = await this.find([key]);
        return results[key];
    }

    static async set(object, sync = false) {
        let results = {};
        if (sync) {
            results = await browser.storage?.sync?.set(object);

        } else {
            results = await browser.storage?.local?.set(object);
        }
        return Object.assign(this, results);
    }

    static async save(settings) {
        const store = {
            sync: this.filter(settings, [
                'backgroundColor',
                'backgroundType',
                'backgroundUrl',
                'faviconType',
                'faviconUrl',
                'gridCols',
                'tileAdd',
                'tileEditAndDelete',
                'tileReorder',
                'theme',
            ]),
            local: this.filter(settings, [
                'firstRun',
                'defaultView',
                'defaultPath_bookmarks',
                'defaultPath_readingList',
                'defaultPath_tabGroups',
                'defaultPath_history',
                'backgroundFile',
                'backgroundTime',
            ])
        };

        if (Object.keys(store.sync).length > 0) {
            await this.set(store.sync, true);
        }
        if (Object.keys(store.local).length > 0) {
            await this.set(store.local, false);
        }
        return this;
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
        await browser.storage?.sync?.remove(keys);
        await browser.storage?.local?.remove(keys);
    }
    
    static async clear() {
        await browser.storage?.sync?.clear();
        await browser.storage?.local?.clear();
    }
}