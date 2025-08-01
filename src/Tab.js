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
        // items.push({
        //     id: -1,
        //     title: chrome.i18n.getMessage('ungrouped_tabs')
        // });
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
            items = [
                ...(await chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT })),
                ...(await chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT, groupId: -1 }))
            ];
            // items.push({
            //     id: -1,
            //     title: chrome.i18n.getMessage('ungrouped_tabs'),
            // });
        } else {
            items = (await chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT, groupId: parseInt(parentId) }));
        }
        return items.map(item => new this(item)) || [];
    }

    static async get(id) {
        return await chrome.tabs.get(id);
    }
    
    async save({ title, url, parentId, index }) {
        if (!this.id) { // create
            if (!url) { // group
                const newTab = await chrome.tabs.create({ windowId: chrome.windows.WINDOW_ID_CURRENT, url: 'chrome://newtab', active: false });
                const newGroup = await chrome.tabs.group({ tabIds: [newTab.id], createProperties: { windowId: chrome.windows.WINDOW_ID_CURRENT } });
                await chrome.tabGroups.update(newGroup, { title });

            } else { // tab
                const newTab = await chrome.tabs.create({ windowId: chrome.windows.WINDOW_ID_CURRENT, url, active: false });
                if (parentId) { // attach to group
                    await chrome.tabs.group({ tabIds: [newTab.id], groupId: Number(parentId) });
                }
            }

        } else { // update
            if (!this.url) {
                if (index || parentId) { // move or reorder
                    if (parentId) return;
                    await chrome.tabGroups.move(this.id, { windowId: chrome.windows.WINDOW_ID_CURRENT, index: index ?? -1 });
                }

                if (title) { // edit
                    await chrome.tabGroups.update(this.id, { title });
                }

            } else {
                if (parentId === '') {
                    await chrome.tabs.ungroup([this.id]);
                }
                else if (parentId) { // move to another group
                    await chrome.tabs.group({ tabIds: [this.id], groupId: Number(parentId) });
                }

                if (index) { // reorder
                    await chrome.tabs.move(this.id, { windowId: chrome.windows.WINDOW_ID_CURRENT, index });
                }

                if (url) { // edit
                    await chrome.tabs.update(this.id, { url });
                }
            }
        }
    }

    async remove() {
        if (!this.url) { // group
            const childTabs = await Tab.find(this.id);
            childTabs.forEach(tab => chrome.tabs.remove(tab.id));
        } else {
            await chrome.tabs.remove(this.id);
        }
    }

    async open(newTab = false) {
        if (!this.url) {
            await chrome.tabGroups.update(this.id, { collapsed: false });
        } else {
            await chrome.tabs.update(this.id, { active: true });
        }
        if (!newTab) window.close();
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