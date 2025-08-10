export class Page {

    constructor({ url, title, id, parentId, hasBeenRead, creationTime, lastUpdateTime, children }) {
        this.title = title;
        this.url = url;         // pkey
        this.id = id ?? url;    // missing
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
                title: browser.i18n?.getMessage('root_folder'), 
                children: (await this.find()).map(async (item) => {
                    item.children = await this.find(item.id);
                    return item;
                })
            })
        ];
    }

    static async list() {
        return [
            { id: '', title: browser.i18n?.getMessage('root_folder') },
            { id: '0',  title: ' '.repeat(1 * 2) + browser.i18n?.getMessage('pages_unread') },
            { id: '1',  title: ' '.repeat(1 * 2) + browser.i18n?.getMessage('pages_read') },
        ];
    }
  
    static async find(parentId = '') {
        let results = [];
        if (parentId === '') {
            results = [
                { id: '0', title: browser.i18n?.getMessage('pages_unread') }, 
                { id: '1', title: browser.i18n?.getMessage('pages_read') }
            ];

        } else if (parentId === '0' || parentId === '1') {
            results = await browser.readingList?.query({ hasBeenRead: (parentId === '1') ? true : false });
        }
        return results.map(item => new this(item)) ?? [];
    }

    static async get(url) {
        const result = await browser.readingList?.get(url);
        return new this(result);
    }
    
    async save({ title, url, parentId }) {
        const hasBeenRead = (parentId === '1') ? true : false;
        let result = {};

        if (!this.id) { // create
            result = await browser.readingList?.addEntry({ title, url, hasBeenRead });
        
        } else { // edit
            result = await browser.readingList?.updateEntry({ url: this.url, hasBeenRead });
        }
        return Object.assign(this, result);
    }
    
    async remove() {
        if (!this.url) {
            // page groups can't be deleted
        } else {
            await browser.readingList?.removeEntry({ url: this.url });
        }
    }

    async open(newTab = false) {
        if (this.parentId !== '1') {
            await this.save({ parentId: '1' }); // mark as read
        }
        window.open(this.url, newTab ? '_blank' : '_self');
    }
}