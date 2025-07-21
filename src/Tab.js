export class Tab {

    constructor({ url, title, id, index, groupId, windowId, color, lastAccessed, children }) {
        this.title = title;
        this.url = url;
        this.id = id;
        this.index = index;
        this.parentId = groupId;
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
    }

    static async all() {
        return [
            new this({ 
                id: '',
                title: chrome.i18n.getMessage('root_folder'), 
                children: this.find().map(item => {
                    item.children = this.find(item.id);
                    return item;
                })
            })
        ];
    }

    static async list() {
        const items = await chrome.tabGroups.query({});
        items.push({
            id: -1,
            title: chrome.i18n.getMessage('ungrouped_tabs')
        });
        return [
            { id: '', title: chrome.i18n.getMessage('root_folder') },
            ...(items.map(({id, title}) => ({
                id: id, 
                title: ' '.repeat(1 * 2) + title
            })))
        ];
    }

    static async find(parentId = '') {
        let items = [];
        if (parentId === '') {
            items = (await chrome.tabGroups.query({}));
            items.push({
                id: -1,
                title: chrome.i18n.getMessage('ungrouped_tabs'),
            });
        } else {
            items = (await chrome.tabs.query({ groupId: parseInt(parentId) }));
        }
        return items.map(item => new this(item)) || [];
    }

    static async get(id) {
        return await chrome.tabs.get(id);
    }
    
    async save({ url, active }) {
        if (!this.id) {
            await chrome.tabs.create({ url, active });
        } else {
            await chrome.tabs.update(this.id, { active });
        }
    }

    async remove() {
        if (!this.url) { // group
            // tab groups can't be removed
        } else {
            await chrome.tabs.remove(this.id);
        }
    }

    async open() {
        if (!this.url) { // group
            await chrome.tabGroups.update(this.id, { collapsed: false });
        } else {
            await chrome.tabs.update(this.id, { active: true });
        }
        window.close();
        /*
        chrome.tabs.query({ groupId: group.id }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.update(tabs[0].id, { active: true });
            }
        });
        */
    }

    getColor() {
        const colors = {
            'grey': '#5f6368',
            'blue': '#1a73e8',
            'red': '#d93025',
            'yellow': '#fbbc04',
            'green': '#34a853',
            'pink': '#ff6d01',
            'purple': '#9c27b0',
            'cyan': '#00bcd4'
        };
        return colors[this.color] || '#5f6368';
    }

}