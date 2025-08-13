export class Tab {

    constructor({ url, title, id, index, parentId, groupId, windowId, color, lastAccessed, children }) {
        this.title = title;
        this.url = (url !== undefined) ? url : '';
        this.id = id;
        this.index = index;
        this.parentId = String((parentId !== undefined) ? parentId : (groupId ?? ''));
        this.createdAt = null;          // missing
        this.updatedAt = lastAccessed;
        this.color = color;
        this.children = children;
        this.windowId = windowId;
        this.groupId = groupId;
        // collapsed
        // shared
        // active
        // audible
        // autoDiscardable
        // discarded
        // favIconUrl
        // frozen
        // height
        // highlighted
        // incognito
        // mutedInfo
        // pinned
        // selected
        // status
        // width

        if (this.parentId == -1) this.parentId = '';
    }

    static async all() {
        return [
            new this({ 
                id: '',
                title: browser.i18n?.getMessage('root_folder'), 
                children: (await this.find()).map(async (item) => {
                    item.children = await this.find(item.id);
                    return item;
                })
            })
        ];
    }

    static async list() {
        const results = await browser.tabGroups?.query({}) ?? [];
        // results.push({ id: -1, title: browser.i18n?.getMessage('ungrouped_tabs') });

        return [
            { id: '', title: browser.i18n?.getMessage('root_folder') },
            ...(results.map(({id, title}) => ({ id: id, title: ' '.repeat(1 * 2) + title })))
        ];
    }

    static async find(parentId = '') {
        const currentWindow = browser.windows?.WINDOW_ID_CURRENT;
        let results = [];

        if (parentId === '') {
            const tabGroups = await browser.tabGroups?.query({ windowId: currentWindow });
            const tabs = await browser.tabs?.query({ windowId: currentWindow, groupId: -1 });
            results = [
                ...tabGroups,
                ...tabs,
            ];
            // results.push({ id: -1, title: browser.i18n?.getMessage('ungrouped_tabs') });
        } else {
            results = await browser.tabs?.query({ windowId: currentWindow, groupId: parseInt(parentId) });
        }
        return results.map(item => new this(item)) ?? [];
    }

    static async get(id) {
        const tabs = await browser.tabs?.get(id);
        const tabGroups = await browser.tabGroups?.get(id);
        return new this(tabs ?? tabGroups);
    }
    
    async save({ title, url, parentId, index }) {
        const currentWindow = browser.windows?.WINDOW_ID_CURRENT;
        let result = {};

        if (!this.id) { // create
            if (!url) { // group
                const isFirefox = navigator.userAgent.indexOf("Firefox") != -1;
                const newTab = await browser.tabs?.create({ windowId: currentWindow, url: isFirefox ? 'about:newtab' : 'chrome://newtab', active: false });
                const newGroup = await browser.tabs?.group({ tabIds: [newTab.id], createProperties: { windowId: currentWindow } });
                result = await browser.tabGroups?.update(newGroup, { title });

            } else { // tab
                const newTab = await browser.tabs?.create({ windowId: currentWindow, url, active: false });
                if (parentId) { // attach to group
                    const groupId = await browser.tabs?.group({ tabIds: [newTab.id], groupId: Number(parentId) });
                    result = Tab.get(newTab);
                }
            }

        } else { // update
            if (!this.url) { // group
                if (index || parentId) { // move or reorder
                    if (parentId) return;
                    result = await browser.tabGroups?.move(this.id, { windowId: currentWindow, index: index ?? -1 });
                }

                if (title) { // edit
                    result = await browser.tabGroups?.update(this.id, { title });
                }

            } else { // tab
                if (parentId === '') {
                    await browser.tabs?.ungroup([this.id]);
                    result = Tab.get(this.id);
                }
                else if (parentId) { // move to another group
                    const groupId = await browser.tabs?.group({ tabIds: [this.id], groupId: Number(parentId) });
                    result = Tab.get(this.id);
                }

                if (index) { // reorder
                    result = await browser.tabs?.move(this.id, { windowId: currentWindow, index });
                }

                if (url) { // edit
                    result = await browser.tabs?.update(this.id, { url });
                }
            }
        }
        return Object.assign(this, result);
    }

    async remove() {
        if (!this.url) { // group
            const childTabs = await Tab.find(this.id);
            await childTabs.forEach(async (tab) => browser.tabs?.remove(tab.id));
        } else {
            await browser.tabs?.remove(this.id);
        }
    }

    async open(newTab = false) {
        if (!this.url) {
            await browser.tabGroups?.update(this.id, { collapsed: false });
        } else {
            await browser.tabs?.update(this.id, { active: true });
        }
        if (!newTab) window.close();
    }

    static colors = {
        'grey': '#5f6368',
        'blue': '#1a73e8',
        'red': '#d93025',
        'yellow': '#fbbc04',
        'green': '#34a853',
        'pink': '#ff6d01',
        'purple': '#9c27b0',
        'cyan': '#00bcd4'
    };

    getColor() {
        return Tab.colors[this.color] || '#5f6368';
    }

}