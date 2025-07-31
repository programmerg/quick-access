export class Page {

    constructor({ url, title, id, parentId, hasBeenRead, creationTime, lastUpdateTime, children }) {
        this.title = title;
        this.url = url;         // pkey
        this.id = id;           // missing
        this.index = null;      // missing
        this.parentId = parentId ? parentId : (hasBeenRead ? '1' : '0');
        this.createdAt = creationTime;
        this.updatedAt = lastUpdateTime;
        this.color = null;
        this.children = children;
        this.hasBeenRead = hasBeenRead; // not null
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
        return [
            { id: '', title: chrome.i18n.getMessage('root_folder') },
            { id: '0',  title: ' '.repeat(1 * 2) + chrome.i18n.getMessage('pages_unread') },
            { id: '1',  title: ' '.repeat(1 * 2) + chrome.i18n.getMessage('pages_read') },
        ];
    }
  
    static async find(parentId = '') {
        let items = [];
        if (parentId === '') {
            items = [
                { id: '0', title: chrome.i18n.getMessage('pages_unread') }, 
                { id: '1', title: chrome.i18n.getMessage('pages_read') }
            ];
        } else if (parentId === '0' || parentId === '1') {
            items = (await chrome.readingList.query({ hasBeenRead: (parentId === '1') ? true : false }));
        }
        return items.map(item => new this(item)) || [];
    }

    static async get(url) {
        return await chrome.readingList.get(url);
    }
    
    async save({ title, url, parentId }) {
        const hasBeenRead = (parentId === '1') ? true : false;
        if (!this.id) {
            await chrome.readingList.addEntry({ title, url, hasBeenRead });
        } else {
            await chrome.readingList.updateEntry({ url: this.url, hasBeenRead });
        }
    }
    
    async remove() {
        if (!this.url) {
            // page groups can't be deleted
        } else {
            await chrome.readingList.removeEntry({ url: this.url });
        }
    }

    open(newTab = false) {
        window.open(this.url, newTab ? '_blank' : '_self');
    }
}